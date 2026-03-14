import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { User } from '../users/entities/user.entity';
import { EmailService } from '../email/email.service';
import type { StringValue } from 'ms';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) {
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = randomUUID();
    const verificationTokenExpiresAt = new Date(
      Date.now() + 48 * 60 * 60 * 1000,
    );
    const newUser = this.usersRepository.create({
      email,
      password_hash: hashedPassword,
      first_name: firstName,
      last_name: lastName,
      verification_token: verificationToken,
      verification_token_expires_at: verificationTokenExpiresAt,
    });

    const savedUser = await this.usersRepository.save(newUser);

    await this.emailService.sendVerificationEmail(
      savedUser.email,
      savedUser.first_name,
      verificationToken,
    );

    const { password_hash: _password_hash, ...result } = savedUser;

    return result;
  }

  async login(email: string, password: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.email_verified) {
      throw new UnauthorizedException('EMAIL_NOT_VERIFIED');
    }

    const tokens = await this.generateTokens(user);
    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    };
  }

  async verifyEmail(token: string) {
    const user = await this.usersRepository.findOne({
      where: { verification_token: token },
    });

    if (!user) {
      throw new UnauthorizedException('Token invalide');
    }

    if (
      !user.verification_token_expires_at ||
      user.verification_token_expires_at < new Date()
    ) {
      throw new UnauthorizedException('TOKEN_EXPIRED');
    }

    await this.usersRepository.update(user.id, {
      email_verified: true,
      verification_token: null,
      verification_token_expires_at: null,
    });
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user || user.email_verified) {
      return;
    }

    const verificationToken = randomUUID();
    const verificationTokenExpiresAt = new Date(
      Date.now() + 48 * 60 * 60 * 1000,
    );

    await this.usersRepository.update(user.id, {
      verification_token: verificationToken,
      verification_token_expires_at: verificationTokenExpiresAt,
    });

    await this.emailService.sendVerificationEmail(
      user.email,
      user.first_name,
      verificationToken,
    );
  }

  async refresh(userId: string, refreshToken: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user || !user.refresh_token)
      throw new UnauthorizedException('Accès refusé');
    const isValid = await bcrypt.compare(refreshToken, user.refresh_token);
    if (!isValid) throw new UnauthorizedException('Accès refusé');
    return this.generateTokens(user);
  }

  async logout(userId: string) {
    await this.usersRepository.update(userId, { refresh_token: null });
  }

  private async generateTokens(user: User) {
    const payload = { email: user.email, sub: user.id };
    const JwtExpiration =
      this.configService.getOrThrow<string>('JWT_EXPIRATION');
    const JwtRefreshSecret =
      this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
    const JwtRefreshExpiration = this.configService.getOrThrow<string>(
      'JWT_REFRESH_EXPIRATION',
    );
    const access_token = this.jwtService.sign(payload, {
      expiresIn: JwtExpiration as StringValue,
    });
    const refresh_token = this.jwtService.sign(payload, {
      secret: JwtRefreshSecret,
      expiresIn: JwtRefreshExpiration as StringValue,
    });
    const hashedRefreshToken = await bcrypt.hash(refresh_token, 10);
    await this.usersRepository.update(user.id, {
      refresh_token: hashedRefreshToken,
    });
    return { access_token, refresh_token };
  }

  async updateProfile(
    userId: string,
    data: {
      first_name?: string;
      last_name?: string;
      email?: string;
      current_password?: string;
      new_password?: string;
    },
  ): Promise<{
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  }> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) throw new Error('User not found');

    if (data.first_name) user.first_name = data.first_name;
    if (data.last_name) user.last_name = data.last_name;
    if (data.email) user.email = data.email;
    if (data.new_password) {
      if (!data.current_password) {
        throw new UnauthorizedException('Mot de passe actuel requis');
      }
      const isValid = await bcrypt.compare(
        data.current_password,
        user.password_hash,
      );
      if (!isValid) {
        throw new UnauthorizedException('Mot de passe actuel incorrect');
      }
      user.password_hash = await bcrypt.hash(data.new_password, 10);
    }
    await this.usersRepository.save(user);
    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
    };
  }
}
