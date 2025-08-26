import { Test, TestingModule } from '@nestjs/testing';
import { AuthorsService } from './authors.service';
import { getModelToken } from '@nestjs/sequelize';
import { Author } from '../infrastructure/database/models/author.model';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('AuthorsService additional tests', () => {
  let service: AuthorsService;
  const mockAuthorModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorsService,
        { provide: getModelToken(Author), useValue: mockAuthorModel },
      ],
    }).compile();

    service = module.get<AuthorsService>(AuthorsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('create throws ConflictException when author exists', async () => {
    mockAuthorModel.findOne.mockResolvedValue({ id: 'a1' });
    await expect(
      service.create({ first_name: 'A', last_name: 'B' } as any),
    ).rejects.toThrow(ConflictException);
  });

  it('create returns author when not exists', async () => {
    mockAuthorModel.findOne.mockResolvedValue(null);
    const created = { id: 'a2', first_name: 'A', last_name: 'B' };
    mockAuthorModel.create.mockResolvedValue(created);

    const res = await service.create({
      first_name: 'A',
      last_name: 'B',
    } as any);
    expect(res).toEqual(created);
  });

  it('findOne throws NotFoundException when missing', async () => {
    mockAuthorModel.findByPk.mockResolvedValue(null);
    await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
  });
});
