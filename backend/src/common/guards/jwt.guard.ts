import { AuthGuard } from '@nestjs/passport';

// 'jwt' must match the string passed into PassportStrategy(Strategy, 'jwt')
export class JwtGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }
}