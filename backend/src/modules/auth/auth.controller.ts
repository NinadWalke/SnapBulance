import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './dto';
import type { User } from '@prisma/client';
import type { Response } from 'express';
import { GetUser } from 'src/common/decorators';
import { JwtGuard } from 'src/common/guards';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // 1. Protected Route: Validates the cookie on app load
  @UseGuards(JwtGuard)
  @Get()
  async isUserAuthenticated(@GetUser() user: User) {
    // If the Guard passes, it means the cookie is valid and we have a user
    return { isAuth: true, user: user };
  }

  // 2. Public Route: Anyone can sign up
  @Post('signup')
  async signUserUp(@Body() dto: SignupDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.signUserUp(dto, res);
  }

  // 3. Public Route: Anyone can log in
  @Post('login')
  async logUserIn(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.logUserIn(dto, res);
  }

  // 4. Protected Route: You must be logged in to log out
  @UseGuards(JwtGuard)
  @Post('logout')
  async logUserOut(@GetUser('id') userId: string, @Res({ passthrough: true }) res: Response) {
    return this.authService.logUserOut(userId, res);
  }

  // 5. Protected Route: Get full profile
  @UseGuards(JwtGuard)
  @Get('profile')
  async getUserProfile(@GetUser() user: User) {
    return this.authService.getUserProfile(user.id);
  }
}