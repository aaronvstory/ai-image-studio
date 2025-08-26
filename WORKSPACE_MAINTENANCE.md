# Workspace Maintenance Guide

This guide outlines the automated workspace management system for the `gpt-new-image-gen` project, designed to maintain a clean development environment and prevent common file system issues.

## Overview

The workspace management system provides:
- Automatic cleanup of problematic files (Windows device names like `nul`, `con`, etc.)
- Removal of temporary files and build artifacts
- Cache management for Node.js and Next.js
- Prevention of git tracking issues through comprehensive `.gitignore` patterns
- Safe cleanup operations with dry-run capabilities

## Quick Start

### Automated Cleanup (Recommended)
```bash
# Dry run first (shows what would be cleaned)
node cleanup.js --dry

# Full cleanup
node cleanup.js

# Windows users can use the batch file
cleanup.bat
```

### Manual Quick Cleanup
```bash
# Remove just the 'nul' file and similar issues
del nul con prn aux 2>nul   # Windows
rm -f nul con prn aux       # Unix/Linux
```

## Cleanup Categories

### 1. Windows Reserved Device Names
**Problem**: Files named `nul`, `con`, `prn`, `aux`, `com1-9`, `lpt1-9` cause filesystem issues on Windows.

**What gets cleaned**:
- Files with exact names matching Windows reserved device names
- Both uppercase and lowercase variants

**Prevention**: These patterns are now in `.gitignore` to prevent git tracking.

### 2. Temporary Files
**Problem**: Accumulation of temporary files clutters workspace and can cause confusion.

**What gets cleaned**:
- `*.tmp`, `*.temp`, `*.cache` files
- Debug files: `debug_*`, `*_debug.txt`
- Test artifacts: `test_*`, `*_test.log`
- Backup files: `*.bak`, `*.backup`, `*_old`, `*_backup`
- Editor temp files: `*~`, `.#*`

### 3. Node.js and Build Caches
**Problem**: Large cache directories can consume significant disk space.

**What gets cleaned**:
- `node_modules/.cache` directories
- `.next/cache` (Next.js cache)
- Webpack chunks: `.next/static/chunks/webpack-*`
- Debug logs: `npm-debug.log*`, `yarn-debug.log*`, `.pnpm-debug.log*`
- TypeScript build info: `*.tsbuildinfo`

**Size limits**:
- Cache directories >500MB are automatically cleaned
- Log files >50MB are removed

### 4. Empty Directories
**Problem**: Empty directories serve no purpose and clutter the workspace.

**What gets cleaned**:
- Any empty directory not in protected paths
- Recursively removes nested empty directories

### 5. Large Log Files
**Problem**: Log files can grow indefinitely and consume disk space.

**What gets cleaned**:
- Any `.log` file larger than 50MB
- Common debug log files regardless of size

## Protected Directories

The following directories are **never** cleaned automatically:

- `node_modules/` (except cache subdirectories)
- `.git/` (git repository data)
- `.next/static/` (Next.js static assets)
- `public/` (public assets)
- `docs/` (documentation)
- `coverage/` (test coverage reports)
- `out/` (build output)

## Safety Features

### Dry Run Mode
Always test cleanup operations first:
```bash
node cleanup.js --dry --verbose
```

This shows exactly what would be cleaned without removing anything.

### Protected Path Checking
Every file/directory is checked against protected patterns before removal.

### Size Validation
Large files are flagged and require size-based confirmation before removal.

### Comprehensive Logging
All cleanup operations are logged with:
- Timestamp
- Action taken (removed file/directory)
- Size of cleaned items
- Error details if cleanup fails

## Usage Examples

### Daily Maintenance
```bash
# Quick check and cleanup
node cleanup.js
```

### Before Important Operations
```bash
# Comprehensive dry run check
node cleanup.js --dry --verbose

# If results look good, run full cleanup
node cleanup.js --verbose
```

### Troubleshooting Specific Issues
```bash
# Just remove Windows device name files
cleanup.bat  # Select option [3] Quick Clean
```

### CI/CD Integration
```bash
# Add to package.json scripts
"scripts": {
  "clean": "node cleanup.js",
  "clean:dry": "node cleanup.js --dry"
}

# Use in workflows
npm run clean:dry  # Check what would be cleaned
npm run clean      # Perform cleanup
```

## Scheduled Cleanup

### Windows Task Scheduler
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (e.g., daily at startup)
4. Set action: `node C:\path\to\project\cleanup.js`

### Cron (Linux/Mac)
```bash
# Add to crontab for daily cleanup at 2 AM
0 2 * * * cd /path/to/project && node cleanup.js
```

### Git Hooks
Add to `.git/hooks/pre-commit`:
```bash
#!/bin/sh
cd "$(git rev-parse --show-toplevel)"
node cleanup.js --dry > /dev/null || echo "Warning: Workspace cleanup issues detected"
```

## Preventing File Creation Issues

### Identify Root Causes
The `nul` file was likely created by:
1. **Command redirection errors**: `command > nul` instead of `command > nul:`
2. **Cross-platform scripts**: Unix commands creating Windows reserved names
3. **Build tools**: Misconfigured build processes
4. **IDE issues**: Editor temporary file creation

### Prevention Strategies

#### 1. Script Fixes
```bash
# Wrong (creates 'nul' file)
command > nul

# Correct (redirects to Windows null device)
command > nul:
```

#### 2. Environment Variables
```bash
# Set in .env or environment
NULLDEV=nul:    # Windows
NULLDEV=/dev/null  # Unix
```

#### 3. Build Configuration
Check these files for redirection issues:
- `package.json` scripts
- `.bat` files
- Build configuration files
- CI/CD scripts

## File Watchers and Prevention

### Next.js Configuration
Add to `next.config.js`:
```javascript
module.exports = {
  webpack: (config) => {
    // Prevent creation of problematic files
    config.output.devtoolModuleFilenameTemplate = (info) => {
      const filename = path.basename(info.absoluteResourcePath);
      if (['nul', 'con', 'prn', 'aux'].includes(filename.toLowerCase())) {
        return `webpack:///./${filename}_safe`;
      }
      return info.absoluteResourcePath;
    };
    return config;
  }
};
```

### ESLint Rules
Add to `.eslintrc.js`:
```javascript
{
  "rules": {
    "no-console": ["warn", { 
      "allow": ["warn", "error"] 
    }]
  }
}
```

## Troubleshooting

### Common Issues

#### "Permission Denied" Errors
- Run as administrator on Windows
- Check file permissions with `ls -la` (Unix) or `icacls` (Windows)
- Ensure files are not in use by other processes

#### "File Not Found" Errors
- Normal during cleanup - files may be removed by other processes
- Use `--verbose` flag to see detailed error information

#### Large Space Usage
- Use `node cleanup.js --dry` to see space that would be recovered
- Check `.next/cache` and `node_modules/.cache` directories specifically

#### Cleanup Script Fails
- Verify Node.js is installed and accessible
- Check current working directory is project root
- Review error messages with `--verbose` flag

### Recovery Procedures

#### Accidental File Removal
1. Check git status: `git status`
2. Restore from git: `git checkout -- filename`
3. Restore from backup if available

#### Build Failures After Cleanup
1. Reinstall dependencies: `npm install`
2. Clear all caches: `npm run clean && rm -rf .next`
3. Rebuild: `npm run build`

## Monitoring and Metrics

### Cleanup Reports
Each cleanup generates a summary:
- Files removed count
- Directories removed count  
- Total space saved
- Error count
- Execution time

### Workspace Health Indicators
- No Windows reserved device name files
- `.next/cache` size under 500MB
- No `.log` files over 50MB
- No temporary files older than 7 days

## Integration with Development Workflow

### Pre-commit Hooks
```bash
# Install husky
npm install --save-dev husky

# Add pre-commit hook
npx husky add .husky/pre-commit "node cleanup.js --dry || true"
```

### VS Code Tasks
Add to `.vscode/tasks.json`:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Workspace Cleanup",
      "type": "shell",
      "command": "node cleanup.js",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "panel": "new"
      }
    }
  ]
}
```

### Package.json Scripts
```json
{
  "scripts": {
    "clean": "node cleanup.js",
    "clean:dry": "node cleanup.js --dry",
    "clean:verbose": "node cleanup.js --verbose",
    "predev": "node cleanup.js",
    "prebuild": "node cleanup.js"
  }
}
```

## Best Practices

1. **Always dry-run first** when trying cleanup on a new project
2. **Regular maintenance** - run cleanup weekly or before major operations
3. **Monitor disk usage** - keep an eye on cache directory sizes
4. **Version control** - commit `.gitignore` updates to share with team
5. **Documentation** - update this guide when adding new cleanup patterns
6. **Testing** - verify application works after cleanup operations
7. **Backup important data** before major cleanup operations

---

## Maintenance Schedule

| Frequency | Action | Command |
|-----------|--------|---------|
| Daily | Quick cleanup | `node cleanup.js` |
| Weekly | Full cleanup with report | `node cleanup.js --verbose` |
| Before releases | Comprehensive cleanup | `node cleanup.js && npm run build` |
| After major changes | Workspace verification | `node cleanup.js --dry` |

---

*Last updated: 2025-08-23*  
*Version: 1.0*