#!/bin/bash

echo "DialDrill Dev Data Reset"
echo "========================"
echo ""

# Safety check - don't run in production
if [ "$NODE_ENV" = "production" ]; then
  echo "ERROR: Cannot run in production environment!"
  exit 1
fi

echo "This will reset development data in your database."
echo ""
echo "Options:"
echo ""
echo "  1. Clear call_logs (remove all practice calls)"
echo "  2. Reset user stats (zero out scores, streaks, badges)"
echo "  3. Clear notifications"
echo "  4. Full reset (all of the above)"
echo "  Q. Quit"
echo ""

read -p "Enter choice: " choice

case "${choice^^}" in
  1)
    echo ""
    read -p "Are you sure you want to delete all call logs? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
      echo "Clearing call_logs..."
      npx ts-node --transpile-only -e "
        require('dotenv').config({ path: '.env.local' });
        const { pool } = require('./lib/db');
        pool().query('DELETE FROM call_logs').then(() => {
          console.log('✓ Call logs cleared');
          process.exit(0);
        }).catch(e => { console.error(e); process.exit(1); });
      "
    else
      echo "Cancelled."
    fi
    ;;
  2)
    echo ""
    read -p "Are you sure you want to reset all user stats? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
      echo "Resetting user stats..."
      npx ts-node --transpile-only -e "
        require('dotenv').config({ path: '.env.local' });
        const { pool } = require('./lib/db');
        pool().query(\`
          UPDATE users SET
            power_level = 0,
            current_tier = 'Bronze',
            current_belt = 'White',
            current_streak = 0,
            longest_streak = 0,
            streak_multiplier = 1.00,
            total_calls = 0,
            total_minutes = 0,
            total_badges_earned = 0
        \`).then(() => {
          console.log('✓ User stats reset');
          process.exit(0);
        }).catch(e => { console.error(e); process.exit(1); });
      "
    else
      echo "Cancelled."
    fi
    ;;
  3)
    echo ""
    read -p "Are you sure you want to clear all notifications? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
      echo "Clearing notifications..."
      npx ts-node --transpile-only -e "
        require('dotenv').config({ path: '.env.local' });
        const { pool } = require('./lib/db');
        pool().query('DELETE FROM notifications').then(() => {
          console.log('✓ Notifications cleared');
          process.exit(0);
        }).catch(e => { console.error(e); process.exit(1); });
      "
    else
      echo "Cancelled."
    fi
    ;;
  4)
    echo ""
    echo "WARNING: This will clear ALL development data!"
    read -p "Type 'RESET ALL' to confirm: " confirm
    if [ "$confirm" = "RESET ALL" ]; then
      echo ""
      echo "Running full reset..."
      npx ts-node --transpile-only -e "
        require('dotenv').config({ path: '.env.local' });
        const { pool } = require('./lib/db');
        const db = pool();
        (async () => {
          await db.query('DELETE FROM call_logs');
          console.log('✓ Call logs cleared');
          await db.query('DELETE FROM notifications');
          console.log('✓ Notifications cleared');
          await db.query(\`
            UPDATE users SET
              power_level = 0,
              current_tier = 'Bronze',
              current_belt = 'White',
              current_streak = 0,
              longest_streak = 0,
              streak_multiplier = 1.00,
              total_calls = 0,
              total_minutes = 0,
              total_badges_earned = 0
          \`);
          console.log('✓ User stats reset');
          console.log('');
          console.log('Full reset complete!');
          process.exit(0);
        })().catch(e => { console.error(e); process.exit(1); });
      "
    else
      echo "Cancelled."
    fi
    ;;
  Q)
    echo "Cancelled."
    exit 0
    ;;
  *)
    echo "Invalid selection."
    exit 1
    ;;
esac
