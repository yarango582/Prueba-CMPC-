import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/sequelize';
import { User } from '../infrastructure/database/models/user.model';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('UsersService update & remove', () => {
  let service: UsersService;
  const mockUserModel: Partial<Record<string, jest.Mock>> = {
    findByPk: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User),
          useValue: mockUserModel as unknown as typeof User,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('throws ConflictException when updating email to an existing one', async () => {
    const id = 'user-1';
    const existing = { id: 'user-2', email: 'taken@example.com' };
    const userInstance = {
      id,
      email: 'old@example.com',
      update: jest.fn(),
      toJSON: () => ({ id, email: 'old@example.com' }),
    };

    mockUserModel.findByPk!.mockResolvedValueOnce(userInstance);
    mockUserModel.findOne!.mockResolvedValueOnce(existing);

    await expect(
      service.update(id, { email: 'taken@example.com' } as any),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(mockUserModel.findByPk).toHaveBeenCalledWith(id, {
      attributes: { exclude: ['password'] },
    });
  });

  it('hashes password when updating and returns fresh user', async () => {
    const id = 'user-1';
    const userInstance = {
      id,
      email: 'old@example.com',
      password: 'hash',
      update: jest.fn().mockResolvedValue(true),
      toJSON: () => ({ id, email: 'old@example.com' }),
    };

    mockUserModel.findByPk!.mockResolvedValueOnce(userInstance);
    mockUserModel.findOne!.mockResolvedValueOnce(null); // no email conflict
    // second findByPk for returning fresh user (simulate serialized user from DB)
    mockUserModel.findByPk!.mockResolvedValueOnce({
      id,
      email: 'old@example.com',
    });

    const spyHash = jest
      .spyOn(bcrypt as any, 'hash')
      .mockResolvedValue('newhash');

    const res = await service.update(id, { password: 'newpass' } as any);

    expect(spyHash).toHaveBeenCalledWith('newpass', 12);
    expect(userInstance.update).toHaveBeenCalledWith({ password: 'newhash' });
    expect(res).toEqual({ id, email: 'old@example.com' });

    spyHash.mockRestore();
  });

  it('remove calls destroy on found user', async () => {
    const id = 'user-1';
    const destroyed = { destroy: jest.fn().mockResolvedValue(true) } as any;
    const userInstance = {
      id,
      email: 'a@b.com',
      destroy: destroyed.destroy,
      toJSON: () => ({ id, email: 'a@b.com' }),
    };

    mockUserModel.findByPk!.mockResolvedValueOnce(userInstance);

    await service.remove(id);

    expect(userInstance.destroy).toHaveBeenCalled();
  });

  it('findOne throws NotFoundException when not found (sanity)', async () => {
    mockUserModel.findByPk!.mockResolvedValueOnce(null);
    await expect(service.findOne('nope')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
