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
    ParseUUIDPipe
  } from '@nestjs/common';
  import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
  import { ProjectService, TimelineItem } from './project.service';
  import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
  import { JwtAuthGuard } from '../auth/guards/auth.guard';
  import { ProjectStatus, ProjectType } from './entities/project.entity';
  
  @ApiTags('projects')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Controller('projects')
  export class ProjectController {
    constructor(private readonly projectService: ProjectService) {}
  
    @Post()
    @ApiOperation({ summary: 'Criar novo projeto' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Projeto criado com sucesso' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados inválidos' })
    create(@Body() createProjectDto: CreateProjectDto, @Request() req) {
      return this.projectService.create(createProjectDto, req.user.sub);
    }
  
    @Get()
    @ApiOperation({ summary: 'Listar todos os projetos' })
    @ApiQuery({ name: 'status', enum: ProjectStatus, required: false })
    @ApiQuery({ name: 'type', enum: ProjectType, required: false })
    @ApiQuery({ name: 'clientId', type: 'string', required: false })
    @ApiQuery({ name: 'page', type: 'number', required: false, description: 'Número da página (padrão: 1)' })
    @ApiQuery({ name: 'limit', type: 'number', required: false, description: 'Itens por página (padrão: 10)' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Lista de projetos' })
    findAll(
      @Query('status') status?: ProjectStatus,
      @Query('type') type?: ProjectType,
      @Query('clientId') clientId?: string,
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 10,
    ) {
      return this.projectService.findAll({
        status,
        type,
        clientId,
        page: Number(page),
        limit: Number(limit),
      });
    }
  
    @Get('dashboard')
    @ApiOperation({ summary: 'Obter dados do dashboard de projetos' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Dados do dashboard' })
    getDashboard() {
      return this.projectService.getDashboard();
    }
  
    @Get('by-status')
    @ApiOperation({ summary: 'Obter projetos agrupados por status' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Projetos agrupados por status' })
    getProjectsByStatus() {
      return this.projectService.getProjectsByStatus();
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Buscar projeto por ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Projeto encontrado' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Projeto não encontrado' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.projectService.findOne(id);
    }
  
    @Patch(':id')
    @ApiOperation({ summary: 'Atualizar projeto' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Projeto atualizado com sucesso' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Projeto não encontrado' })
    update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() updateProjectDto: UpdateProjectDto,
    ) {
      return this.projectService.update(id, updateProjectDto);
    }
  
    @Patch(':id/status')
    @ApiOperation({ summary: 'Atualizar status do projeto' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Status atualizado com sucesso' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Projeto não encontrado' })
    updateStatus(
      @Param('id', ParseUUIDPipe) id: string,
      @Body('status') status: ProjectStatus,
    ) {
      return this.projectService.updateStatus(id, status);
    }
  
    @Delete(':id')
    @ApiOperation({ summary: 'Deletar projeto' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Projeto deletado com sucesso' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Projeto não encontrado' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
      return this.projectService.remove(id);
    }
  
    @Get(':id/tasks')
    @ApiOperation({ summary: 'Listar tarefas do projeto' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Lista de tarefas do projeto' })
    getProjectTasks(@Param('id', ParseUUIDPipe) id: string) {
      return this.projectService.getProjectTasks(id);
    }
  
    @Get(':id/assignments')
    @ApiOperation({ summary: 'Listar atribuições do projeto' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Lista de atribuições do projeto' })
    getProjectAssignments(@Param('id', ParseUUIDPipe) id: string) {
      return this.projectService.getProjectAssignments(id);
    }
  
    @Get(':id/timeline')
    @ApiOperation({ summary: 'Obter timeline do projeto' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Timeline do projeto' })
    getProjectTimeline(@Param('id', ParseUUIDPipe) id: string): Promise<TimelineItem[]> {
      return this.projectService.getProjectTimeline(id);
    }
  }