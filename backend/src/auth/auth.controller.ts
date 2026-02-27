import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() signInDto: LoginDto) {
    return this.authService.login(signInDto.email, signInDto.password);
  }
  @Post('register')
  register(@Body() signUpDto: RegisterDto) {
    return this.authService.register(
      signUpDto.email,
      signUpDto.password,
      signUpDto.first_name,
      signUpDto.last_name,
    );
  }
}
