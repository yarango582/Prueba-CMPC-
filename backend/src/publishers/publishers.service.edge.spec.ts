import { Test, TestingModule } from '@nestjs/testing';
import { PublishersService } from './publishers.service';
import { getModelToken } from '@nestjs/sequelize';
import { Publisher } from '../infrastructure/database/models/publisher.model';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('PublishersService edge cases', () => {
  let service: PublishersService;
  const mockModel: Partial<Record<string, jest.Mock>> = {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublishersService,
        { provide: getModelToken(Publisher), useValue: mockModel },
      ],
    }).compile();

    service = module.get<PublishersService>(PublishersService);
    jest.clearAllMocks();
  });

  it('create throws ConflictException when name exists', async () => {
    (mockModel.findOne as jest.Mock).mockResolvedValue({ id: 'p1' });
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
