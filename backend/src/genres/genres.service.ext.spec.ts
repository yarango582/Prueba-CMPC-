import { Test, TestingModule } from '@nestjs/testing';
import { GenresService } from './genres.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('GenresService additional tests', () => {
  let service: GenresService;
  const mockRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenresService,
        { provide: 'GenreRepository', useValue: mockRepo },
      ],
    }).compile();

    service = module.get<GenresService>(GenresService);
  });

  afterEach(() => jest.clearAllMocks());

  it('create throws ConflictException when exists', async () => {
    mockRepo.findOne.mockResolvedValue({ id: 'g1' });
    await expect(service.create({ name: 'Fic' } as any)).rejects.toThrow(
      ConflictException,
    );
  });

  it('findOne throws when not found', async () => {
    mockRepo.findByPk.mockResolvedValue(null);
    await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
  });

  it('findAll returns pagination shape', async () => {
    mockRepo.findAndCountAll.mockResolvedValue({
      rows: [{ id: 'g1', name: 'G' }],
      count: 1,
    });
    const res = await service.findAll({ page: 1, limit: 10 } as any, undefined);
    expect(res.pagination.total).toBe(1);
    expect(res.genres.length).toBe(1);
  });
});
