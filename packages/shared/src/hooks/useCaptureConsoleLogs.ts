import { useEffect, useRef, useCallback, useState } from 'react';

export interface ConsoleLogEntry {
  timestamp: number;
  level: 'log' | 'warn' | 'error';
  message: string;
}

interface UseCaptureConsoleLogsResult {
  logs: ConsoleLogEntry[];
  getLogsJson: () => string;
  clearLogs: () => void;
}

const MAX_ENTRIES = 50;
const MAX_MESSAGE_LENGTH = 1000;

/**
 * Hook to capture console logs for feedback submission.
 * Wraps console.log, console.warn, and console.error to store recent entries.
 * Only captures logs while the hook is mounted.
 */
export const useCaptureConsoleLogs = (): UseCaptureConsoleLogsResult => {
  const [logs, setLogs] = useState<ConsoleLogEntry[]>([]);
  const originalConsole = useRef<{
    log: typeof console.log;
    warn: typeof console.warn;
    error: typeof console.error;
  } | null>(null);

  useEffect(() => {
    // Store original console methods
    /* eslint-disable no-console */
    originalConsole.current = {
      log: console.log,
      warn: console.warn,
      error: console.error,
    };
    /* eslint-enable no-console */

    const addLog = (level: ConsoleLogEntry['level'], args: unknown[]) => {
      const message = args
        .map((arg) => {
          if (typeof arg === 'string') {
            return arg;
          }
          try {
            return JSON.stringify(arg);
          } catch {
            return String(arg);
          }
        })
        .join(' ')
        .slice(0, MAX_MESSAGE_LENGTH);

      setLogs((prev) => {
        const newLogs = [
          ...prev,
          {
            timestamp: Date.now(),
            level,
            message,
          },
        ];
        // Keep only the last MAX_ENTRIES
        return newLogs.slice(-MAX_ENTRIES);
      });
    };

    // Wrap console methods to capture logs
    // eslint-disable-next-line no-console
    console.log = (...args: unknown[]) => {
      originalConsole.current?.log(...args);
      addLog('log', args);
    };

    // eslint-disable-next-line no-console
    console.warn = (...args: unknown[]) => {
      originalConsole.current?.warn(...args);
      addLog('warn', args);
    };

    // eslint-disable-next-line no-console
    console.error = (...args: unknown[]) => {
      originalConsole.current?.error(...args);
      addLog('error', args);
    };

    // Cleanup: restore original console methods
    return () => {
      if (originalConsole.current) {
        // eslint-disable-next-line no-console
        console.log = originalConsole.current.log;
        // eslint-disable-next-line no-console
        console.warn = originalConsole.current.warn;
        // eslint-disable-next-line no-console
        console.error = originalConsole.current.error;
      }
    };
  }, []);

  const getLogsJson = useCallback(() => {
    return JSON.stringify(logs);
  }, [logs]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return {
    logs,
    getLogsJson,
    clearLogs,
  };
};
