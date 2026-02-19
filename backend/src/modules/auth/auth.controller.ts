import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';

// dtos
import { LoginDto, SignupDto } from './dto';

// types
import type { User } from '@prisma/client';
import type { Response } from 'express';

// decorators
import { GetUser } from 'src/common/decorators';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get()
  async isUserAuthenticated(@GetUser() user: User) {
    if (user) return { isAuth: true, user: user };
    return { isAuth: false, user: null };
  }

  // We're using @Res to SEND COOKIES. We access the underlying res object to do so.
  @Post('signup')
  async signUserUp(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signUserUp(dto, res);
  }

  @Post('login')
  async logUserIn(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logUserIn(dto, res);
  }

  @Post('logout')
  async logUserOut(
    @GetUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logUserOut(user.id, res);
  }

  @Get('profile')
  async getUserProfile(@GetUser() user: User) {
    return this.authService.getUserProfile(user.id);
  }
}
