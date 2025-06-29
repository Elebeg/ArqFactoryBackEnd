import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { ProjectTaskController } from './project-task.controller';
import { ProjectTaskService } from './project-task.service';
import { Project } from './entities/project.entity';
import { ProjectTask } from './entities/project-task.entity';
import { Client } from '../client/entities/client.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      ProjectTask,
      Client,
      User,
    ]),
  ],
  controllers: [
    ProjectController,
    ProjectTaskController,
  ],
  providers: [
    ProjectService,
    ProjectTaskService,
  ],
  exports: [
    ProjectService,
    ProjectTaskService,
  ],
})
export class ProjectModule {}