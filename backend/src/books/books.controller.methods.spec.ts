import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';

describe('BooksController methods', () => {
  let controller: BooksController;
  const mockService = {
    create: jest.fn().mockResolvedValue({ id: 'b1' }),
    findAll: jest.fn().mockResolvedValue({ books: [], pagination: {} }),
    findOne: jest.fn().mockResolvedValue({ id: 'b1' }),
    update: jest.fn().mockResolvedValue({ id: 'b1' }),
    remove: jest.fn().mockResolvedValue(undefined),
    uploadImage: jest.fn().mockResolvedValue({ id: 'b1', image_url: 'u' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [{ provide: BooksService, useValue: mockService }],
    }).compile();

    controller = module.get<BooksController>(BooksController);
    jest.clearAllMocks();
  });

  it('create calls service.create', async () => {
    const res = await controller.create({ title: 'T' } as any, 'u1');
    expect(res).toEqual({ id: 'b1' });
    expect(mockService.create).toHaveBeenCalled();
  });

  it('findAll calls service.findAll', async () => {
    const res = await controller.findAll({} as any);
    expect(res).toHaveProperty('books');
  });

  it('findOne calls service.findOne', async () => {
    const res = await controller.findOne('b1');
    expect(res).toEqual({ id: 'b1' });
  });

  it('update calls service.update', async () => {
    await expect(controller.update('b1', {} as any, 'u1')).resolves.toEqual({
      id: 'b1',
    });
  });

  it('remove calls service.remove', async () => {
    await expect(controller.remove('b1', 'u1')).resolves.toBeUndefined();
  });

  it('uploadImage calls service.uploadImage', async () => {
    const file = {
      buffer: Buffer.from('x'),
      mimetype: 'image/png',
      size: 10,
      originalname: 'test.png',
    };
    const res = await controller.uploadImage('b1', file as any, 'u1');
    expect(res).toHaveProperty('image_url');
  });
});
