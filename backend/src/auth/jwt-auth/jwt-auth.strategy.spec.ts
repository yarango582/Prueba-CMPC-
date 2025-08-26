import { JwtStrategy, JwtPayload } from './jwt-auth.strategy';
import { UsersService } from '../../users/users.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  const mockUsersService = {
    findOne: jest.fn(),
  } as unknown as UsersService;

  beforeEach(() => {
  // Create a minimal mock ConfigService with `get` method
  const mockConfigService = { get: (k: string) => 'test-secret' } as any;
  strategy = new (JwtStrategy as any)(mockConfigService, mockUsersService);
  });

  it('should return payload when user exists and is active', async () => {
    const payload: JwtPayload = { email: 'a@b.com', sub: 'id-1', role: 'user' };
    mockUsersService.findOne = jest.fn().mockResolvedValue({ id: 'id-1', is_active: true });
    const result = await strategy.validate(payload);
    expect(result).toEqual(payload);
  });

  it('should throw when user not found', async () => {
    const payload: JwtPayload = { email: 'a@b.com', sub: 'id-2', role: 'user' };
    mockUsersService.findOne = jest.fn().mockResolvedValue(null);
    await expect(strategy.validate(payload)).rejects.toBeDefined();
  });
});
