#Requires -Version 5.1

<#
.SYNOPSIS
    Workspace Cleanup Script for gpt-new-image-gen (PowerShell Version)

.DESCRIPTION
    Automatically cleans up temporary files, problematic Windows device names,
    and other workspace debris to maintain a clean development environment.
    
    This PowerShell version provides enhanced Windows integration and better
    handling of file permissions and locked files.

.PARAMETER DryRun
    Show what would be cleaned without removing files

.PARAMETER Verbose
    Enable verbose output

.PARAMETER Quick
    Only remove Windows device names and basic temp files

.PARAMETER CacheOnly
    Only clean cache directories and build artifacts

.PARAMETER Help
    Show detailed help information

.EXAMPLE
    .\cleanup.ps1 -DryRun
    Show what would be cleaned without removing files

.EXAMPLE
    .\cleanup.ps1 -Verbose
    Run full cleanup with detailed output

.EXAMPLE
    .\cleanup.ps1 -Quick
    Quick cleanup of just problematic files

.NOTES
    Version: 1.0
    Author: Claude Code SuperClaude Framework
    Created: 2025-08-23
#>

[CmdletBinding()]
param(
    [switch]$DryRun,
    [switch]$Verbose,
    [switch]$Quick,
    [switch]$CacheOnly,
    [switch]$Help
)

# Set up proper console encoding
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.BackgroundColor = "Black"
$Host.UI.RawUI.ForegroundColor = "White"

# Configuration
$Config = @{
    DryRun = $DryRun.IsPresent
    Verbose = $Verbose.IsPresent -or $DryRun.IsPresent
    Quick = $Quick.IsPresent
    CacheOnly = $CacheOnly.IsPresent
    ProjectRoot = $PWD.Path
    MaxLogSize = 50MB
    MaxCacheSize = 500MB
}

# Windows reserved device names
$WindowsReservedNames = @(
    'nul', 'con', 'prn', 'aux',
    'com1', 'com2', 'com3', 'com4', 'com5', 'com6', 'com7', 'com8', 'com9',
    'lpt1', 'lpt2', 'lpt3', 'lpt4', 'lpt5', 'lpt6', 'lpt7', 'lpt8', 'lpt9'
)

# Protected directories
$ProtectedDirs = @(
    'node_modules',
    '.git',
    '.next\static',
    'public',
    'docs',
    'coverage',
    'out'
)

# Statistics
$Stats = @{
    FilesRemoved = 0
    DirsRemoved = 0
    SpaceSaved = 0
    Errors = 0
}

function Write-Log {
    param(
        [string]$Message,
        [string]$Level = 'Info'
    )
    
    if (-not $Config.Verbose -and $Level -eq 'Debug') { return }
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $prefix = if ($Config.DryRun) { '[DRY RUN]' } else { '[CLEANUP]' }
    
    switch ($Level) {
        'Error' { 
            Write-Host "$prefix $timestamp - ERROR: $Message" -ForegroundColor Red 
            $Stats.Errors++
        }
        'Warning' { Write-Host "$prefix $timestamp - WARN: $Message" -ForegroundColor Yellow }
        'Success' { Write-Host "$prefix $timestamp - $Message" -ForegroundColor Green }
        'Info' { Write-Host "$prefix $timestamp - $Message" -ForegroundColor White }
        'Debug' { Write-Host "$prefix $timestamp - $Message" -ForegroundColor Gray }
    }
}

function Format-Bytes {
    param([long]$Bytes)
    
    if ($Bytes -eq 0) { return '0 B' }
    
    $sizes = @('B', 'KB', 'MB', 'GB', 'TB')
    $order = [Math]::Floor([Math]::Log($Bytes) / [Math]::Log(1024))
    $value = [Math]::Round($Bytes / [Math]::Pow(1024, $order), 2)
    
    return "$value $($sizes[$order])"
}

function Test-ProtectedPath {
    param([string]$Path)
    
    $relativePath = Resolve-Path $Path -Relative -ErrorAction SilentlyContinue
    if (-not $relativePath) { return $false }
    
    return $ProtectedDirs | Where-Object { $relativePath -like "*$_*" }
}

function Remove-SafeFile {
    param([string]$FilePath)
    
    try {
        if ($Config.DryRun) {
            $size = (Get-Item $FilePath -ErrorAction SilentlyContinue).Length
            if ($size -eq $null) { $size = 0 }
            Write-Log "Would remove file: $FilePath ($(Format-Bytes $size))" -Level 'Debug'
            $Stats.FilesRemoved++
            $Stats.SpaceSaved += $size
            return $true
        }
        
        $size = (Get-Item $FilePath -ErrorAction SilentlyContinue).Length
        if ($size -eq $null) { $size = 0 }
        
        Remove-Item $FilePath -Force -ErrorAction Stop
        Write-Log "Removed file: $FilePath ($(Format-Bytes $size))" -Level 'Debug'
        $Stats.FilesRemoved++
        $Stats.SpaceSaved += $size
        return $true
    }
    catch {
        Write-Log "Failed to remove file: $FilePath - $($_.Exception.Message)" -Level 'Error'
        return $false
    }
}

function Remove-SafeDirectory {
    param([string]$DirPath)
    
    try {
        if ($Config.DryRun) {
            $size = Get-DirectorySize $DirPath
            Write-Log "Would remove directory: $DirPath ($(Format-Bytes $size))" -Level 'Debug'
            $Stats.DirsRemoved++
            $Stats.SpaceSaved += $size
            return $true
        }
        
        $size = Get-DirectorySize $DirPath
        Remove-Item $DirPath -Recurse -Force -ErrorAction Stop
        Write-Log "Removed directory: $DirPath ($(Format-Bytes $size))" -Level 'Debug'
        $Stats.DirsRemoved++
        $Stats.SpaceSaved += $size
        return $true
    }
    catch {
        Write-Log "Failed to remove directory: $DirPath - $($_.Exception.Message)" -Level 'Error'
        return $false
    }
}

function Get-DirectorySize {
    param([string]$Path)
    
    try {
        $size = Get-ChildItem -Path $Path -Recurse -File -ErrorAction SilentlyContinue |
                Measure-Object -Property Length -Sum |
                Select-Object -ExpandProperty Sum
        return if ($size) { $size } else { 0 }
    }
    catch {
        return 0
    }
}

function Clear-WindowsReservedNames {
    Write-Log "Scanning for Windows reserved device names..."
    
    function Scan-Directory {
        param([string]$DirPath)
        
        try {
            Get-ChildItem -Path $DirPath -ErrorAction SilentlyContinue | ForEach-Object {
                $fullPath = $_.FullName
                
                if (Test-ProtectedPath $fullPath) { return }
                
                # Check if filename matches Windows reserved name
                $baseName = [System.IO.Path]::GetFileNameWithoutExtension($_.Name).ToLower()
                if ($WindowsReservedNames -contains $baseName) {
                    Write-Log "Found Windows reserved name: $fullPath" -Level 'Warning'
                    if ($_.PSIsContainer -eq $false) {
                        Remove-SafeFile $fullPath
                    }
                }
                
                # Recursively scan subdirectories
                if ($_.PSIsContainer -and -not $_.Name.StartsWith('.') -and $_.Name -ne 'node_modules') {
                    Scan-Directory $fullPath
                }
            }
        }
        catch {
            Write-Log "Failed to scan directory: $DirPath - $($_.Exception.Message)" -Level 'Error'
        }
    }
    
    Scan-Directory $Config.ProjectRoot
}

function Clear-TempFiles {
    Write-Log "Cleaning up temporary files..."
    
    $patterns = @('*.tmp', '*.temp', '*.log', '*.cache', 'debug_*', '*_debug.txt', 
                  'test_*', '*.bak', '*.backup', '*~', '.#*', '*_old', '*_backup')
    
    function Scan-ForPatterns {
        param([string]$DirPath, [string[]]$Patterns)
        
        try {
            Get-ChildItem -Path $DirPath -ErrorAction SilentlyContinue | ForEach-Object {
                $fullPath = $_.FullName
                
                if (Test-ProtectedPath $fullPath) { return }
                
                if ($_.PSIsContainer -eq $false) {
                    $matchesPattern = $Patterns | Where-Object { $_.Name -like $_ }
                    if ($matchesPattern) {
                        Remove-SafeFile $fullPath
                    }
                }
                
                # Recursively scan subdirectories
                if ($_.PSIsContainer -and -not $_.Name.StartsWith('.') -and $_.Name -ne 'node_modules') {
                    Scan-ForPatterns $fullPath $Patterns
                }
            }
        }
        catch {
            Write-Log "Failed to scan directory for temp files: $DirPath - $($_.Exception.Message)" -Level 'Error'
        }
    }
    
    Scan-ForPatterns $Config.ProjectRoot $patterns
}

function Clear-NodeModulesCache {
    Write-Log "Cleaning up Node.js cache files..."
    
    $cachePatterns = @(
        'node_modules\.cache',
        '.next\cache',
        '.next\static\chunks\webpack-*'
    )
    
    $logPatterns = @(
        'npm-debug.log*',
        'yarn-debug.log*',
        '.pnpm-debug.log*',
        '*.tsbuildinfo'
    )
    
    # Clean cache directories
    foreach ($pattern in $cachePatterns) {
        $fullPath = Join-Path $Config.ProjectRoot $pattern
        if (Test-Path $fullPath) {
            if ((Get-Item $fullPath).PSIsContainer) {
                $size = Get-DirectorySize $fullPath
                if ($size -gt $Config.MaxCacheSize) {
                    Write-Log "Large cache directory found: $fullPath ($(Format-Bytes $size))" -Level 'Warning'
                    Remove-SafeDirectory $fullPath
                }
            } else {
                Remove-SafeFile $fullPath
            }
        }
    }
    
    # Clean log files
    foreach ($pattern in $logPatterns) {
        Get-ChildItem -Path $Config.ProjectRoot -Filter $pattern -ErrorAction SilentlyContinue | ForEach-Object {
            Remove-SafeFile $_.FullName
        }
    }
}

function Clear-EmptyDirectories {
    Write-Log "Removing empty directories..."
    
    function Remove-EmptyDirs {
        param([string]$DirPath)
        
        try {
            $items = Get-ChildItem -Path $DirPath -ErrorAction SilentlyContinue
            
            # First, recursively process subdirectories
            $items | Where-Object { $_.PSIsContainer } | ForEach-Object {
                $fullPath = $_.FullName
                if (-not (Test-ProtectedPath $fullPath)) {
                    Remove-EmptyDirs $fullPath
                }
            }
            
            # Check if directory is now empty
            $currentItems = Get-ChildItem -Path $DirPath -ErrorAction SilentlyContinue
            if ($currentItems.Count -eq 0 -and -not (Test-ProtectedPath $DirPath)) {
                Remove-Item $DirPath -Force -ErrorAction SilentlyContinue
                Write-Log "Removed empty directory: $DirPath" -Level 'Debug'
                $Stats.DirsRemoved++
            }
        }
        catch {
            # Directory might have been deleted already or doesn't exist
        }
    }
    
    Remove-EmptyDirs $Config.ProjectRoot
}

function Clear-LargeLogs {
    Write-Log "Checking for oversized log files..."
    
    $logFiles = @('npm-debug.log', 'yarn-debug.log', 'yarn-error.log', '.pnpm-debug.log', 'debug.log', 'error.log')
    
    foreach ($logFile in $logFiles) {
        $fullPath = Join-Path $Config.ProjectRoot $logFile
        if (Test-Path $fullPath) {
            $size = (Get-Item $fullPath).Length
            if ($size -gt $Config.MaxLogSize) {
                Write-Log "Large log file found: $fullPath ($(Format-Bytes $size))" -Level 'Warning'
                Remove-SafeFile $fullPath
            }
        }
    }
}

function Test-GitIgnore {
    Write-Log "Verifying .gitignore patterns..."
    
    $gitignorePath = Join-Path $Config.ProjectRoot '.gitignore'
    $requiredPatterns = @(
        'nul', 'con', 'prn', 'aux', 'com[1-9]', 'lpt[1-9]',
        '*.tmp', '*.temp', '*.log', '*.cache', 'debug_*', '*_debug.txt', 'test_*', '*.bak', '*.backup'
    )
    
    if (Test-Path $gitignorePath) {
        $gitignoreContent = Get-Content $gitignorePath -Raw
        $missingPatterns = $requiredPatterns | Where-Object { $gitignoreContent -notmatch [regex]::Escape($_) }
        
        if ($missingPatterns.Count -gt 0) {
            Write-Log "Some cleanup patterns missing from .gitignore" -Level 'Warning'
            if ($Config.Verbose) {
                Write-Log "Missing patterns: $($missingPatterns -join ', ')" -Level 'Debug'
            }
        } else {
            Write-Log ".gitignore contains all necessary cleanup patterns" -Level 'Success'
        }
    } else {
        Write-Log "Warning: .gitignore file not found" -Level 'Warning'
    }
}

function Show-Report {
    Write-Log ""
    Write-Log "=== CLEANUP SUMMARY ===" -Level 'Success'
    Write-Log "Files removed: $($Stats.FilesRemoved)"
    Write-Log "Directories removed: $($Stats.DirsRemoved)"
    Write-Log "Space saved: $(Format-Bytes $Stats.SpaceSaved)"
    Write-Log "Errors encountered: $($Stats.Errors)"
    
    if ($Config.DryRun) {
        Write-Log ""
        Write-Log "This was a dry run. No files were actually removed." -Level 'Warning'
        Write-Log "Run without -DryRun parameter to perform actual cleanup."
    }
}

function Show-Help {
    $helpText = @"

-----------------------------------------------------------------------------------------
                        WORKSPACE CLEANUP UTILITY - PowerShell Edition
-----------------------------------------------------------------------------------------

DESCRIPTION:
    Automated workspace cleaning for gpt-new-image-gen project.
    Removes problematic files, temporary data, and maintains clean workspace.

USAGE:
    .\cleanup.ps1 [parameters]

PARAMETERS:
    -DryRun      Show what would be cleaned without removing files
    -Verbose     Enable detailed output
    -Quick       Only remove Windows device names and basic temp files  
    -CacheOnly   Only clean cache directories and build artifacts
    -Help        Show this help message

EXAMPLES:
    .\cleanup.ps1 -DryRun         # Safe preview of cleanup actions
    .\cleanup.ps1 -Verbose        # Full cleanup with detailed logging
    .\cleanup.ps1 -Quick          # Quick cleanup of problematic files
    .\cleanup.ps1 -CacheOnly      # Clean only caches and build artifacts

WHAT GETS CLEANED:
    • Windows reserved device names (nul, con, prn, aux, com1-9, lpt1-9)
    • Temporary files (*.tmp, *.temp, *.log, debug_*, test_*, *.bak)
    • Node.js cache files and debug logs
    • Large log files (>50MB)
    • Empty directories
    • Oversized build caches (>500MB)

PROTECTED DIRECTORIES:
    • node_modules (only cache subdirs cleaned)
    • .git (repository data)
    • .next\static (static assets preserved)
    • public, docs, coverage, out

SAFETY FEATURES:
    • Dry run mode for safe testing
    • Protected directory checking
    • Size limits for cache cleanup  
    • Comprehensive error handling
    • Detailed logging of all actions

-----------------------------------------------------------------------------------------

"@
    Write-Host $helpText -ForegroundColor Cyan
}

function Start-Cleanup {
    $startTime = Get-Date
    
    Write-Log "Starting workspace cleanup for: $($Config.ProjectRoot)"
    if ($Config.DryRun) {
        Write-Log "DRY RUN MODE - No files will be actually removed" -Level 'Warning'
    }
    
    try {
        if (-not $Config.CacheOnly) {
            Clear-WindowsReservedNames
            if (-not $Config.Quick) {
                Clear-TempFiles
            }
        }
        
        if (-not $Config.Quick) {
            Clear-NodeModulesCache
            Clear-LargeLogs
            Clear-EmptyDirectories
        }
        
        Test-GitIgnore
        
        $duration = [Math]::Round(((Get-Date) - $startTime).TotalSeconds, 2)
        Write-Log "Cleanup completed in $duration seconds" -Level 'Success'
        
        Show-Report
    }
    catch {
        Write-Log "Cleanup failed with unexpected error: $($_.Exception.Message)" -Level 'Error'
        exit 1
    }
}

# Main execution
if ($Help.IsPresent) {
    Show-Help
    exit 0
}

# Verify we're in the project directory
if (-not (Test-Path 'package.json')) {
    Write-Log "Error: Not in project root directory. Please run from gpt-new-image-gen directory." -Level 'Error'
    exit 1
}

# Start the cleanup process
Start-Cleanup