import { Test, TestingModule } from '@nestjs/testing';
import { PublishersService } from './publishers.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('PublishersService additional tests', () => {
  let service: PublishersService;
  const mockRepo: any = {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublishersService,
        { provide: 'PublisherRepository', useValue: mockRepo },
      ],
    }).compile();
    service = module.get<PublishersService>(PublishersService);
  });

  afterEach(() => jest.clearAllMocks());

  it('create throws ConflictException when exists', async () => {
    mockRepo.findOne.mockResolvedValue({ id: 'p1' });
    await expect(service.create({ name: 'P' } as any)).rejects.toThrow(
      ConflictException,
    );
  });

  it('findOne throws when not found', async () => {
    mockRepo.findByPk.mockResolvedValue(null);
    await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
  });

  it('findAll returns pagination', async () => {
    mockRepo.findAndCountAll.mockResolvedValue({
      rows: [{ id: 'p1' }],
      count: 1,
    });
  const res = await service.findAll({ page: 1, limit: 10 } as any, undefined as any);
    expect(res.pagination.total).toBe(1);
  });
});
