import { Test, TestingModule } from '@nestjs/testing';
import { AuthorsService } from './authors.service';
import { getModelToken } from '@nestjs/sequelize';
import { Author } from '../infrastructure/database/models/author.model';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('AuthorsService edge cases', () => {
  let service: AuthorsService;
  const mockModel: Partial<Record<string, jest.Mock>> = {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorsService,
        { provide: getModelToken(Author), useValue: mockModel },
      ],
    }).compile();

    service = module.get<AuthorsService>(AuthorsService);
    jest.clearAllMocks();
  });

  it('create throws ConflictException when author name exists', async () => {
    (mockModel.findOne as jest.Mock).mockResolvedValue({ id: 'a1' });
    await expect(
      service.create({ first_name: 'A', last_name: 'B' } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('findOne throws NotFoundException when missing', async () => {
    (mockModel.findByPk as jest.Mock).mockResolvedValue(null);
    await expect(service.findOne('nope')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('remove calls destroy on model instance', async () => {
    const inst: any = { destroy: jest.fn().mockResolvedValue(true) };
    (mockModel.findByPk as jest.Mock).mockResolvedValue(inst);
    await service.remove('id');
    expect(inst.destroy).toHaveBeenCalled();
  });
});
