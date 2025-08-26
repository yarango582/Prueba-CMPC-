import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';

describe('BooksController (unit)', () => {
  let controller: BooksController;
  const mockService = {
    findAll: jest
      .fn()
      .mockResolvedValue({ data: [], pagination: { total: 0 } }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [{ provide: BooksService, useValue: mockService }],
    }).compile();
    controller = module.get<BooksController>(BooksController);
  });

  it('GET /books -> returns list', async () => {
    const res = await controller.findAll({});
    expect(res).toHaveProperty('data');
  });
});
