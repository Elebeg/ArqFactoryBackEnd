import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { RegisterDto } from '../auth/dto/auth.dto';
import { CpfValidator } from '../common/validators/cpf.validator';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(registerDto: RegisterDto): Promise<User> {
    const { firstName, lastName, email, cpf, password } = registerDto;

    // Validar CPF
    if (!CpfValidator.validate(cpf)) {
      throw new ConflictException('CPF inválido');
    }

    // Limpar CPF (remover pontos e traços)
    const cleanCpf = CpfValidator.clean(cpf);

    // Verificar se email já existe
    const existingUserByEmail = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUserByEmail) {
      throw new ConflictException('Email já está em uso');
    }

    // Verificar se CPF já existe
    const existingUserByCpf = await this.userRepository.findOne({
      where: { cpf: cleanCpf },
    });

    if (existingUserByCpf) {
      throw new ConflictException('CPF já está em uso');
    }

    // Hash da senha
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Criar usuário
    const user = this.userRepository.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      cpf: cleanCpf,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async findByEmailOrCpf(identifier: string): Promise<User | null> {
    // Verificar se é email ou CPF
    const isEmail = identifier.includes('@');
    
    if (isEmail) {
      return this.userRepository.findOne({
        where: { email: identifier.toLowerCase() },
      });
    } else {
      // É CPF - limpar antes de buscar
      const cleanCpf = CpfValidator.clean(identifier);
      return this.userRepository.findOne({
        where: { cpf: cleanCpf },
      });
    }
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, isActive: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}