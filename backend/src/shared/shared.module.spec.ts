import { Test, TestingModule } from '@nestjs/testing';
import { SharedModule } from './shared.module';
import { ResponseInterceptor } from './response/response.interceptor';
import { HttpExceptionFilter } from './filters/http-exception.filter';

describe('SharedModule', () => {
  it('provides ResponseInterceptor and HttpExceptionFilter', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SharedModule],
    }).compile();
    const interceptor = module.get(ResponseInterceptor);
    const filter = module.get(HttpExceptionFilter);
    expect(interceptor).toBeDefined();
    expect(filter).toBeDefined();
  });
});
