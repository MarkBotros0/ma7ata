import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserRole } from '../../users/enums/user-roles.enum';

@Injectable()
export class TeacherGuard implements CanActivate {
  canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const roles = request.user?.userRoles;

    return request.user && roles.includes(UserRole.TEACHER);
  }
}
