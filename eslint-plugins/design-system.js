/**
 * ESLint Plugin: Design System Enforcement
 *
 * Flags hard-coded color values and encourages use of design tokens.
 *
 * Installation:
 * 1. Add to eslint.config.js:
 *    import designSystemPlugin from './eslint-plugins/design-system.js';
 *
 *    export default [
 *      {
 *        plugins: { 'design-system': designSystemPlugin },
 *        rules: {
 *          'design-system/no-hardcoded-colors': 'warn',
 *          'design-system/no-arbitrary-spacing': 'warn',
 *        }
 *      }
 *    ];
 */

// Known design system colors that should be used via tokens
const DESIGN_SYSTEM_COLORS = {
  '#00d9ff': 'cyan-bright',
  '#06d9d7': 'cyan-bright-alt',
  '#05c4c2': 'cyan-hover',
  '#0f9b99': 'cyan-muted',
  '#0d7a78': 'cyan-dark',
  '#a855f7': 'purple',
  '#9333ea': 'purple-dark',
  '#d946ef': 'magenta',
  '#080d1a': 'dark-bg',
  '#050911': 'darker-bg',
  '#1e293b': 'border-subtle',
  '#334155': 'border-medium',
  '#94a3b8': 'text-secondary',
  '#64748b': 'text-muted',
  '#22c55e': 'success',
  '#ef4444': 'error',
  '#f59e0b': 'warning',
};

// Hex color pattern (matches #rgb, #rrggbb, #rrggbbaa)
const HEX_COLOR_REGEX = /#([0-9a-fA-F]{3}){1,2}([0-9a-fA-F]{2})?/g;

// rgba pattern
const RGBA_REGEX = /rgba?\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+)?\s*\)/g;

// Tailwind arbitrary color pattern [#...]
const TAILWIND_ARBITRARY_COLOR_REGEX = /\[#[0-9a-fA-F]{3,8}\]/g;

/**
 * Rule: no-hardcoded-colors
 * Flags hard-coded hex colors in JSX and suggests design token alternatives.
 */
const noHardcodedColors = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow hard-coded color values, use design tokens instead',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      hardcodedColor:
        'Hard-coded color "{{color}}" detected. Use design token "{{suggestion}}" instead.',
      unknownHardcodedColor:
        'Hard-coded color "{{color}}" detected. Consider adding to design system or use existing token.',
      arbitraryTailwindColor:
        'Arbitrary Tailwind color "{{color}}" detected. Use theme color class instead (e.g., bg-cyan-bright).',
    },
  },

  create(context) {
    function checkForColors(node, value, isClassName = false) {
      if (typeof value !== 'string') return;

      // Check for Tailwind arbitrary colors in classNames
      if (isClassName) {
        const arbitraryMatches = value.match(TAILWIND_ARBITRARY_COLOR_REGEX);
        if (arbitraryMatches) {
          arbitraryMatches.forEach((match) => {
            const hexColor = match.slice(1, -1).toLowerCase(); // Remove [ and ]
            const suggestion = DESIGN_SYSTEM_COLORS[hexColor];

            context.report({
              node,
              messageId: suggestion ? 'hardcodedColor' : 'arbitraryTailwindColor',
              data: {
                color: match,
                suggestion: suggestion || 'a design token',
              },
            });
          });
        }
      }

      // Check for hex colors
      const hexMatches = value.match(HEX_COLOR_REGEX);
      if (hexMatches) {
        hexMatches.forEach((color) => {
          const normalizedColor = color.toLowerCase();
          const suggestion = DESIGN_SYSTEM_COLORS[normalizedColor];

          // Skip if inside a Tailwind arbitrary value (already handled above)
          if (isClassName && value.includes(`[${color}]`)) return;

          // Skip CSS variable references
          if (value.includes('var(--')) return;

          context.report({
            node,
            messageId: suggestion ? 'hardcodedColor' : 'unknownHardcodedColor',
            data: {
              color,
              suggestion: suggestion || 'N/A',
            },
          });
        });
      }
    }

    return {
      // Check JSX attributes
      JSXAttribute(node) {
        if (!node.value) return;

        const attrName = node.name.name;

        // Check className for arbitrary colors
        if (attrName === 'className') {
          if (node.value.type === 'Literal' && typeof node.value.value === 'string') {
            checkForColors(node, node.value.value, true);
          }
          if (node.value.type === 'JSXExpressionContainer') {
            // Handle template literals
            if (node.value.expression.type === 'TemplateLiteral') {
              node.value.expression.quasis.forEach((quasi) => {
                checkForColors(node, quasi.value.raw, true);
              });
            }
          }
        }

        // Check style attribute for colors
        if (attrName === 'style' && node.value.type === 'JSXExpressionContainer') {
          const expr = node.value.expression;
          if (expr.type === 'ObjectExpression') {
            expr.properties.forEach((prop) => {
              if (prop.value && prop.value.type === 'Literal') {
                checkForColors(prop, prop.value.value);
              }
            });
          }
        }
      },

      // Check object properties (for style objects)
      Property(node) {
        if (node.value && node.value.type === 'Literal' && typeof node.value.value === 'string') {
          // Only check color-related properties
          const colorProps = [
            'color',
            'backgroundColor',
            'borderColor',
            'fill',
            'stroke',
            'boxShadow',
            'textShadow',
          ];
          if (node.key.name && colorProps.includes(node.key.name)) {
            checkForColors(node, node.value.value);
          }
        }
      },
    };
  },
};

/**
 * Rule: no-arbitrary-spacing
 * Flags arbitrary spacing values in Tailwind classes.
 */
const noArbitrarySpacing = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow arbitrary spacing values in Tailwind classes',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      arbitrarySpacing:
        'Arbitrary spacing "{{value}}" detected. Use standard Tailwind spacing (p-1 through p-24) or design tokens.',
    },
  },

  create(context) {
    // Pattern for arbitrary spacing: p-[10px], m-[2rem], gap-[20px], etc.
    const ARBITRARY_SPACING_REGEX =
      /(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|space-x|space-y|w|h|min-w|min-h|max-w|max-h)-\[\d+(?:px|rem|em|%|vh|vw)\]/g;

    function checkForArbitrarySpacing(node, value) {
      if (typeof value !== 'string') return;

      const matches = value.match(ARBITRARY_SPACING_REGEX);
      if (matches) {
        matches.forEach((match) => {
          context.report({
            node,
            messageId: 'arbitrarySpacing',
            data: { value: match },
          });
        });
      }
    }

    return {
      JSXAttribute(node) {
        if (node.name.name !== 'className' || !node.value) return;

        if (node.value.type === 'Literal') {
          checkForArbitrarySpacing(node, node.value.value);
        }
        if (node.value.type === 'JSXExpressionContainer') {
          if (node.value.expression.type === 'TemplateLiteral') {
            node.value.expression.quasis.forEach((quasi) => {
              checkForArbitrarySpacing(node, quasi.value.raw);
            });
          }
        }
      },
    };
  },
};

/**
 * Rule: prefer-design-patterns
 * Suggests using design system patterns for common UI elements.
 */
const preferDesignPatterns = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Suggest using design system patterns for common UI elements',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      useCardPattern:
        'Consider using `patterns.card` or `patterns.cardGlow` from design system for card styling.',
      useButtonPattern:
        'Consider using `patterns.buttonPrimary` or `patterns.buttonSecondary` from design system.',
    },
  },

  create(context) {
    // Patterns that suggest card styling
    const CARD_PATTERNS = [
      /rounded-2xl.*border.*bg-gradient/,
      /border.*rounded.*bg-\[rgba\(15/,
    ];

    // Patterns that suggest button styling
    const BUTTON_PATTERNS = [
      /bg-gradient.*from-\[#00d9ff\]/,
      /bg-gradient.*from-cyan/,
    ];

    function checkPatterns(node, value) {
      if (typeof value !== 'string') return;

      CARD_PATTERNS.forEach((pattern) => {
        if (pattern.test(value)) {
          context.report({
            node,
            messageId: 'useCardPattern',
          });
        }
      });

      BUTTON_PATTERNS.forEach((pattern) => {
        if (pattern.test(value)) {
          context.report({
            node,
            messageId: 'useButtonPattern',
          });
        }
      });
    }

    return {
      JSXAttribute(node) {
        if (node.name.name !== 'className' || !node.value) return;

        if (node.value.type === 'Literal') {
          checkPatterns(node, node.value.value);
        }
      },
    };
  },
};

// Export the plugin
const plugin = {
  meta: {
    name: 'eslint-plugin-design-system',
    version: '1.0.0',
  },
  rules: {
    'no-hardcoded-colors': noHardcodedColors,
    'no-arbitrary-spacing': noArbitrarySpacing,
    'prefer-design-patterns': preferDesignPatterns,
  },
  configs: {
    recommended: {
      plugins: ['design-system'],
      rules: {
        'design-system/no-hardcoded-colors': 'warn',
        'design-system/no-arbitrary-spacing': 'off',
        'design-system/prefer-design-patterns': 'off',
      },
    },
    strict: {
      plugins: ['design-system'],
      rules: {
        'design-system/no-hardcoded-colors': 'error',
        'design-system/no-arbitrary-spacing': 'warn',
        'design-system/prefer-design-patterns': 'warn',
      },
    },
  },
};

export default plugin;
