import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../audit/audit.service';
import { Reflector } from '@nestjs/core';

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
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();
    const tableName = this.reflector.get<string>(AUDIT_LOG_KEY, handler);

    if (!tableName) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (data) => {
        if (data && data.id) {
          const operation = this.getOperationFromMethod(request.method);

          await this.auditService.log({
            table_name: tableName,
            record_id: data.id,
            operation,
            new_values: data,
            user_id: request.user?.userId,
            user_ip: request.ip,
            user_agent: request.get('User-Agent'),
          });
        }
      }),
    );
  }

  private getOperationFromMethod(method: string) {
    switch (method) {
      case 'POST':
        return 'CREATE' as any;
      case 'PUT':
      case 'PATCH':
        return 'UPDATE' as any;
      case 'DELETE':
        return 'SOFT_DELETE' as any;
      default:
        return 'UPDATE' as any;
    }
  }
}
