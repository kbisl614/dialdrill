#!/bin/bash

echo "DialDrill Migration Runner"
echo "=========================="
echo ""

# Get list of migration files
MIGRATIONS_DIR="lib/migrations"
migrations=($(ls -1 "$MIGRATIONS_DIR"/*.ts 2>/dev/null | xargs -n1 basename | sed 's/.ts$//'))

if [ ${#migrations[@]} -eq 0 ]; then
  echo "No migrations found in $MIGRATIONS_DIR"
  exit 1
fi

echo "Available migrations:"
echo ""
for i in "${!migrations[@]}"; do
  echo "  $((i+1)). ${migrations[$i]}"
done
echo ""
echo "  A. Run ALL migrations"
echo "  Q. Quit"
echo ""

read -p "Enter number or A/Q: " choice

case "${choice^^}" in
  A)
    echo ""
    echo "Running all migrations..."
    echo ""
    for migration in "${migrations[@]}"; do
      echo "→ Running $migration..."
      npx ts-node --transpile-only "$MIGRATIONS_DIR/$migration.ts"
      if [ $? -eq 0 ]; then
        echo "  ✓ $migration complete"
      else
        echo "  ✗ $migration failed"
        exit 1
      fi
    done
    echo ""
    echo "All migrations complete!"
    ;;
  Q)
    echo "Cancelled."
    exit 0
    ;;
  [1-9]|[1-9][0-9])
    index=$((choice-1))
    if [ $index -ge 0 ] && [ $index -lt ${#migrations[@]} ]; then
      migration="${migrations[$index]}"
      echo ""
      echo "Running $migration..."
      npx ts-node --transpile-only "$MIGRATIONS_DIR/$migration.ts"
      if [ $? -eq 0 ]; then
        echo ""
        echo "✓ Migration complete!"
      else
        echo ""
        echo "✗ Migration failed"
        exit 1
      fi
    else
      echo "Invalid selection."
      exit 1
    fi
    ;;
  *)
    echo "Invalid selection."
    exit 1
    ;;
esac
