import { ExecutionContext } from '@nestjs/common';
import { CurrentUserFactory } from './current-user.decorator';

describe('CurrentUser decorator', () => {
  it('returns null when no user on request', () => {
    const ctx = {
      switchToHttp: () => ({ getRequest: () => ({}) }),
    } as unknown as ExecutionContext;

    const result = CurrentUserFactory(undefined, ctx as ExecutionContext);
    expect(result).toBeNull();
  });

  it('returns user or property when present', () => {
    const user = { sub: '123', email: 'a@b.c', role: 'user', name: 'Alice' };
    const ctx = {
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    } as unknown as ExecutionContext;

    const full = CurrentUserFactory(undefined, ctx as ExecutionContext);
    expect(full).toEqual(user);

    const sub = CurrentUserFactory('sub', ctx as ExecutionContext);
    expect(sub).toBe('123');

    const name = CurrentUserFactory('name', ctx as ExecutionContext);
    expect(name).toBe('Alice');
  });
});
