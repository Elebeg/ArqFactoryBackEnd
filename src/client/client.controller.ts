import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    Query,
    HttpCode,
    HttpStatus,
  } from '@nestjs/common';
  import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
  import { ClientService } from './client.service';
  import { CreateClientDto, UpdateClientDto } from './dto/client-dto';
  import { JwtAuthGuard } from '../auth/guards/auth.guard'; 
  
  @ApiTags('clients')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Controller('clients')
  export class ClientController {
    constructor(private readonly clientService: ClientService) {}
  
    @Post()
    @ApiOperation({ summary: 'Criar um novo cliente' })
    @ApiResponse({ status: 201, description: 'Cliente criado com sucesso.' })
    @ApiResponse({ status: 400, description: 'Dados inválidos.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    async create(@Body() createClientDto: CreateClientDto, @Request() req) {
      return await this.clientService.create(createClientDto, req.user.id);
    }
  
    @Get()
    @ApiOperation({ summary: 'Listar todos os clientes do usuário' })
    @ApiResponse({ status: 200, description: 'Lista de clientes retornada com sucesso.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    async findAll(@Request() req) {
      return await this.clientService.findAll(req.user.id);
    }
  
    @Get('active')
    @ApiOperation({ summary: 'Listar apenas clientes ativos do usuário' })
    @ApiResponse({ status: 200, description: 'Lista de clientes ativos retornada com sucesso.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    async findActiveClients(@Request() req) {
      return await this.clientService.findActiveClients(req.user.id);
    }
  
    @Get('search')
    @ApiOperation({ summary: 'Buscar clientes por nome, email, telefone, CPF ou CNPJ' })
    @ApiQuery({ name: 'q', description: 'Termo de busca', required: true })
    @ApiResponse({ status: 200, description: 'Resultados da busca retornados com sucesso.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    async searchClients(@Query('q') query: string, @Request() req) {
      return await this.clientService.searchClients(query, req.user.id);
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Buscar um cliente específico' })
    @ApiResponse({ status: 200, description: 'Cliente encontrado com sucesso.' })
    @ApiResponse({ status: 404, description: 'Cliente não encontrado.' })
    @ApiResponse({ status: 403, description: 'Sem permissão para acessar este cliente.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    async findOne(@Param('id') id: string, @Request() req) {
      return await this.clientService.findOne(id, req.user.id);
    }
  
    @Get(':id/projects')
    @ApiOperation({ summary: 'Listar projetos de um cliente específico' })
    @ApiResponse({ status: 200, description: 'Lista de projetos do cliente retornada com sucesso.' })
    @ApiResponse({ status: 404, description: 'Cliente não encontrado.' })
    @ApiResponse({ status: 403, description: 'Sem permissão para acessar este cliente.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    async findClientProjects(@Param('id') id: string, @Request() req) {
      return await this.clientService.findClientProjects(id, req.user.id);
    }
  
    @Get(':id/budgets')
    @ApiOperation({ summary: 'Listar orçamentos de um cliente específico' })
    @ApiResponse({ status: 200, description: 'Lista de orçamentos do cliente retornada com sucesso.' })
    @ApiResponse({ status: 404, description: 'Cliente não encontrado.' })
    @ApiResponse({ status: 403, description: 'Sem permissão para acessar este cliente.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    async findClientBudgets(@Param('id') id: string, @Request() req) {
      return await this.clientService.findClientBudgets(id, req.user.id);
    }
  
    @Patch(':id')
    @ApiOperation({ summary: 'Atualizar um cliente' })
    @ApiResponse({ status: 200, description: 'Cliente atualizado com sucesso.' })
    @ApiResponse({ status: 404, description: 'Cliente não encontrado.' })
    @ApiResponse({ status: 403, description: 'Sem permissão para atualizar este cliente.' })
    @ApiResponse({ status: 400, description: 'Dados inválidos.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    async update(
      @Param('id') id: string,
      @Body() updateClientDto: UpdateClientDto,
      @Request() req,
    ) {
      return await this.clientService.update(id, updateClientDto, req.user.id);
    }
  
    @Patch(':id/toggle-active')
    @ApiOperation({ summary: 'Ativar/desativar um cliente' })
    @ApiResponse({ status: 200, description: 'Status do cliente alterado com sucesso.' })
    @ApiResponse({ status: 404, description: 'Cliente não encontrado.' })
    @ApiResponse({ status: 403, description: 'Sem permissão para alterar este cliente.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    @HttpCode(HttpStatus.OK)
    async toggleActive(@Param('id') id: string, @Request() req) {
      return await this.clientService.toggleActive(id, req.user.id);
    }
  
    @Delete(':id')
    @ApiOperation({ summary: 'Remover um cliente' })
    @ApiResponse({ status: 204, description: 'Cliente removido com sucesso.' })
    @ApiResponse({ status: 404, description: 'Cliente não encontrado.' })
    @ApiResponse({ status: 403, description: 'Sem permissão para remover este cliente.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string, @Request() req) {
      await this.clientService.remove(id, req.user.id);
    }
  }