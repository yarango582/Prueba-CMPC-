import { Injectable } from '@nestjs/common';
import { createLogger, Logger, format, transports } from 'winston';

@Injectable()
export class LoggingService {
  private readonly logger: Logger;

  constructor() {
    this.logger = createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.errors({ stack: true }),
        format.json(),
      ),
      defaultMeta: { service: 'cmpc-libros-api' },
      transports: [
        // Write all logs with importance level of `error` or less to `error.log`
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        // Write all logs with importance level of `info` or less to `combined.log`
        new transports.File({ filename: 'logs/combined.log' }),
        // Also log to console if not in production
        ...(process.env.NODE_ENV !== 'production'
          ? [
              new transports.Console({
                format: format.combine(format.colorize(), format.simple()),
              }),
            ]
          : []),
      ],
    });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  info(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }
}
