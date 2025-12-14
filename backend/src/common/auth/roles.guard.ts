import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, AppRole } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AppRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles required, allow 
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Only throw if roles are required 
    if (!user) throw new ForbiddenException('Login required');

    const roles: string[] = Array.isArray(user.roles) ? user.roles : [];
    const ok = requiredRoles.some((r) => roles.includes(r));
    if (!ok) throw new ForbiddenException('Insufficient role');
    return true;
  }
}
