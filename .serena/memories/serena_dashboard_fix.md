# Serena Dashboard Fix

## Issue
Dashboard not showing live tool operations despite Serena running correctly.

## Fix Applied
Modified `C:\Users\d0nbx\.serena\serena_config.yml`:
- `log_level: 20` → `log_level: 10` (debug mode)
- `trace_lsp_communication: false` → `true`

## Next Step
Restart Serena for changes to take effect. Dashboard should then show all operations.