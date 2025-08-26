import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';
import { AppService } from './app.service';

describe('AppModule', () => {
  it('compiles and provides AppService', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const svc = moduleRef.get<AppService>(AppService);
    expect(svc).toBeDefined();
  });
});
