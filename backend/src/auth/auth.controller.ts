import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { JwtPayload } from './types/jwt-payload';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(
    @Body() dto: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.signUp(dto);
    this.setAuthCookie(res, result.token);
    return result.user;
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.signIn(dto);
    this.setAuthCookie(res, result.token);
    return result.user;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: JwtPayload) {
    return user;
  }

  private setAuthCookie(res: Response, token: string) {
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';
    const maxAgeMs = 24 * 60 * 60 * 1000;
    res.cookie('access_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      maxAge: maxAgeMs,
      path: '/',
    });
  }
}
