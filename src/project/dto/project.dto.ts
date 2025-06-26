import { IsString, IsEnum, IsOptional, IsDateString, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectType, ProjectStatus } from '../entities/project.entity';

export class CreateProjectDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ProjectType })
  @IsEnum(ProjectType)
  type: ProjectType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  totalArea?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  estimatedValue?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty()
  @IsUUID()
  clientId: string;
}

export class UpdateProjectDto extends CreateProjectDto {
  @ApiProperty({ enum: ProjectStatus, required: false })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}