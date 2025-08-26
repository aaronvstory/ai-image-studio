# Serena Dashboard Monitoring Issues

## Dashboard URL
http://127.0.0.1:24282/dashboard/

## Known Issues (2025-08-24)

### 1. Dashboard Shows Initial Logs Only
After startup, the dashboard displays initial configuration logs but does not show real-time activity updates for operations performed via MCP.

### 2. Possible Causes
- WebSocket connection not established properly between dashboard and Serena server
- Dashboard frontend not refreshing/polling for updates
- MCP operations not being tracked in the activity log
- Port 24282 might be blocked or have connectivity issues

### 3. Verification Steps
- Serena MCP operations ARE working (confirmed via direct testing)
- Project activation successful
- Symbol search and pattern matching functional
- Memory read/write operations working

### 4. Workaround
Monitor Serena operations through:
1. Direct MCP responses in Claude Code
2. Log files at: C:\Users\d0nbx\.serena\logs\
3. Direct verification of code changes

### 5. Dashboard Expected Features
- Real-time activity tracking
- Token usage statistics
- Operation history
- Performance metrics
- Active project display

## Testing Status
- MCP Operations: ✅ Working
- Dashboard Display: ⚠️ Not updating after initial load
- WebSocket Connection: ❓ Needs investigation