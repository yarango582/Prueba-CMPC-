import { ResponseInterceptor } from './response.interceptor';
import { of, lastValueFrom } from 'rxjs';

describe('ResponseInterceptor', () => {
  it('wraps handler response with success structure', async () => {
    const interceptor = new ResponseInterceptor();

    const ctx: any = {
      switchToHttp: () => ({
        getResponse: () => ({ statusCode: 200 }),
        getRequest: () => ({ method: 'GET' }),
      }),
    };

    const next: any = { handle: () => of({ foo: 'bar' }) };

    const result = await lastValueFrom(interceptor.intercept(ctx as any, next));
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('data');
  });
});
