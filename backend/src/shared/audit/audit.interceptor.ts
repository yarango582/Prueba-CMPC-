import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../audit/audit.service';
import { AuditOperation } from '../../infrastructure/database/models/audit-log.model';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

export const AUDIT_LOG_KEY = 'auditLog';
export const AuditLog =
  (tableName: string) =>
  (target: any, key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(AUDIT_LOG_KEY, tableName, descriptor.value);
    return descriptor;
  };

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private auditService: AuditService,
    private reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const handler = context.getHandler();
    const tableName = this.reflector.get<string>(AUDIT_LOG_KEY, handler);

    if (!tableName) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((data: Record<string, any> | null) => {
        if (!data || typeof data.id === 'undefined' || data.id === null) return;

        const operation = this.getOperationFromMethod(
          request.method,
        ) as AuditOperation;

        // Safe extraction of user id from request (support JWT `sub` or legacy `userId`)
        const user = (request as unknown as Record<string, any>)?.user as
          | { sub?: string; userId?: string }
          | undefined;
        const userId: string | undefined = user?.sub ?? user?.userId;

        // Fire-and-forget audit logging to avoid interfering with response
        this.auditService
          .log({
            table_name: tableName,
            record_id: String(data.id),
            operation,
            new_values: data,
            user_id: userId,
            user_ip: request.ip,
            user_agent:
              typeof request.get === 'function'
                ? request.get('User-Agent')
                : undefined,
          })
          .catch((err) => {
            console.error(
              'Audit log failed:',
              err instanceof Error ? err.message : err,
            );
          });
      }),
    );
  }

  private getOperationFromMethod(
    method: string,
  ): 'CREATE' | 'UPDATE' | 'SOFT_DELETE' {
    switch (method) {
      case 'POST':
        return 'CREATE';
      case 'PUT':
      case 'PATCH':
        return 'UPDATE';
      case 'DELETE':
        return 'SOFT_DELETE';
      default:
        return 'UPDATE';
    }
  }
}
