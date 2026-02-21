import { Controller, Get, Put, Body, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserProfileDto } from './dto/UserProfileDto';
import { GetUser } from 'src/common/decorators';
import type { User } from '@prisma/client';
import { JwtGuard } from 'src/common/guards';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Uncomment when auth is ready

@Controller('users')
// @UseGuards(JwtAuthGuard) // Protect these routes so only logged-in users can hit them
export class UsersController {
    constructor(private userService: UsersService) {}

    @UseGuards(JwtGuard)
    @Get('profile')
    async getUserProfile(@GetUser() user: User) {
        return this.userService.getUserProfile(user.id);
    }

    @UseGuards(JwtGuard)
    @Put('profile')
    async updateUserProfile(
        @GetUser() user: User,
        @Body() dto: UserProfileDto
    ) {
        const userId = user.id;
        return this.userService.updateUserProfile(userId, dto);
    } 
}