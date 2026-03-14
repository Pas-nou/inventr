import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Patch,
  Get,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';

interface RequestWithUser extends Request {
  user: { userId: string; email: string };
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Throttle({ default: { ttl: 60, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() signInDto: LoginDto) {
    return this.authService.login(signInDto.email, signInDto.password);
  }
  @Throttle({ default: { ttl: 60, limit: 3 } })
  @Post('register')
  register(@Body() signUpDto: RegisterDto) {
    return this.authService.register(
      signUpDto.email,
      signUpDto.password,
      signUpDto.first_name,
      signUpDto.last_name,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get('verify-email')
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Throttle({ default: { ttl: 60, limit: 3 } })
  @HttpCode(HttpStatus.OK)
  @Post('resend-verification')
  resendVerification(@Body() body: { email: string }) {
    return this.authService.resendVerificationEmail(body.email);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(@Body() body: { userId: string; refresh_token: string }) {
    return this.authService.refresh(body.userId, body.refresh_token);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Request() req: RequestWithUser) {
    return this.authService.logout(req.user.userId);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(
    @Request() req: RequestWithUser,
    @Body()
    body: {
      first_name?: string;
      last_name?: string;
      email?: string;
      current_password?: string;
      new_password?: string;
    },
  ) {
    return this.authService.updateProfile(req.user.userId, body);
  }
}
