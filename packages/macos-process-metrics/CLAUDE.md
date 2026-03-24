@AGENTS.md

# packages/macos-process-metrics — Native Process Metrics

Native C++ Node.js addon that retrieves physical memory footprints for processes on macOS via `proc_pid_rusage()`.

## Tech Stack
- C++ with Node-API (node-addon-api)
- node-gyp build system
- libproc (macOS system library)

## Key Patterns
- Graceful degradation: returns empty objects on non-macOS platforms
- Single export: `getPhysFootprints(pids: number[]): Record<number, number>`
- Used exclusively in `apps/desktop` for process tree monitoring
- Special Electron packaging handling in `runtime-dependencies.ts`

## Internal Dependencies
- None
