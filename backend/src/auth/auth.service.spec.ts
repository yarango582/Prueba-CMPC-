import { AuthService } from './auth.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  const mockUsersService: any = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
  };
  const mockJwtService: Partial<JwtService> = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService(mockUsersService, mockJwtService as any);
  });

  it('validateUser returns user profile without password when credentials match', async () => {
    const userFromDb: any = {
      id: 'u1',
      email: 'a@b.com',
      password: '$2a$12$hash',
      first_name: 'A',
      last_name: 'B',
      toJSON() {
        return { ...this };
      },
    };

    mockUsersService.findByEmail.mockResolvedValue(userFromDb);
    jest.spyOn(bcrypt as any, 'compare').mockResolvedValue(true);

    const res = await authService.validateUser('a@b.com', 'plain');
    expect(res).toBeDefined();
    expect((res as any).password).toBeUndefined();
    expect(res.email).toEqual(userFromDb.email);
  });

  it('validateUser returns null when user not found or password mismatch', async () => {
    mockUsersService.findByEmail.mockResolvedValue(null);
    let res = await authService.validateUser('x@y.com', 'plain');
    expect(res).toBeNull();

    const userFromDb: any = {
      id: 'u2',
      password: 'hash',
      toJSON() {
        return { ...this };
      },
    };
    mockUsersService.findByEmail.mockResolvedValue(userFromDb);
    jest.spyOn(bcrypt as any, 'compare').mockResolvedValue(false);
    res = await authService.validateUser('x@y.com', 'plain');
    expect(res).toBeNull();
  });

  it('login returns tokens and user when credentials valid and user active', async () => {
    const user = {
      id: 'u1',
      email: 'a@b.com',
      is_active: true,
      role: 'user',
      first_name: 'A',
      last_name: 'B',
    } as any;

    (authService as any).validateUser = jest.fn().mockResolvedValue(user);
    (mockJwtService.sign as jest.Mock)
      .mockReturnValueOnce('access')
      .mockReturnValueOnce('refresh');

    const res = await authService.login({
      email: 'a@b.com',
      password: 'pass',
    } as any);
    expect(res.access_token).toEqual('access');
    expect(res.refresh_token).toEqual('refresh');
    expect(res.user.email).toEqual(user.email);
  });

  it('login throws UnauthorizedException when credentials invalid', async () => {
    (authService as any).validateUser = jest.fn().mockResolvedValue(null);
    await expect(
      authService.login({ email: 'a', password: 'b' } as any),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('login throws UnauthorizedException when user inactive', async () => {
    const user = { id: 'u1', email: 'a@b.com', is_active: false } as any;
    (authService as any).validateUser = jest.fn().mockResolvedValue(user);
    await expect(
      authService.login({ email: 'a', password: 'b' } as any),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('register throws ConflictException when email already exists', async () => {
    mockUsersService.findByEmail.mockResolvedValue({ id: 'x' });
    await expect(
      authService.register({ email: 'a' } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('register creates user and returns tokens', async () => {
    mockUsersService.findByEmail.mockResolvedValue(null);
    const createdUser = {
      id: 'u3',
      email: 'c@d.com',
      first_name: 'C',
      last_name: 'D',
      role: 'user',
    } as any;
    mockUsersService.create.mockResolvedValue(createdUser);
    (mockJwtService.sign as jest.Mock)
      .mockReturnValueOnce('access')
      .mockReturnValueOnce('refresh');

    const res = await authService.register({ email: 'c@d.com' } as any);
    expect(res.access_token).toEqual('access');
    expect(res.refresh_token).toEqual('refresh');
    expect(res.user.email).toEqual(createdUser.email);
  });

  it('refreshToken throws UnauthorizedException for invalid token', async () => {
    (mockJwtService.verify as jest.Mock).mockImplementation(() => {
      throw new Error('bad');
    });
    await expect(
      authService.refreshToken({ refresh_token: 'x' } as any),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refreshToken throws UnauthorizedException when user not active', async () => {
    (mockJwtService.verify as jest.Mock).mockReturnValue({ sub: 'u1' });
    mockUsersService.findOne.mockResolvedValue({ id: 'u1', is_active: false });
    await expect(
      authService.refreshToken({ refresh_token: 'x' } as any),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refreshToken returns new access token when valid', async () => {
    (mockJwtService.verify as jest.Mock).mockReturnValue({ sub: 'u1' });
    mockUsersService.findOne.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      is_active: true,
      role: 'user',
    } as any);
    (mockJwtService.sign as jest.Mock).mockReturnValue('newaccess');

    const res = await authService.refreshToken({ refresh_token: 'ok' } as any);
    expect(res.access_token).toEqual('newaccess');
    expect(res.expires_in).toBeDefined();
  });

  it('getProfile returns profile without password', async () => {
    const user: any = {
      id: 'u1',
      email: 'a@b.com',
      password: 'x',
      toJSON() {
        return { id: this.id, email: this.email };
      },
    };
    mockUsersService.findOne.mockResolvedValue(user);
    const res = await authService.getProfile('u1');
    expect(res.password).toBeUndefined();
    expect(res.email).toEqual('a@b.com');
  });
});
