import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like } from 'typeorm';
import { Project, ProjectStatus, ProjectType } from './entities/project.entity';
import { ProjectTask } from './entities/project-task.entity';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

export interface ProjectFilters {
  status?: ProjectStatus;
  type?: ProjectType;
  clientId?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface TimelineItem {
  type: string;
  date: Date;
  title: string;
  description: string;
  user: string;
}

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(ProjectTask)
    private taskRepository: Repository<ProjectTask>,
  ) {}

  async create(createProjectDto: CreateProjectDto, createdBy: string): Promise<Project> {
    // Validar se o cliente existe
    const projectData = {
      ...createProjectDto,
      createdBy,
      startDate: createProjectDto.startDate ? new Date(createProjectDto.startDate) : undefined,
      endDate: createProjectDto.endDate ? new Date(createProjectDto.endDate) : undefined,
    };

    const project = this.projectRepository.create(projectData);

    // Validar datas
    if (project.startDate && project.endDate && project.startDate > project.endDate) {
      throw new BadRequestException('Data de início deve ser anterior à data de fim');
    }

    const savedProject = await this.projectRepository.save(project);
    return this.findOne(savedProject.id);
  }

  async findAll(filters: ProjectFilters = {}) {
    const { status, type, clientId, page = 1, limit = 10, search } = filters;
    
    const queryBuilder = this.projectRepository.createQueryBuilder('project')
      .leftJoinAndSelect('project.client', 'client')
      .leftJoinAndSelect('project.creator', 'creator');

    if (status) {
      queryBuilder.andWhere('project.status = :status', { status });
    }

    if (type) {
      queryBuilder.andWhere('project.type = :type', { type });
    }

    if (clientId) {
      queryBuilder.andWhere('project.clientId = :clientId', { clientId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(project.title ILIKE :search OR project.description ILIKE :search OR client.name ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    queryBuilder
      .orderBy('project.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [projects, total] = await queryBuilder.getManyAndCount();

    return {
      data: projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: {
        client: true,
        creator: true,
        task: {
          assignee: true,
        },
        budgets: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    const project = await this.findOne(id);

    // Validar datas se fornecidas
    const startDate = updateProjectDto.startDate ? new Date(updateProjectDto.startDate) : project.startDate;
    const endDate = updateProjectDto.endDate ? new Date(updateProjectDto.endDate) : project.endDate;

    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException('Data de início deve ser anterior à data de fim');
    }

    Object.assign(project, {
      ...updateProjectDto,
      startDate: updateProjectDto.startDate ? new Date(updateProjectDto.startDate) : project.startDate,
      endDate: updateProjectDto.endDate ? new Date(updateProjectDto.endDate) : project.endDate,
    });

    await this.projectRepository.save(project);
    return this.findOne(id);
  }

  async updateStatus(id: string, status: ProjectStatus): Promise<Project> {
    const project = await this.findOne(id);
    
    // Validações de transição de status
    if (project.status === ProjectStatus.COMPLETED && status !== ProjectStatus.COMPLETED) {
      throw new BadRequestException('Não é possível alterar o status de um projeto concluído');
    }

    project.status = status;
    await this.projectRepository.save(project);
    
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const project = await this.findOne(id);
    await this.projectRepository.remove(project);
  }

  async getDashboard() {
    const [
      totalProjects,
      activeProjects,
      completedProjects,
      projectsByStatus,
      projectsByType,
      recentProjects,
    ] = await Promise.all([
      this.projectRepository.count(),
      this.projectRepository.count({ where: { status: ProjectStatus.IN_PROGRESS } }),
      this.projectRepository.count({ where: { status: ProjectStatus.COMPLETED } }),
      this.getProjectsByStatus(),
      this.getProjectsByType(),
      this.getRecentProjects(),
    ]);

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      projectsByStatus,
      projectsByType,
      recentProjects,
    };
  }

  async getProjectsByStatus() {
    const result = await this.projectRepository
      .createQueryBuilder('project')
      .select('project.status', 'status')
      .addSelect('COUNT(project.id)', 'count')
      .groupBy('project.status')
      .getRawMany();

    return result.map(item => ({
      status: item.status,
      count: parseInt(item.count, 10),
    }));
  }

  async getProjectsByType() {
    const result = await this.projectRepository
      .createQueryBuilder('project')
      .select('project.type', 'type')
      .addSelect('COUNT(project.id)', 'count')
      .groupBy('project.type')
      .getRawMany();

    return result.map(item => ({
      type: item.type,
      count: parseInt(item.count, 10),
    }));
  }

  async getRecentProjects(limit: number = 5) {
    return this.projectRepository.find({
      relations: {
        client: true,
        creator: true,
      },
      order: {
        createdAt: 'DESC',
      },
      take: limit,
    });
  }

  async getProjectTasks(projectId: string) {
    const project = await this.findOne(projectId);
    
    return this.taskRepository.find({
      where: { projectId },
      relations: {
        assignee: true,
        project: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getProjectAssignments(projectId: string) {
    const project = await this.findOne(projectId);
    return project.task;
  }

  async getProjectTimeline(projectId: string): Promise<TimelineItem[]> {
    const project = await this.findOne(projectId);
    const tasks = await this.getProjectTasks(projectId);

    const timeline: TimelineItem[] = [];

    // Adicionar evento de criação do projeto
    timeline.push({
      type: 'project_created',
      date: project.createdAt,
      title: 'Projeto Criado',
      description: `Projeto "${project.title}" foi criado`,
      user: project.creator.fullName,
    });

    // Adicionar eventos de tarefas
    tasks.forEach(task => {
      timeline.push({
        type: 'task_created',
        date: task.createdAt,
        title: 'Tarefa Criada',
        description: `Tarefa "${task.title}" foi criada`,
        user: task.assignee?.fullName || 'Sistema',
      });

      if (task.completedAt) {
        timeline.push({
          type: 'task_completed',
          date: task.completedAt,
          title: 'Tarefa Concluída',
          description: `Tarefa "${task.title}" foi concluída`,
          user: task.assignee?.fullName || 'Sistema',
        });
      }
    });

    // Ordenar por data
    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return timeline;
  }
}