import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import type { Request, Response } from 'express';

// dtos 
import { LoginDto, SignupDto } from './dto';

@Injectable()
export class AuthService {
    constructor(private config: ConfigService, private prisma: PrismaService) {}
    async signUserUp(dto: SignupDto, res: Response) {

    }
    async logUserIn(dto: LoginDto, res: Response) {

    }
    async logUserOut(id: string, res: Response) {

    }
    async getUserProfile(id: string) {

    }
}
