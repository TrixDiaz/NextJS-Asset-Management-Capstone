// Define log levels
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Log action types
export enum LogAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete'
}

// Resource types
export enum LogResource {
  USER = 'user',
  BUILDING = 'building',
  FLOOR = 'floor',
  ROOM = 'room',
  STORAGE = 'storage'
}

// Interface for log info
export interface LogInfo {
  user?: string;
  action: LogAction;
  resource: LogResource;
  message: string;
  details?: Record<string, any>;
}

// Log entry interface
export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  user: string;
  action: LogAction;
  resource: LogResource;
  message: string;
  details?: Record<string, any>;
}

// Store logs in memory (for development purposes)
// In production, you would use a database or external logging service
const logs: LogEntry[] = [];

// Maximum number of logs to keep in memory
const MAX_LOGS = 1000;

// Simple logger that works in both Node.js and Edge Runtime
class EdgeCompatibleLogger {
  private serviceName: string;
  private level: LogLevel;

  constructor(options: { serviceName: string; level?: LogLevel }) {
    this.serviceName = options.serviceName;
    this.level = options.level || 'info';
  }

  private getTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  private formatLogMessage(
    level: LogLevel,
    message: string,
    meta?: any
  ): string {
    const timestamp = this.getTimestamp();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level.toUpperCase()}] [${this.serviceName}] ${message}${metaStr}`;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };

    return levels[level] >= levels[this.level];
  }

  private addToMemoryLogs(level: LogLevel, message: string, meta?: any): void {
    // Create a unique ID for the log entry
    const id =
      Date.now().toString() + Math.random().toString(36).substring(2, 9);

    // Add log to memory store
    logs.unshift({
      id,
      timestamp: this.getTimestamp(),
      level,
      user: (meta && meta.user) || 'system',
      action: (meta && meta.action) || LogAction.READ,
      resource: (meta && meta.resource) || LogResource.USER,
      message,
      details: meta && meta.details
    });

    // Trim logs if they exceed the maximum
    if (logs.length > MAX_LOGS) {
      logs.length = MAX_LOGS;
    }
  }

  debug(message: string, meta?: any): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatLogMessage('debug', message, meta));
      this.addToMemoryLogs('debug', message, meta);
    }
  }

  info(message: string, meta?: any): void {
    if (this.shouldLog('info')) {
      console.info(this.formatLogMessage('info', message, meta));
      this.addToMemoryLogs('info', message, meta);
    }
  }

  warn(message: string, meta?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatLogMessage('warn', message, meta));
      this.addToMemoryLogs('warn', message, meta);
    }
  }

  error(message: string, meta?: any): void {
    if (this.shouldLog('error')) {
      console.error(this.formatLogMessage('error', message, meta));
      this.addToMemoryLogs('error', message, meta);
    }
  }

  // Additional method to log structured action data
  logAction({ user, action, resource, message, details }: LogInfo): void {
    const meta = {
      user: user || 'anonymous',
      action,
      resource,
      details
    };

    this.info(message, meta);
  }

  // Get logs with filtering and pagination
  getLogs(
    options: {
      page?: number;
      limit?: number;
      level?: LogLevel;
      action?: LogAction;
      resource?: LogResource;
      user?: string;
      search?: string;
      sortBy?: keyof LogEntry;
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): { logs: LogEntry[]; total: number } {
    const {
      page = 1,
      limit = 10,
      level,
      action,
      resource,
      user,
      search,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = options;

    // Filter logs
    let filteredLogs = logs.filter((log) => {
      // Filter by level
      if (level && log.level !== level) return false;

      // Filter by action
      if (action && log.action !== action) return false;

      // Filter by resource
      if (resource && log.resource !== resource) return false;

      // Filter by user
      if (user && log.user !== user) return false;

      // Search in message and details
      if (search) {
        const searchLower = search.toLowerCase();
        const messageMatches = log.message.toLowerCase().includes(searchLower);
        const detailsString = log.details
          ? JSON.stringify(log.details).toLowerCase()
          : '';
        const detailsMatch = detailsString.includes(searchLower);
        const userMatch = log.user.toLowerCase().includes(searchLower);

        return messageMatches || detailsMatch || userMatch;
      }

      return true;
    });

    // Sort logs
    filteredLogs.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });

    // Paginate logs
    const startIndex = (page - 1) * limit;
    const paginatedLogs = filteredLogs.slice(startIndex, startIndex + limit);

    return {
      logs: paginatedLogs,
      total: filteredLogs.length
    };
  }
}

// Create the logger instance
const logger = new EdgeCompatibleLogger({
  serviceName: 'dashboard-app',
  level: (process.env.LOG_LEVEL as LogLevel) || 'info'
});

// Log action function for convenient external use
export function logAction(info: LogInfo): void {
  logger.logAction(info);
}

// Get logs function for external use
export function getLogs(options = {}): { logs: LogEntry[]; total: number } {
  return logger.getLogs(options);
}

export default logger;
