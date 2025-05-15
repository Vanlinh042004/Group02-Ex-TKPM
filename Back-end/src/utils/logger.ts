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

interface AuditOptions {
  entityType: string;
  entityId: string;
  before?: any;
  after?: any;
  userId?: string;
}

export class Logger {
  private static instance: Logger;
  private readonly logDir: string;
  private currentLogFile: string;
  private readonly logLevel: LogLevel;

  private static readonly DEFAULT_MODULE = 'APP';
  private static readonly DEFAULT_OPERATION = '-';
  private static readonly SYSTEM_USER = 'SYSTEM';
  private static readonly AUDIT_MODULE = 'AUDIT';

  private constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.logLevel = this.determineLogLevel();
    this.ensureLogDirectory();
    this.setCurrentLogFile();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private determineLogLevel(): LogLevel {
    return (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO;
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
    const module = options?.module || Logger.DEFAULT_MODULE;
    const operation = options?.operation || Logger.DEFAULT_OPERATION;
    const userId = options?.userId || Logger.SYSTEM_USER;

    let logEntry = `[${timestamp}] [${level}] [${module}] [${operation}] [${userId}] ${message}`;

    if (options?.details) {
      const details = this.formatDetails(options.details);
      logEntry += ` [DETAILS: ${details}]`;
    }

    return logEntry;
  }

  private formatDetails(details: any): string {
    try {
      return typeof details === 'string' ? details : JSON.stringify(details);
    } catch (error) {
      return 'Unable to stringify';
    }
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

    this.writeToConsole(level, logEntry);
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
    const auditOptions: LogOptions = {
      module: Logger.AUDIT_MODULE,
      operation,
      userId: userId || Logger.SYSTEM_USER,
      details: this.prepareAuditDetails({
        entityType,
        entityId,
        before,
        after,
        userId,
      }),
    };

    this.info(`${operation} ${entityType} ${entityId}`, auditOptions);
  }

  private prepareAuditDetails(options: AuditOptions): any {
    return {
      entityType: options.entityType,
      entityId: options.entityId,
      before: options.before ? JSON.stringify(options.before) : undefined,
      after: options.after ? JSON.stringify(options.after) : undefined,
    };
  }
}

export default Logger.getInstance();
