import { IsEnum, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectStatus } from '../entities/project.entity';

export class UpdateProjectStatusDto {
  @ApiProperty({ enum: ProjectStatus })
  @IsEnum(ProjectStatus)
  status: ProjectStatus;
}

export class ProjectStatsResponseDto {
  @ApiProperty()
  totalProjects: number;

  @ApiProperty()
  activeProjects: number;

  @ApiProperty()
  completedProjects: number;

  @ApiProperty()
  projectsByStatus: Array<{
    status: ProjectStatus;
    count: number;
  }>;

  @ApiProperty()
  projectsByType: Array<{
    type: string;
    count: number;
  }>;

  @ApiProperty()
  recentProjects: any[];
}

export class TaskStatsResponseDto {
  @ApiProperty()
  totalTasks: number;

  @ApiProperty()
  todoTasks: number;

  @ApiProperty()
  inProgressTasks: number;

  @ApiProperty()
  completedTasks: number;

  @ApiProperty()
  overdueTasks: number;

  @ApiProperty()
  tasksByPriority: Array<{
    priority: string;
    count: number;
  }>;

  @ApiProperty()
  tasksByStatus: Array<{
    status: string;
    count: number;
  }>;

  @ApiProperty()
  recentTasks: any[];
}

export class ProjectTimelineResponseDto {
  @ApiProperty()
  type: string;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  user: string;
}

export class AssignTaskDto {
  @ApiProperty()
  @IsString()
  assigneeId: string;
}

export class UpdateTaskProgressDto {
  @ApiProperty({ minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;
}

export class UpdateTaskStatusDto {
  @ApiProperty({ enum: ['todo', 'in_progress', 'review', 'completed', 'cancelled'] })
  @IsEnum(['todo', 'in_progress', 'review', 'completed', 'cancelled'])
  status: string;
}