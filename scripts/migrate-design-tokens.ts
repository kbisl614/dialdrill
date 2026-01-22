#!/usr/bin/env npx tsx
/**
 * Design System Migration Script
 *
 * Automatically migrates hard-coded color values to design system tokens.
 *
 * Usage:
 *   npx tsx scripts/migrate-design-tokens.ts --dry-run  # Preview changes
 *   npx tsx scripts/migrate-design-tokens.ts            # Apply changes
 *   npx tsx scripts/migrate-design-tokens.ts --path components/  # Specific path
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

// =============================================================================
// CONFIGURATION
// =============================================================================

interface MigrationRule {
  pattern: RegExp;
  replacement: string;
  description: string;
}

// Color migrations: hard-coded hex → Tailwind theme class
const COLOR_MIGRATIONS: MigrationRule[] = [
  // Cyan colors
  {
    pattern: /\[#00d9ff\]/g,
    replacement: '[var(--color-cyan-bright)]',
    description: 'Cyan bright (use bg-cyan-bright, text-cyan-bright, etc.)',
  },
  {
    pattern: /\[#06d9d7\]/g,
    replacement: '[var(--color-cyan-bright)]',
    description: 'Cyan bright alt',
  },
  {
    pattern: /\[#05c4c2\]/g,
    replacement: '[var(--color-cyan-bright-hover)]',
    description: 'Cyan hover',
  },
  {
    pattern: /\[#0f9b99\]/g,
    replacement: '[var(--color-cyan-muted)]',
    description: 'Cyan muted',
  },
  {
    pattern: /\[#0d7a78\]/g,
    replacement: '[var(--color-cyan-dark)]',
    description: 'Cyan dark',
  },

  // Purple colors
  {
    pattern: /\[#a855f7\]/g,
    replacement: '[var(--color-purple)]',
    description: 'Purple',
  },
  {
    pattern: /\[#9333ea\]/g,
    replacement: '[var(--color-purple-dark)]',
    description: 'Purple dark',
  },
  {
    pattern: /\[#d946ef\]/g,
    replacement: '[var(--color-magenta)]',
    description: 'Magenta',
  },

  // Background colors
  {
    pattern: /\[#080d1a\]/g,
    replacement: '[var(--color-dark-bg)]',
    description: 'Dark background',
  },
  {
    pattern: /\[#050911\]/g,
    replacement: '[var(--color-darker-bg)]',
    description: 'Darker background',
  },

  // Border colors
  {
    pattern: /\[#1e293b\]/g,
    replacement: '[var(--color-border-subtle)]',
    description: 'Border subtle (slate-800)',
  },
  {
    pattern: /\[#334155\]/g,
    replacement: '[var(--color-border-medium)]',
    description: 'Border medium (slate-700)',
  },

  // Text colors
  {
    pattern: /\[#94a3b8\]/g,
    replacement: '[var(--color-text-secondary)]',
    description: 'Text secondary',
  },
  {
    pattern: /\[#64748b\]/g,
    replacement: '[var(--color-text-muted)]',
    description: 'Text muted',
  },
  {
    pattern: /\[#9ca3af\]/g,
    replacement: '[var(--color-text-secondary)]',
    description: 'Text secondary (gray-400)',
  },

  // Semantic colors
  {
    pattern: /\[#22c55e\]/g,
    replacement: '[var(--color-green)]',
    description: 'Success green',
  },
  {
    pattern: /\[#ef4444\]/g,
    replacement: '[var(--color-error)]',
    description: 'Error red',
  },
  {
    pattern: /\[#f59e0b\]/g,
    replacement: '[var(--color-warning)]',
    description: 'Warning amber',
  },
];

// Gradient migrations
const GRADIENT_MIGRATIONS: MigrationRule[] = [
  {
    pattern: /from-\[#00d9ff\]\s+to-\[#00ffea\]/g,
    replacement: 'from-cyan-bright to-[#00ffea]',
    description: 'Cyan gradient',
  },
  {
    pattern: /from-\[rgba\(15,\s*23,\s*42,\s*[\d.]+\)\]/g,
    replacement: 'from-card-bg',
    description: 'Card background gradient',
  },
];

// =============================================================================
// MIGRATION LOGIC
// =============================================================================

interface MigrationResult {
  file: string;
  changes: {
    line: number;
    before: string;
    after: string;
    rule: string;
  }[];
}

function migrateFile(filePath: string, dryRun: boolean): MigrationResult | null {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const changes: MigrationResult['changes'] = [];

  let newContent = content;
  const allRules = [...COLOR_MIGRATIONS, ...GRADIENT_MIGRATIONS];

  for (const rule of allRules) {
    const matches = content.match(rule.pattern);
    if (matches) {
      // Find line numbers for each match
      lines.forEach((line, index) => {
        if (rule.pattern.test(line)) {
          const newLine = line.replace(rule.pattern, rule.replacement);
          if (line !== newLine) {
            changes.push({
              line: index + 1,
              before: line.trim(),
              after: newLine.trim(),
              rule: rule.description,
            });
          }
        }
      });

      newContent = newContent.replace(rule.pattern, rule.replacement);
    }
  }

  if (changes.length === 0) {
    return null;
  }

  if (!dryRun) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
  }

  return {
    file: filePath,
    changes,
  };
}

async function runMigration(targetPath: string, dryRun: boolean): Promise<void> {
  console.log('\n🎨 Design System Migration Tool\n');
  console.log(dryRun ? '📋 DRY RUN - No files will be modified\n' : '🔧 APPLYING CHANGES\n');

  // Find all TSX/JSX files
  const files = await glob(`${targetPath}/**/*.{tsx,jsx,ts,js}`, {
    ignore: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/scripts/**',
      '**/eslint-plugins/**',
    ],
  });

  console.log(`Found ${files.length} files to check...\n`);

  const results: MigrationResult[] = [];
  let totalChanges = 0;

  for (const file of files) {
    const result = migrateFile(file, dryRun);
    if (result) {
      results.push(result);
      totalChanges += result.changes.length;
    }
  }

  // Print results
  if (results.length === 0) {
    console.log('✅ No migrations needed! All files are using design tokens.\n');
    return;
  }

  console.log(`Found ${totalChanges} changes across ${results.length} files:\n`);

  for (const result of results) {
    console.log(`\n📄 ${result.file}`);
    console.log('─'.repeat(60));

    for (const change of result.changes) {
      console.log(`  Line ${change.line}: ${change.rule}`);
      console.log(`  - ${change.before.substring(0, 80)}${change.before.length > 80 ? '...' : ''}`);
      console.log(`  + ${change.after.substring(0, 80)}${change.after.length > 80 ? '...' : ''}`);
      console.log('');
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log(`📊 Summary: ${totalChanges} changes in ${results.length} files`);

  if (dryRun) {
    console.log('\n💡 Run without --dry-run to apply these changes');
  } else {
    console.log('\n✅ All changes applied successfully!');
  }

  // Generate report
  const reportPath = path.join(process.cwd(), 'migration-report.json');
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        dryRun,
        totalFiles: files.length,
        filesChanged: results.length,
        totalChanges,
        results,
      },
      null,
      2
    )
  );
  console.log(`\n📝 Report saved to: ${reportPath}\n`);
}

// =============================================================================
// CLI
// =============================================================================

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const pathIndex = args.indexOf('--path');
const targetPath = pathIndex !== -1 ? args[pathIndex + 1] : '.';

runMigration(targetPath, dryRun).catch(console.error);
