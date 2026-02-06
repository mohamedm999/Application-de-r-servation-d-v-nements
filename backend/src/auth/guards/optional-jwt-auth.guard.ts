import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Optional JWT Auth Guard - does NOT throw if no token is provided.
 * If a valid token is present, user will be attached to the request.
 * If no token or invalid token, request continues with user = undefined.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Try to authenticate, but don't block if it fails
    return super.canActivate(context);
  }

  handleRequest<TUser>(err: Error | null, user: TUser | false): TUser | undefined {
    // If there's an error or no user, just return undefined (don't throw)
    if (err || !user) {
      return undefined as any;
    }
    return user;
  }
}
