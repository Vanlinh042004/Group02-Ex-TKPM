import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

export interface LogOptions {
  module?: string;
  operation?: string;
  userId?: string;
  details?: any;
}

export class Logger {
  private static instance: Logger;
  private logDir: string;
  private currentLogFile: string;
  private logLevel: LogLevel;

  private constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO;
    this.ensureLogDirectory();
    this.setCurrentLogFile();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private setCurrentLogFile(): void {
    const currentDate = format(new Date(), 'yyyy-MM-dd');
    this.currentLogFile = path.join(this.logDir, `app-${currentDate}.log`);
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = Object.values(LogLevel);
    const configuredLevelIndex = levels.indexOf(this.logLevel);
    const currentLevelIndex = levels.indexOf(level);

    return currentLevelIndex <= configuredLevelIndex;
  }

  private formatLogEntry(
    level: LogLevel,
    message: string,
    options?: LogOptions
  ): string {
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS');
    const module = options?.module || 'APP';
    const operation = options?.operation || '-';
    const userId = options?.userId || 'SYSTEM';

    let logEntry = `[${timestamp}] [${level}] [${module}] [${operation}] [${userId}] ${message}`;

    if (options?.details) {
      let details: string;
      try {
        details =
          typeof options.details === 'string'
            ? options.details
            : JSON.stringify(options.details);
        logEntry += ` [DETAILS: ${details}]`;
      } catch (error) {
        logEntry += ` [DETAILS: Unable to stringify]`;
      }
    }

    return logEntry;
  }

  private writeToFile(entry: string): void {
    try {
      fs.appendFileSync(this.currentLogFile, entry + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private writeToConsole(level: LogLevel, entry: string): void {
    switch (level) {
      case LogLevel.ERROR:
        console.error(entry);
        break;
      case LogLevel.WARN:
        console.warn(entry);
        break;
      case LogLevel.INFO:
        console.info(entry);
        break;
      case LogLevel.DEBUG:
        console.debug(entry);
        break;
    }
  }

  public log(level: LogLevel, message: string, options?: LogOptions): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const logEntry = this.formatLogEntry(level, message, options);

    // Write to console
    this.writeToConsole(level, logEntry);

    // Write to file
    this.writeToFile(logEntry);
  }

  public error(message: string, options?: LogOptions): void {
    this.log(LogLevel.ERROR, message, options);
  }

  public warn(message: string, options?: LogOptions): void {
    this.log(LogLevel.WARN, message, options);
  }

  public info(message: string, options?: LogOptions): void {
    this.log(LogLevel.INFO, message, options);
  }

  public debug(message: string, options?: LogOptions): void {
    this.log(LogLevel.DEBUG, message, options);
  }

  // Method specifically for audit logging
  public audit(
    operation: string,
    entityType: string,
    entityId: string,
    before?: any,
    after?: any,
    userId?: string
  ): void {
    const options: LogOptions = {
      module: 'AUDIT',
      operation: operation,
      userId: userId || 'SYSTEM',
      details: {
        entityType,
        entityId,
        before: before ? JSON.stringify(before) : undefined,
        after: after ? JSON.stringify(after) : undefined,
      },
    };

    this.info(`${operation} ${entityType} ${entityId}`, options);
  }
}

export default Logger.getInstance();
