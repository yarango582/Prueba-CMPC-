import { Module } from '@nestjs/common';
import { ResponseInterceptor } from './response/response.interceptor';
import { HttpExceptionFilter } from './http-exception/http-exception.filter';

@Module({
  providers: [ResponseInterceptor, HttpExceptionFilter],
  exports: [ResponseInterceptor, HttpExceptionFilter],
})
export class SharedModule {}
