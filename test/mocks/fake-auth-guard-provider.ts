import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FakeJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    request.user = {
      sub: '7fe45dc4-35cd-4e9d-82f4-c60e0e669401',
      user_email: 'tsrocha901@gmail.com',
      phone: '+5511999999999',
    }; // 🟢 Define um usuário mockado
    return true;
  }
}
