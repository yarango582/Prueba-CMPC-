import { HttpExceptionFilter } from './http-exception.filter';
import { HttpException } from '@nestjs/common';

describe('HttpExceptionFilter', () => {
  it('formats HttpException responses', () => {
    const filter = new HttpExceptionFilter();
    const mockResponse: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockRequest: any = { url: '/x', method: 'GET' };

    const host: any = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    };

    const ex = new HttpException('bad', 400);
    filter.catch(ex, host as any);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalled();
  });
});
