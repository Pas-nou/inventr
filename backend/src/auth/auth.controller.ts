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
  Delete,
  Res,
  Param,
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

  /**
   * Authenticates a user and returns JWT access + refresh tokens.
   * Rate limited to 5 requests per minute to prevent brute force attacks.
   */
  @Throttle({ default: { ttl: 60, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() signInDto: LoginDto) {
    return this.authService.login(signInDto.email, signInDto.password);
  }

  /**
   * Registers a new user and sends a verification email.
   * Rate limited to 3 requests per minute to prevent spam.
   */
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

  /**
   * Verifies a user's email address using the token sent by email.
   * The token is consumed and invalidated after successful verification.
   */
  @HttpCode(HttpStatus.OK)
  @Get('verify-email')
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  /**
   * Resends a verification email to the given address.
   * Rate limited to 3 requests per minute to prevent abuse.
   */
  @Throttle({ default: { ttl: 60, limit: 3 } })
  @HttpCode(HttpStatus.OK)
  @Post('resend-verification')
  resendVerification(@Body() body: { email: string }) {
    return this.authService.resendVerificationEmail(body.email);
  }

  /**
   * Sends a password reset email to the given address.
   * Rate limited to 3 requests per 3 seconds to prevent abuse.
   */
  @Throttle({ default: { ttl: 3, limit: 3 } })
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  /**
   * Resets the user's password using a valid reset token.
   * The token is consumed and invalidated after successful reset.
   * Rate limited to 5 requests per minute.
   */
  @Throttle({ default: { ttl: 60, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  resetPassword(@Body() body: { token: string; new_password: string }) {
    return this.authService.resetPassword(body.token, body.new_password);
  }

  /**
   * Issues a new access token using a valid refresh token.
   * Used by the frontend interceptor to silently renew expired sessions.
   */
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(@Body() body: { userId: string; refresh_token: string }) {
    return this.authService.refresh(body.userId, body.refresh_token);
  }

  /**
   * Invalidates the user's refresh token and ends the session.
   */
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Request() req: RequestWithUser) {
    return this.authService.logout(req.user.userId);
  }

  /**
   * Updates the authenticated user's profile (name, email, password).
   * Password change requires the current password for verification.
   */
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

  /**
   * Exports all user data in JSON, CSV or XLSX format for GDPR compliance.
   * Includes profile, assets, documents metadata and maintenance events.
   */
  @Get('export')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async exportData(
    @Request() req: RequestWithUser,
    @Query('format') format: string = 'json',
    @Res() res: import('express').Response,
  ) {
    const timestamp = Date.now();

    if (format === 'csv') {
      const csv = await this.authService.exportUserDataAsCSV(req.user.userId);
      res.setHeader('Content-Type', 'text/csv; charset=utf8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="inventr-export-${timestamp}.csv"`,
      );
      return res.send(csv);
    }

    if (format === 'xlsx') {
      const buffer = await this.authService.exportUserDataAsXLSX(
        req.user.userId,
      );
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="inventr-export-${timestamp}.xlsx"`,
      );
      return res.send(Buffer.from(buffer));
    }

    const data = await this.authService.exportUserData(req.user.userId);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="inventr-export-${timestamp}.json"`,
    );

    return res.json(data);
  }

  /**
   * Permanently deletes the authenticated user's account and all associated data.
   * Requires password confirmation. Cascades to assets, documents and storage files.
   */
  @Delete('account')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteAccount(
    @Request() req: RequestWithUser,
    @Body() body: { password: string },
  ) {
    await this.authService.deleteAccount(req.user.userId, body.password);
    return { message: 'Compte supprimé avec succès' };
  }

  /**
   * Marks a single onboarding step as completed.
   * Called automatically by the frontend when the user completes each step.
   */
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Patch('onboarding/:step')
  completeOnboardingStep(
    @Request() req: RequestWithUser,
    @Param('step') step: 'first_asset' | 'first_document' | 'app_installed',
  ) {
    return this.authService.completeOnboardingStep(req.user.userId, step);
  }
}
