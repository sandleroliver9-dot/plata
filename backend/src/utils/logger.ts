import { env } from '../config/env';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

const LOG_LEVELS = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
};

const getLevelPriority = (level: LogLevel): number => LOG_LEVELS[level] ?? 1;

const formatTime = (): string => {
  return new Date().toISOString();
};

const formatLog = (level: LogLevel, message: string, data?: any): string => {
  let log = `[${formatTime()}] [${level}] ${message}`;
  if (data) {
    log += ` ${JSON.stringify(data)}`;
  }
  return log;
};

const colorizeLog = (level: LogLevel, message: string): string => {
  const colors = {
    [LogLevel.DEBUG]: '\x1b[36m', // Cyan
    [LogLevel.INFO]: '\x1b[32m',  // Green
    [LogLevel.WARN]: '\x1b[33m',  // Yellow
    [LogLevel.ERROR]: '\x1b[31m', // Red
  };
  const reset = '\x1b[0m';
  return `${colors[level]}${message}${reset}`;
};

export const logger = {
  debug: (message: string, data?: any) => {
    if (!env.ENABLE_LOGGING) return;
    if (getLevelPriority(LogLevel.DEBUG) < getLevelPriority(env.LOG_LEVEL as LogLevel)) return;
    const formatted = formatLog(LogLevel.DEBUG, message, data);
    console.log(colorizeLog(LogLevel.DEBUG, formatted));
  },

  info: (message: string, data?: any) => {
    if (!env.ENABLE_LOGGING) return;
    if (getLevelPriority(LogLevel.INFO) < getLevelPriority(env.LOG_LEVEL as LogLevel)) return;
    const formatted = formatLog(LogLevel.INFO, message, data);
    console.log(colorizeLog(LogLevel.INFO, formatted));
  },

  warn: (message: string, data?: any) => {
    if (!env.ENABLE_LOGGING) return;
    const formatted = formatLog(LogLevel.WARN, message, data);
    console.warn(colorizeLog(LogLevel.WARN, formatted));
  },

  error: (message: string, error?: any) => {
    if (!env.ENABLE_LOGGING) return;
    const formatted = formatLog(
      LogLevel.ERROR,
      message,
      error instanceof Error ? { message: error.message, stack: error.stack } : error
    );
    console.error(colorizeLog(LogLevel.ERROR, formatted));
  },

  // Request logging middleware helper
  request: (method: string, path: string, userId?: string) => {
    logger.info(`${method} ${path}${userId ? ` [user: ${userId}]` : ''}`);
  },

  // Response logging middleware helper
  response: (method: string, path: string, statusCode: number, duration: number) => {
    const statusColor =
      statusCode >= 500 ? '\x1b[31m' :
      statusCode >= 400 ? '\x1b[33m' :
      statusCode >= 300 ? '\x1b[36m' :
      '\x1b[32m';
    const reset = '\x1b[0m';
    logger.info(`${method} ${path} ${statusColor}${statusCode}${reset} (${duration}ms)`);
  },
};
