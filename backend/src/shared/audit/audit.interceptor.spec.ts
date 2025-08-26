import { AuditInterceptor } from './audit.interceptor';
import { Reflector } from '@nestjs/core';
import { of, lastValueFrom } from 'rxjs';

describe('AuditInterceptor', () => {
  it('calls auditService.log when handler has metadata and data has id', async () => {
    const mockAuditService: any = {
      log: jest.fn().mockResolvedValue(undefined),
    };
    const reflector = new Reflector();
    (reflector as any).get = () => 'books';
    const interceptor = new AuditInterceptor(
      mockAuditService,
      reflector as any,
    );

    const ctx: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          user: { sub: 'u1' },
          ip: '1.1.1.1',
          get: () => 'ua',
        }),
        getResponse: () => ({ statusCode: 201 }),
      }),
      getHandler: () => ({}),
    };

    const next: any = { handle: () => of({ id: '1' }) };

    await lastValueFrom(interceptor.intercept(ctx as any, next));
    expect(mockAuditService.log).toHaveBeenCalled();
  });
});
