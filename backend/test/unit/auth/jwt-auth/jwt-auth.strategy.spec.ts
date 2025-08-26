import {
  JwtStrategy,
  JwtPayload,
} from '../../../../src/auth/jwt-auth/jwt-auth.strategy';
import { UsersService } from '../../../../src/users/users.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  const mockUsersService = {
    findOne: jest.fn(),
  } as unknown as UsersService;

  beforeEach(() => {
    // @ts-ignore mocking ConfigService constructor param
    strategy = new (JwtStrategy as any)(
      { get: () => 'test-secret' },
      mockUsersService,
    );
  });

  it('should return payload when user exists and is active', async () => {
    const payload: JwtPayload = { email: 'a@b.com', sub: 'id-1', role: 'user' };
    mockUsersService.findOne = jest
      .fn()
      .mockResolvedValue({ id: 'id-1', is_active: true });
    const result = await strategy.validate(payload);
    expect(result).toEqual(payload);
  });

  it('should throw when user not found', async () => {
    const payload: JwtPayload = { email: 'a@b.com', sub: 'id-2', role: 'user' };
    mockUsersService.findOne = jest.fn().mockResolvedValue(null);
    await expect(strategy.validate(payload)).rejects.toBeDefined();
  });
});
