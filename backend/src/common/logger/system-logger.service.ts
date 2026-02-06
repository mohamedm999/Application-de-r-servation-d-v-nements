import { Injectable, ConsoleLogger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SystemLoggerService extends ConsoleLogger {
  private readonly logDir = path.join(process.cwd(), 'logs');
  private readonly logFile = path.join(this.logDir, 'app.log');

  constructor() {
    super();
    this.ensureLogDirectoryExists();
  }

  private ensureLogDirectoryExists() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Write a 'log' level log.
   */
  log(message: any, context?: string) {
    super.log(message, context);
    const logMessage = this.createLogMessage('LOG', message, context);
    this.writeToFile(logMessage);
  }

  /**
   * Write an 'error' level log.
   */
  error(message: any, trace?: string, context?: string) {
    super.error(message, trace, context);
    const logMessage = this.createLogMessage('ERROR', message, context, trace);
    this.writeToFile(logMessage);
  }

  /**
   * Write a 'warn' level log.
   */
  warn(message: any, context?: string) {
    super.warn(message, context);
    const logMessage = this.createLogMessage('WARN', message, context);
    this.writeToFile(logMessage);
  }

  /**
   * Write a 'debug' level log.
   */
  debug(message: any, context?: string) {
    super.debug(message, context);
    const logMessage = this.createLogMessage('DEBUG', message, context);
    this.writeToFile(logMessage);
  }

  /**
   * Write a 'verbose' level log.
   */
  verbose(message: any, context?: string) {
    super.verbose(message, context);
    const logMessage = this.createLogMessage('VERBOSE', message, context);
    this.writeToFile(logMessage);
  }

  private createLogMessage(level: string, message: any, context?: string, trace?: string): string {
    const timestamp = new Date().toISOString();
    const ctx = context ? `[${context}]` : '[App]';
    const msg = typeof message === 'object' ? JSON.stringify(message) : message;
    const traceInfo = trace ? `\n${trace}` : '';

    return `${timestamp} ${level} ${ctx} ${msg}${traceInfo}`;
  }

  private writeToFile(message: string) {
    try {
      fs.appendFileSync(this.logFile, message + '\n');
    } catch (error) {
      // If file writing fails, at least log to console
      console.error('Failed to write to log file:', error);
    }
  }
}
