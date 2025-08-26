import { Test, TestingModule } from '@nestjs/testing';
import { GenresService } from './genres.service';
import { getModelToken } from '@nestjs/sequelize';
import { Genre } from '../infrastructure/database/models/genre.model';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('GenresService edge cases', () => {
  let service: GenresService;
  const mockModel: Partial<Record<string, jest.Mock>> = {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenresService,
        { provide: getModelToken(Genre), useValue: mockModel },
      ],
    }).compile();

    service = module.get<GenresService>(GenresService);
    jest.clearAllMocks();
  });

  it('create throws ConflictException when name exists', async () => {
    (mockModel.findOne as jest.Mock).mockResolvedValue({ id: 'g1' });
    await expect(service.create({ name: 'X' } as any)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('findOne throws NotFoundException when missing', async () => {
    (mockModel.findByPk as jest.Mock).mockResolvedValue(null);
    await expect(service.findOne('nope')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
