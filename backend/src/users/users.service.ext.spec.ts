import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import * as bcrypt from 'bcryptjs';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UsersService additional tests', () => {
  let service: UsersService;
  const mockRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: 'UserRepository', useValue: mockRepo },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  it('create throws ConflictException when email exists', async () => {
    mockRepo.findOne.mockResolvedValue({ id: 'u1' });
    await expect(
      service.create({ email: 'x@x.com', password: 'p' } as any),
    ).rejects.toThrow(ConflictException);
  });

  it('create hashes password and creates user', async () => {
    mockRepo.findOne.mockResolvedValue(null);
  (bcrypt.hash as jest.Mock) = jest.fn().mockResolvedValue('hashed');
    mockRepo.create.mockResolvedValue({ id: 'u2', email: 'x@x.com' });

    const res = await service.create({
      email: 'x@x.com',
      password: 'p',
    } as any);
    expect(res).toEqual({ id: 'u2', email: 'x@x.com' });
  });

  it('findOne throws NotFoundException when missing', async () => {
    mockRepo.findByPk.mockResolvedValue(null);
    await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
  });
});
