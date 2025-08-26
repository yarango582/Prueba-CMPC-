import { AuthService } from '../../../src/auth/auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  const mockUsersService: any = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
  };
  const mockJwtService: any = {
    sign: jest.fn().mockReturnValue('token'),
    verify: jest.fn(),
  };

  beforeEach(() => {
    authService = new AuthService(mockUsersService, mockJwtService);
  });

  it('login returns tokens when credentials valid', async () => {
    const user = {
      id: 'u1',
      email: 'a@b.com',
      password: '$2a$12$hash',
      is_active: true,
      role: 'user',
      first_name: 'A',
      last_name: 'B',
    };
    mockUsersService.findByEmail = jest.fn().mockResolvedValue(user);
    // bcrypt.compare will be called in validateUser; instead call validateUser stub directly
    // Simulate validateUser by mocking AuthService.validateUser
    (authService as any).validateUser = jest
      .fn()
      .mockResolvedValue({ ...user, password: undefined });

    const res = await authService.login({
      email: 'a@b.com',
      password: 'pass',
    } as any);
    expect(res.access_token).toBeDefined();
    expect(res.user.email).toEqual(user.email);
  });
});
