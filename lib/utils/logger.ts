/**
 * Logger utility
 * 
 * This module provides a simple logging utility for the application.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  level?: LogLevel;
  timestamp?: boolean;
  prefix?: string;
}

class Logger {
  private level: LogLevel;
  private showTimestamp: boolean;
  private prefix: string;
  
  constructor(options: LogOptions = {}) {
    this.level = options.level || 'info';
    this.showTimestamp = options.timestamp !== false;
    this.prefix = options.prefix || '';
  }
  
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }
  
  private formatMessage(level: LogLevel, message: string): string {
    let formattedMessage = '';
    
    if (this.showTimestamp) {
      formattedMessage += `[${new Date().toISOString()}] `;
    }
    
    formattedMessage += `[${level.toUpperCase()}]`;
    
    if (this.prefix) {
      formattedMessage += ` [${this.prefix}]`;
    }
    
    formattedMessage += ` ${message}`;
    
    return formattedMessage;
  }
  
  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message), ...args);
    }
  }
  
  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message), ...args);
    }
  }
  
  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), ...args);
    }
  }
  
  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message), ...args);
    }
  }
}

// Create a default logger instance
export const logger = new Logger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  timestamp: true,
});

// Export the Logger class for creating custom loggers
export { Logger };
