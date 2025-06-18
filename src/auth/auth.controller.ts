import { Controller, Post, Body, Get, UseGuards, Request, HttpCode, HttpStatus, Logger, BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/auth.guard';
import { User } from '../user/entities/user.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar novo usuário' })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuário registrado com sucesso',
    type: AuthResponseDto 
  })
  @ApiResponse({ status: 409, description: 'Email ou CPF já em uso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    this.logger.log('DTO recebido:', registerDto);
    this.logger.log(`Tentativa de cadastro: ${registerDto.email} / ${registerDto.cpf}`);
    try {
      const result = await this.authService.register(registerDto);
      this.logger.log(`Cadastro realizado com sucesso: ${registerDto.email}`);
      return result;
    } catch (error) {
      this.logger.error(`Erro ao cadastrar usuário: ${registerDto.email}`, error.stack);
      if (error.code === '23505') { // Unique violation (Postgres)
        throw new ConflictException('Email ou CPF já em uso');
      }
      throw new BadRequestException(error.message);
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login do usuário' })
  @ApiResponse({ 
    status: 200, 
    description: 'Login realizado com sucesso',
    type: AuthResponseDto 
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    this.logger.log(`Tentativa de login: ${loginDto.identifier}`);
    try {
      const result = await this.authService.login(loginDto);
      this.logger.log(`Login realizado com sucesso: ${loginDto.identifier}`);
      return result;
    } catch (error) {
      this.logger.warn(`Falha no login para: ${loginDto.identifier} - Motivo: ${error.message}`);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter perfil do usuário autenticado' })
  @ApiResponse({ 
    status: 200, 
    description: 'Perfil do usuário',
    type: User
  })
  @ApiResponse({ status: 401, description: 'Token inválido ou expirado' })
  async getProfile(@Request() req): Promise<Omit<User, 'password'>> {
    return this.authService.getProfile(req.user);
  }
}