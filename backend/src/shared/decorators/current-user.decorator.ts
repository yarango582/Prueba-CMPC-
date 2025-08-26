import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface AuthUser {
  sub: string;
  email: string;
  role: string;
  [key: string]: unknown;
}

/**
 * @CurrentUser() -> returns the entire user object attached by Passport (req.user)
 * @CurrentUser('sub') -> returns a specific property from req.user
 */
export const CurrentUserFactory = (
  data: string | undefined,
  ctx: ExecutionContext,
) => {
  const request = ctx.switchToHttp().getRequest<Request>();
  const user = request?.user as AuthUser | undefined;
  if (!user) return null;
  return data ? (user[data] as unknown) : user;
};

export const CurrentUser = createParamDecorator(CurrentUserFactory);
