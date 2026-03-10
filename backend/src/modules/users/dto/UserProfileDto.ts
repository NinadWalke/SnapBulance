import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class UserProfileDto {
  @IsOptional()
  @IsString()
  fullName: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsNumber()
  phone: string;
  
  @IsOptional()
  @IsString()
  bloodType?: string;

  @IsOptional()
  @IsString()
  allergies?: string;

  @IsOptional()
  @IsString()
  emergencyContact?: string;
}