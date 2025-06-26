import { IsString, IsEmail, IsOptional, IsBoolean, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateClientDto {
  @ApiProperty({ description: 'Nome do cliente' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString({ message: 'Nome deve ser uma string' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  name: string;

  @ApiProperty({ description: 'Email do cliente', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @Transform(({ value }) => value === '' ? undefined : value)
  email?: string;

  @ApiProperty({ description: 'Telefone do cliente' })
  @IsNotEmpty({ message: 'Telefone é obrigatório' })
  @IsString({ message: 'Telefone deve ser uma string' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  phone: string;

  @ApiProperty({ description: 'CPF do cliente', required: false })
  @IsOptional()
  @IsString({ message: 'CPF deve ser uma string' })
  @Transform(({ value }) => value === '' ? undefined : value)
  cpf?: string;

  @ApiProperty({ description: 'CNPJ do cliente', required: false })
  @IsOptional()
  @IsString({ message: 'CNPJ deve ser uma string' })
  @Transform(({ value }) => value === '' ? undefined : value)
  cnpj?: string;

  @ApiProperty({ description: 'Endereço do cliente', required: false })
  @IsOptional()
  @IsString({ message: 'Endereço deve ser uma string' })
  @Transform(({ value }) => value === '' ? undefined : value)
  address?: string;
}

export class UpdateClientDto extends CreateClientDto {
  @ApiProperty({ description: 'Status ativo do cliente', required: false })
  @IsOptional()
  @IsBoolean({ message: 'isActive deve ser um boolean' })
  isActive?: boolean;
}