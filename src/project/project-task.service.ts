import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, LessThan, In } from 'typeorm';
import { ProjectTask, TaskStatus, TaskPriority } from './entities/project-task.entity';
import { CreateTaskDto, UpdateTaskDto, TaskFiltersDto } from './dto/project-task.dto';

@Injectable()
export class ProjectTaskService {
  constructor(
    @InjectRepository(ProjectTask)
    private taskRepository: Repository<ProjectTask>,
  ) {}

  async create(createTaskDto: CreateTaskDto, createdBy: string): Promise<ProjectTask> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      createdBy,
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : undefined,
      progress: createTaskDto.progress || 0,
    });

    const savedTask = await this.taskRepository.save(task);
    return this.findOne(savedTask.id);
  }

  async findAll(filters: TaskFiltersDto = {}) {
    const {
      status,
      priority,
      type,
      projectId,
      assigneeId,
      search,
      page = 1,
      limit = 10,
    } = filters;

    const queryBuilder = this.taskRepository.createQueryBuilder('task')
      .leftJoinAndSelect('task.project', 'project')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('task.creator', 'creator')
      .leftJoinAndSelect('project.client', 'client');

    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }

    if (priority) {
      queryBuilder.andWhere('task.priority = :priority', { priority });
    }

    if (type) {
      queryBuilder.andWhere('task.type = :type', { type });
    }

    if (projectId) {
      queryBuilder.andWhere('task.projectId = :projectId', { projectId });
    }

    if (assigneeId) {
      queryBuilder.andWhere('task.assigneeId = :assigneeId', { assigneeId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    queryBuilder
      .orderBy('task.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [tasks, total] = await queryBuilder.getManyAndCount();

    return {
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<ProjectTask> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: {
        project: {
          client: true,
        },
        assignee: true,
        creator: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Tarefa não encontrada');
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<ProjectTask> {
    const task = await this.findOne(id);

    // Validar progresso
    if (updateTaskDto.progress !== undefined) {
      if (updateTaskDto.progress < 0 || updateTaskDto.progress > 100) {
        throw new BadRequestException('Progresso deve estar entre 0 e 100');
      }
    }

    // Se o status está sendo alterado para concluído, definir progresso como 100 e data de conclusão
    if (updateTaskDto.status === TaskStatus.COMPLETED) {
      updateTaskDto.progress = 100;
      task.completedAt = new Date();
    }

    // Se o status está saindo de concluído, remover data de conclusão
    if (task.status === TaskStatus.COMPLETED && updateTaskDto.status && updateTaskDto.status !== TaskStatus.COMPLETED) {
      task.completedAt = null; 
    }

    Object.assign(task, {
      ...updateTaskDto,
      dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : task.dueDate,
    });

    await this.taskRepository.save(task);
    return this.findOne(id);
  }

  async updateStatus(id: string, status: TaskStatus): Promise<ProjectTask> {
    return this.update(id, { status });
  }

  async updateProgress(id: string, progress: number): Promise<ProjectTask> {
    if (progress < 0 || progress > 100) {
      throw new BadRequestException('Progresso deve estar entre 0 e 100');
    }

    const updateData: Partial<UpdateTaskDto> = { progress };

    // Se progresso é 100, marcar como concluído
    if (progress === 100) {
      updateData.status = TaskStatus.COMPLETED;
    }

    return this.update(id, updateData);
  }

  async assignTask(id: string, assigneeId: string): Promise<ProjectTask> {
    return this.update(id, { assigneeId });
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    await this.taskRepository.remove(task);
  }

  async getDashboard(userId?: string) {
    const baseQuery = this.taskRepository.createQueryBuilder('task')
      .leftJoinAndSelect('task.project', 'project');

    // Se userId for fornecido, filtrar apenas tarefas do usuário
    if (userId) {
      baseQuery.andWhere('task.assigneeId = :userId', { userId });
    }

    const [
      totalTasks,
      todoTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      tasksByPriority,
      tasksByStatus,
      recentTasks,
    ] = await Promise.all([
      baseQuery.getCount(),
      this.taskRepository.count({
        where: userId ? { status: TaskStatus.TODO, assigneeId: userId } : { status: TaskStatus.TODO }
      }),
      this.taskRepository.count({
        where: userId ? { status: TaskStatus.IN_PROGRESS, assigneeId: userId } : { status: TaskStatus.IN_PROGRESS }
      }),
      this.taskRepository.count({
        where: userId ? { status: TaskStatus.COMPLETED, assigneeId: userId } : { status: TaskStatus.COMPLETED }
      }),
      this.getOverdueTasksCount(userId),
      this.getTasksByPriority(userId),
      this.getTasksByStatus(userId),
      this.getRecentTasks(5, userId),
    ]);

    return {
      totalTasks,
      todoTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      tasksByPriority,
      tasksByStatus,
      recentTasks,
    };
  }

  async getMyTasks(userId: string, filters: { status?: TaskStatus; page?: number; limit?: number } = {}) {
    const { status, page = 1, limit = 10 } = filters;

    const queryBuilder = this.taskRepository.createQueryBuilder('task')
      .leftJoinAndSelect('task.project', 'project')
      .leftJoinAndSelect('project.client', 'client')
      .where('task.assigneeId = :userId', { userId });

    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }

    queryBuilder
      .orderBy('task.dueDate', 'ASC', 'NULLS LAST')
      .addOrderBy('task.priority', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [tasks, total] = await queryBuilder.getManyAndCount();

    return {
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOverdueTasks(userId?: string) {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Final do dia

    const queryBuilder = this.taskRepository.createQueryBuilder('task')
      .leftJoinAndSelect('task.project', 'project')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .where('task.dueDate < :today', { today })
      .andWhere('task.status NOT IN (:...completedStatuses)', {
        completedStatuses: [TaskStatus.COMPLETED, TaskStatus.CANCELLED]
      });

    if (userId) {
      queryBuilder.andWhere('task.assigneeId = :userId', { userId });
    }

    return queryBuilder
      .orderBy('task.dueDate', 'ASC')
      .getMany();
  }

  async getOverdueTasksCount(userId?: string): Promise<number> {
    const overdueTasks = await this.getOverdueTasks(userId);
    return overdueTasks.length;
  }

  async getTasksByProject(projectId: string, status?: TaskStatus) {
    const queryBuilder = this.taskRepository.createQueryBuilder('task')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .where('task.projectId = :projectId', { projectId });

    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }

    return queryBuilder
      .orderBy('task.createdAt', 'DESC')
      .getMany();
  }

  async getTasksByPriority(userId?: string) {
    const queryBuilder = this.taskRepository.createQueryBuilder('task')
      .select('task.priority', 'priority')
      .addSelect('COUNT(task.id)', 'count')
      .groupBy('task.priority');

    if (userId) {
      queryBuilder.where('task.assigneeId = :userId', { userId });
    }

    const result = await queryBuilder.getRawMany();

    return result.map(item => ({
      priority: item.priority,
      count: parseInt(item.count, 10),
    }));
  }

  async getTasksByStatus(userId?: string) {
    const queryBuilder = this.taskRepository.createQueryBuilder('task')
      .select('task.status', 'status')
      .addSelect('COUNT(task.id)', 'count')
      .groupBy('task.status');

    if (userId) {
      queryBuilder.where('task.assigneeId = :userId', { userId });
    }

    const result = await queryBuilder.getRawMany();

    return result.map(item => ({
      status: item.status,
      count: parseInt(item.count, 10),
    }));
  }

  async getRecentTasks(limit: number = 5, userId?: string) {
    const queryBuilder = this.taskRepository.createQueryBuilder('task')
      .leftJoinAndSelect('task.project', 'project')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .orderBy('task.createdAt', 'DESC')
      .take(limit);

    if (userId) {
      queryBuilder.where('task.assigneeId = :userId', { userId });
    }

    return queryBuilder.getMany();
  }

  async getTasksCompletedThisWeek(userId?: string): Promise<number> {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const queryBuilder = this.taskRepository.createQueryBuilder('task')
      .where('task.status = :status', { status: TaskStatus.COMPLETED })
      .andWhere('task.completedAt >= :startOfWeek', { startOfWeek });

    if (userId) {
      queryBuilder.andWhere('task.assigneeId = :userId', { userId });
    }

    return queryBuilder.getCount();
  }
}