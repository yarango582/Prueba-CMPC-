import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles-guard';
import { ForbiddenException } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  const reflector = new Reflector();

  beforeEach(() => {
    guard = new RolesGuard(reflector as any);
  });

  it('allows when no roles metadata', () => {
    // no metadata set
    const context: any = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => ({}) }),
    };

    expect(guard.canActivate(context as any)).toBe(true);
  });

  it('throws when no user in request', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    const context: any = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => ({}) }),
    };

    expect(() => guard.canActivate(context as any)).toThrow(ForbiddenException);
  });

  it('throws when user role not included', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    const context: any = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => ({ user: { role: 'user' } }) }),
    };

    expect(() => guard.canActivate(context as any)).toThrow(ForbiddenException);
  });

  it('allows when role matches', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['user']);
    const context: any = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => ({ user: { role: 'user' } }) }),
    };

    expect(guard.canActivate(context as any)).toBe(true);
  });
});
