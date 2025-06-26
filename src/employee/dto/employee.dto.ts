import { IsString, IsEmail, IsEnum, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EmployeeRole } from '../entities/employee.entity';

export class CreateEmployeeDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty({ enum: EmployeeRole })
  @IsEnum(EmployeeRole)
  role: EmployeeRole;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  hourlyRate?: number;
}

export class UpdateEmployeeDto extends CreateEmployeeDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}