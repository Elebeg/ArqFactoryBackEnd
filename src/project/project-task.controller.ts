import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProjectTaskService } from './project-task.service';
import { CreateTaskDto, UpdateTaskDto, TaskFiltersDto } from './dto/project-task.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { TaskStatus, TaskPriority, TaskType } from './entities/project-task.entity';

@ApiTags('project-tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('project-tasks')
export class ProjectTaskController {
  constructor(private readonly taskService: ProjectTaskService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova tarefa' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Tarefa criada com sucesso' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados inválidos' })
  create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    return this.taskService.create(createTaskDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as tarefas' })
  @ApiQuery({ name: 'status', enum: TaskStatus, required: false })
  @ApiQuery({ name: 'priority', enum: TaskPriority, required: false })
  @ApiQuery({ name: 'type', enum: TaskType, required: false })
  @ApiQuery({ name: 'projectId', type: 'string', required: false })
  @ApiQuery({ name: 'assigneeId', type: 'string', required: false })
  @ApiQuery({ name: 'search', type: 'string', required: false })
  @ApiQuery({ name: 'page', type: 'number', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de tarefas' })
  findAll(@Query() filters: TaskFiltersDto) {
    return this.taskService.findAll(filters);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Obter dados do dashboard de tarefas' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Dados do dashboard' })
  getDashboard(@Request() req) {
    return this.taskService.getDashboard(req.user.sub);
  }

  @Get('my-tasks')
  @ApiOperation({ summary: 'Obter tarefas do usuário logado' })
  @ApiQuery({ name: 'status', enum: TaskStatus, required: false })
  @ApiQuery({ name: 'page', type: 'number', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tarefas do usuário' })
  getMyTasks(
    @Request() req,
    @Query('status') status?: TaskStatus,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.taskService.getMyTasks(req.user.sub, {
      status,
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Obter tarefas em atraso' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de tarefas em atraso' })
  getOverdueTasks() {
    return this.taskService.getOverdueTasks();
  }

  @Get('by-project/:projectId')
  @ApiOperation({ summary: 'Obter tarefas de um projeto específico' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tarefas do projeto' })
  getTasksByProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query('status') status?: TaskStatus,
  ) {
    return this.taskService.getTasksByProject(projectId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar tarefa por ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tarefa encontrada' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tarefa não encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.taskService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar tarefa' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tarefa atualizada com sucesso' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tarefa não encontrada' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.taskService.update(id, updateTaskDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar status da tarefa' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Status atualizado com sucesso' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: TaskStatus,
  ) {
    return this.taskService.updateStatus(id, status);
  }

  @Patch(':id/progress')
  @ApiOperation({ summary: 'Atualizar progresso da tarefa' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Progresso atualizado com sucesso' })
  updateProgress(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('progress') progress: number,
  ) {
    return this.taskService.updateProgress(id, progress);
  }

  @Patch(':id/assign')
  @ApiOperation({ summary: 'Atribuir tarefa a um usuário' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tarefa atribuída com sucesso' })
  assignTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('assigneeId') assigneeId: string,
  ) {
    return this.taskService.assignTask(id, assigneeId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar tarefa' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tarefa deletada com sucesso' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tarefa não encontrada' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.taskService.remove(id);
  }
}