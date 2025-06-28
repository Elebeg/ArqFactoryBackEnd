import { IsString, IsEmail, IsOptional, IsBoolean, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreateClientDto {
  @ApiProperty({ description: 'Nome do cliente' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString({ message: 'Nome deve ser uma string' })
  @Length(2, 100, { message: 'Nome deve ter entre 2 e 100 caracteres' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed;
    }
    return value;
  })
  name: string;

  @ApiProperty({ description: 'Email do cliente', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @Transform(({ value }) => {
    // Se for string vazia, null ou undefined, retornar undefined
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return undefined;
    }
    return typeof value === 'string' ? value.trim() : value;
  })
  email?: string;

  @ApiProperty({ description: 'Telefone do cliente' })
  @IsNotEmpty({ message: 'Telefone é obrigatório' })
  @IsString({ message: 'Telefone deve ser uma string' })
  @Length(10, 15, { message: 'Telefone deve ter entre 10 e 15 caracteres' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      // Remove todos os caracteres não numéricos para validação
      const cleanPhone = value.replace(/\D/g, '');
      return cleanPhone;
    }
    return value;
  })
  phone: string;

  @ApiProperty({ description: 'CPF do cliente', required: false })
  @IsOptional()
  @IsString({ message: 'CPF deve ser uma string' })
  @Length(11, 14, { message: 'CPF deve ter 11 dígitos' })
  @Transform(({ value }) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return undefined;
    }
    if (typeof value === 'string') {
      // Remove pontos e traços do CPF
      const cleanCPF = value.replace(/\D/g, '');
      return cleanCPF.length === 11 ? cleanCPF : value;
    }
    return value;
  })
  cpf?: string;

  @ApiProperty({ description: 'CNPJ do cliente', required: false })
  @IsOptional()
  @IsString({ message: 'CNPJ deve ser uma string' })
  @Length(14, 18, { message: 'CNPJ deve ter 14 dígitos' })
  @Transform(({ value }) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return undefined;
    }
    if (typeof value === 'string') {
      // Remove pontos, barras e traços do CNPJ
      const cleanCNPJ = value.replace(/\D/g, '');
      return cleanCNPJ.length === 14 ? cleanCNPJ : value;
    }
    return value;
  })
  cnpj?: string;

  @ApiProperty({ description: 'Endereço do cliente', required: false })
  @IsOptional()
  @IsString({ message: 'Endereço deve ser uma string' })
  @Length(0, 500, { message: 'Endereço deve ter no máximo 500 caracteres' })
  @Transform(({ value }) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return undefined;
    }
    return typeof value === 'string' ? value.trim() : value;
  })
  address?: string;
}

export class UpdateClientDto {
  @ApiProperty({ description: 'Nome do cliente', required: false })
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  @Length(2, 100, { message: 'Nome deve ter entre 2 e 100 caracteres' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed;
    }
    return value;
  })
  name?: string;

  @ApiProperty({ description: 'Email do cliente', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @Transform(({ value }) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return undefined;
    }
    return typeof value === 'string' ? value.trim() : value;
  })
  email?: string;

  @ApiProperty({ description: 'Telefone do cliente', required: false })
  @IsOptional()
  @IsString({ message: 'Telefone deve ser uma string' })
  @Length(10, 15, { message: 'Telefone deve ter entre 10 e 15 caracteres' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const cleanPhone = value.replace(/\D/g, '');
      return cleanPhone;
    }
    return value;
  })
  phone?: string;

  @ApiProperty({ description: 'CPF do cliente', required: false })
  @IsOptional()
  @IsString({ message: 'CPF deve ser uma string' })
  @Length(11, 14, { message: 'CPF deve ter 11 dígitos' })
  @Transform(({ value }) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return undefined;
    }
    if (typeof value === 'string') {
      const cleanCPF = value.replace(/\D/g, '');
      return cleanCPF.length === 11 ? cleanCPF : value;
    }
    return value;
  })
  cpf?: string;

  @ApiProperty({ description: 'CNPJ do cliente', required: false })
  @IsOptional()
  @IsString({ message: 'CNPJ deve ser uma string' })
  @Length(14, 18, { message: 'CNPJ deve ter 14 dígitos' })
  @Transform(({ value }) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return undefined;
    }
    if (typeof value === 'string') {
      const cleanCNPJ = value.replace(/\D/g, '');
      return cleanCNPJ.length === 14 ? cleanCNPJ : value;
    }
    return value;
  })
  cnpj?: string;

  @ApiProperty({ description: 'Endereço do cliente', required: false })
  @IsOptional()
  @IsString({ message: 'Endereço deve ser uma string' })
  @Length(0, 500, { message: 'Endereço deve ter no máximo 500 caracteres' })
  @Transform(({ value }) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return undefined;
    }
    return typeof value === 'string' ? value.trim() : value;
  })
  address?: string;

  @ApiProperty({ description: 'Status ativo do cliente', required: false })
  @IsOptional()
  @IsBoolean({ message: 'isActive deve ser um boolean' })
  @Transform(({ value }) => {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      const boolValue = value.toLowerCase() === 'true';
      return boolValue;
    }
    // Se for undefined, null ou outro tipo, retornar undefined
    return undefined;
  })
  isActive?: boolean;
}