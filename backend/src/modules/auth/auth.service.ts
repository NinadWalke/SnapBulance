import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import type { Response } from 'express';

// dtos 
import { LoginDto, SignupDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async signUserUp(dto: SignupDto, res: Response) {
    try {
      // 1. Check if user already exists
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: dto.email.toLowerCase() },
            { phone: dto.phone },
          ],
        },
      });

      if (existingUser) {
        throw new ConflictException('Email or phone number already in use');
      }

      // 2. Generate password hash
      const hashed = await argon.hash(dto.passwordHash);

      // 3. Build the User Create Payload
      const role = dto.role || 'USER';
      const userCreateData: any = {
        email: dto.email.toLowerCase(),
        phone: dto.phone,
        fullName: dto.fullName,
        passwordHash: hashed,
        role: role,
      };

      // 4. Attach nested profiles with hardcoded Dev coordinates (Thane)
      if (role === 'DRIVER') {
        userCreateData.driverProfile = {
          create: {
            licenseNumber: `PENDING-DL-${Date.now()}`, 
            yearsExperience: 0,
            status: 'AVAILABLE', // Set to AVAILABLE so distance math runs
            currentLat: 19.1973, // Default: Thane
            currentLng: 72.9644,
            ambulance: {         // Attach a dummy ambulance so the profile is complete
              create: {
                plateNumber: `PENDING-AB-${Date.now()}`,
                type: 'BLS',
                model: 'Pending Vehicle',
                equipmentList: ['Basic First Aid'],
              }
            }
          },
        };
      } else if (role === 'CFR') {
        userCreateData.cfrProfile = {
          create: {
            certificationId: `PENDING-CFR-${Date.now()}`,
            isVerified: true, // Auto-verify for dev testing
            // Note: Add currentLat and currentLng here AFTER updating Prisma schema
          },
        };
      } else if (role === 'HOSPITAL_ADMIN') {
        userCreateData.hospitalProfile = {
          create: {
            hospital: {
              create: {
                name: `Pending Hospital ${Date.now()}`,
                address: 'Thane Area, Default',
                latitude: 19.2064, // Default: Thane
                longitude: 72.9744,
                phone: dto.phone,
                availableBeds: 5,
                icuAvailable: 1,
                specialties: ['General'],
              },
            },
          },
        };
      }

      // 5. Save everything in one transaction
      const newUser = await this.prisma.user.create({
        data: userCreateData,
      });

      // 6. Sign JWT
      const token = await this.signToken(newUser.id, newUser.email, newUser.role);

      // 7. Attach Cookie
      res.cookie('access_token', token, {
        httpOnly: true,
        secure: this.config.get('NODE_ENV') === 'production',
        sameSite: 'lax', 
        maxAge: 24 * 60 * 60 * 1000, 
      });

      // 8. Return safe user
      const { passwordHash, ...safeUser } = newUser;

      return { 
        message: 'Welcome to SnapBulance!', 
        user: safeUser 
      };

    } catch (error) {
      if (error instanceof ConflictException) throw error;
      console.error('Signup Error:', error);
      throw new InternalServerErrorException('Something went wrong during signup');
    }
  }

  async logUserIn(dto: LoginDto, res: Response) {
    try {
      // 1. Check for existing user
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email.toLowerCase() },
      });

      if (!user) throw new ForbiddenException('Invalid credentials');

      // 2. Verify the password
      const passValid = await argon.verify(user.passwordHash, dto.passwordHash);
      if (!passValid) throw new ForbiddenException('Invalid credentials');

      // 3. Sign the JWT access token
      const token = await this.signToken(user.id, user.email, user.role);

      // 4. Attach token to HTTP-only cookie
      res.cookie('access_token', token, {
        httpOnly: true,
        secure: this.config.get('NODE_ENV') === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      // 5. Strip the hash before returning
      const { passwordHash, ...safeUser } = user;

      return { message: 'Login successful', user: safeUser };

    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      console.error('Login Error:', error);
      throw new InternalServerErrorException('Something went wrong during login');
    }
  }

  async logUserOut(id: string, res: Response) {
    // Clear the cookie by setting an expired date/empty value
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'lax',
    });

    return { message: 'Logged out successfully' };
  }

  async getUserProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) throw new NotFoundException('User not found');

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  // -- Helper Functions --

  async signToken(userId: string, email: string, role: string): Promise<string> {
    const payload = { sub: userId, email, role };
    
    return this.jwt.signAsync(payload, {
      expiresIn: '1d', 
      secret: this.config.get('JWT_SECRET'),
    });
  }
}