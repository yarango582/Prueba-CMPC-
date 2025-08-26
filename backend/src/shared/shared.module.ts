import { Module } from '@nestjs/common';
import { ResponseInterceptor } from './response/response.interceptor';
import { HttpExceptionFilter } from './filters/http-exception.filter';

@Module({
  providers: [
    {
      provide: ResponseInterceptor,
      useClass: ResponseInterceptor,
    },
    {
      provide: HttpExceptionFilter,
      useClass: HttpExceptionFilter,
    },
  ],
  exports: [ResponseInterceptor, HttpExceptionFilter],
})
export class SharedModule {}
