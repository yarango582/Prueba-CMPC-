import { ResponseInterceptor } from './response.interceptor';
import { of } from 'rxjs';

describe('ResponseInterceptor', () => {
  it('wraps data into ApiResponse shape', (done) => {
    const interceptor = new ResponseInterceptor<any>();
    const mockContext: any = {};
    const next: any = {
      handle: () => of({ hello: 'world' }),
    };

    const result$ = interceptor.intercept(mockContext, next);
    result$.subscribe((res) => {
      expect(res).toHaveProperty('success', true);
      expect(res).toHaveProperty('data');
      expect(res.data).toEqual({ hello: 'world' });
      expect(res).toHaveProperty('timestamp');
      done();
    });
  });
});
