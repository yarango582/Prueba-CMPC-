import { LocalAuthGuard } from './local-auth.guard';
import { LocalStrategy } from './local-auth.strategy';
import { UnauthorizedException } from '@nestjs/common';

describe('Local auth', () => {
  it('LocalAuthGuard allows activation', () => {
    const guard = new LocalAuthGuard();
    // ExecutionContext not needed as guard returns true
    expect(guard.canActivate({} as any)).toBe(true);
  });

  it('LocalStrategy validate returns user or throws', async () => {
    const mockAuthService: any = {
      validateUser: jest.fn().mockResolvedValue({ id: 'u1' }),
    };
    const strat = new LocalStrategy(mockAuthService);
    const user = await strat.validate('a@b.com', 'pass');
    expect(user).toEqual({ id: 'u1' });

    mockAuthService.validateUser.mockResolvedValue(null);
    const strat2 = new LocalStrategy(mockAuthService);
    await expect(strat2.validate('x', 'y')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
