# Git Configuration - Manual Commits/Pushes

## Current Setup
All changes require manual commit and push. Nothing is automatic.

## Configure Git for Manual Control

Run these commands to ensure manual control:

```bash
# Disable auto-setup of remote branches
git config --local push.autoSetupRemote false

# Set push to simple (no auto-push)
git config --local push.default simple

# Disable auto CRLF conversion
git config --local core.autocrlf false
```

## To Commit Changes

1. Stage your changes:
   ```bash
   git add .
   ```

2. Commit with message:
   ```bash
   git commit -m "Your commit message"
   ```

3. Push to remote (if desired):
   ```bash
   git push
   ```

## No Auto-Commits
- No pre-commit hooks that auto-commit
- No post-commit hooks that auto-push
- No auto-push on save
- All commits must be done manually

