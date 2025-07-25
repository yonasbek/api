import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) { }

  async register(registerDto: RegisterDto): Promise<{ token: string, fullName: string, email: string, role: string }> {
    const { email, password, fullName, phoneNumber, jobTitle, username, departmentId, roleId, supervisorName, comments } = registerDto;

    // Check if user exists
    const userExists = await this.userRepository.findOne({ where: { email } });
    if (userExists) {
      throw new UnauthorizedException('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      fullName,
      phoneNumber,
      jobTitle,
      username,
      departmentId,
      roleId,
      supervisorName,
      comments,
    });

    await this.userRepository.save(user);

    // Generate JWT token
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return { token, fullName: user.fullName, email: user.email, role: user.jobTitle };
  }

  async login(loginDto: LoginDto): Promise<{ token: string, fullName: string, email: string, role: string }> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('user not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    // Generate JWT token
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return { token, fullName: user.fullName, email: user.email, role: user.jobTitle };
  }
} 