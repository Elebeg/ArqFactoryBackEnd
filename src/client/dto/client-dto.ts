import { IsString, IsEmail, IsOptional, IsBoolean, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreateClientDto {
  @ApiProperty({ description: 'Nome do cliente' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString({ message: 'Nome deve ser uma string' })
  @Transform(({ value }) => {
    console.log('Transform NAME - Input:', value, 'Type:', typeof value);
    if (typeof value === 'string') {
      const trimmed = value.trim();
      console.log('Transform NAME - Output:', trimmed);
      return trimmed;
    }
    console.log('Transform NAME - Invalid type, returning original');
    return value;
  })
  name: string;

  @ApiProperty({ description: 'Email do cliente', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @Transform(({ value }) => {
    console.log('Transform EMAIL - Input:', value, 'Type:', typeof value);
    if (value === '' || value === null || value === undefined) {
      console.log('Transform EMAIL - Empty value, returning undefined');
      return undefined;
    }
    console.log('Transform EMAIL - Output:', value);
    return value;
  })
  email?: string;

  @ApiProperty({ description: 'Telefone do cliente' })
  @IsNotEmpty({ message: 'Telefone é obrigatório' })
  @IsString({ message: 'Telefone deve ser uma string' })
  @Transform(({ value }) => {
    console.log('Transform PHONE - Input:', value, 'Type:', typeof value);
    if (typeof value === 'string') {
      const trimmed = value.trim();
      console.log('Transform PHONE - Output:', trimmed);
      return trimmed;
    }
    console.log('Transform PHONE - Invalid type, returning original');
    return value;
  })
  phone: string;

  @ApiProperty({ description: 'CPF do cliente', required: false })
  @IsOptional()
  @IsString({ message: 'CPF deve ser uma string' })
  @Transform(({ value }) => {
    console.log('Transform CPF - Input:', value, 'Type:', typeof value);
    if (value === '' || value === null || value === undefined) {
      console.log('Transform CPF - Empty value, returning undefined');
      return undefined;
    }
    console.log('Transform CPF - Output:', value);
    return value;
  })
  cpf?: string;

  @ApiProperty({ description: 'CNPJ do cliente', required: false })
  @IsOptional()
  @IsString({ message: 'CNPJ deve ser uma string' })
  @Transform(({ value }) => {
    console.log('Transform CNPJ - Input:', value, 'Type:', typeof value);
    if (value === '' || value === null || value === undefined) {
      console.log('Transform CNPJ - Empty value, returning undefined');
      return undefined;
    }
    console.log('Transform CNPJ - Output:', value);
    return value;
  })
  cnpj?: string;

  @ApiProperty({ description: 'Endereço do cliente', required: false })
  @IsOptional()
  @IsString({ message: 'Endereço deve ser uma string' })
  @Transform(({ value }) => {
    console.log('Transform ADDRESS - Input:', value, 'Type:', typeof value);
    if (value === '' || value === null || value === undefined) {
      console.log('Transform ADDRESS - Empty value, returning undefined');
      return undefined;
    }
    console.log('Transform ADDRESS - Output:', value);
    return value;
  })
  address?: string;
}

export class UpdateClientDto extends CreateClientDto {
  @ApiProperty({ description: 'Status ativo do cliente', required: false })
  @IsOptional()
  @IsBoolean({ message: 'isActive deve ser um boolean' })
  @Transform(({ value }) => {
    console.log('Transform IS_ACTIVE - Input:', value, 'Type:', typeof value);
    if (typeof value === 'boolean') {
      console.log('Transform IS_ACTIVE - Output:', value);
      return value;
    }
    if (typeof value === 'string') {
      const boolValue = value.toLowerCase() === 'true';
      console.log('Transform IS_ACTIVE - String converted to boolean:', boolValue);
      return boolValue;
    }
    console.log('Transform IS_ACTIVE - Invalid type, returning original');
    return value;
  })
  isActive?: boolean;
}