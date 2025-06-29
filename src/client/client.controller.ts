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
    Logger,
    ValidationPipe,
    UsePipes,
    BadRequestException,
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
    private readonly logger = new Logger(ClientController.name);
  
    constructor(private readonly clientService: ClientService) {}
  
    @Post()
    @ApiOperation({ summary: 'Criar um novo cliente' })
    @ApiResponse({ status: 201, description: 'Cliente criado com sucesso.' })
    @ApiResponse({ status: 400, description: 'Dados inválidos.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    @UsePipes(new ValidationPipe({ 
        transform: true, 
        whitelist: true, 
        skipMissingProperties: true,
        forbidNonWhitelisted: true,
        exceptionFactory: (errors) => {
            Logger.error('Validation errors:', JSON.stringify(errors, null, 2), 'ValidationPipe');
            const messages = errors.map(error => 
                Object.values(error.constraints || {}).join(', ')
            ).join('; ');
            return new BadRequestException(`Dados inválidos: ${messages}`);
        }
    }))
    async create(@Body() createClientDto: CreateClientDto, @Request() req) {
        // Verificações adicionais de segurança
        if (!createClientDto) {
        this.logger.error('CreateClientDto is null or undefined');
        throw new BadRequestException('Dados do cliente são obrigatórios');
        }

        if (!createClientDto.name || createClientDto.name.trim().length === 0) {
        this.logger.error('Client name is missing or empty');
        throw new BadRequestException('Nome do cliente é obrigatório');
        }

        if (!createClientDto.phone || createClientDto.phone.trim().length === 0) {
        this.logger.error('Client phone is missing or empty');
        throw new BadRequestException('Telefone do cliente é obrigatório');
        }

        // Validar formato do email se fornecido
        if (createClientDto.email && createClientDto.email.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(createClientDto.email)) {
            throw new BadRequestException('Formato de email inválido');
        }
        }

        try {
        const result = await this.clientService.create(createClientDto, req.user.id);
        return result;
        } catch (error) {
        this.logger.error('Error in create controller:', error);
        throw error;
        }
    }
  
    @Get()
    @ApiOperation({ summary: 'Listar todos os clientes do usuário' })
    @ApiResponse({ status: 200, description: 'Lista de clientes retornada com sucesso.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    async findAll(@Request() req) {
      try {
        const result = await this.clientService.findAll(req.user.id);
        return result;
      } catch (error) {
        this.logger.error('Error in findAll controller:', error);
        throw error;
      }
    }
  
    @Get('active')
    @ApiOperation({ summary: 'Listar apenas clientes ativos do usuário' })
    @ApiResponse({ status: 200, description: 'Lista de clientes ativos retornada com sucesso.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    async findActiveClients(@Request() req) {
      try {
        const result = await this.clientService.findActiveClients(req.user.id);
        return result;
      } catch (error) {
        this.logger.error('Error in findActiveClients controller:', error);
        throw error;
      }
    }
  
    @Get('search')
    @ApiOperation({ summary: 'Buscar clientes por nome, email, telefone, CPF ou CNPJ' })
    @ApiQuery({ name: 'q', description: 'Termo de busca', required: true })
    @ApiResponse({ status: 200, description: 'Resultados da busca retornados com sucesso.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    async searchClients(@Query('q') query: string, @Request() req) {
      try {
        const result = await this.clientService.searchClients(query, req.user.id);
        return result;
      } catch (error) {
        this.logger.error('Error in searchClients controller:', error);
        throw error;
      }
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Buscar um cliente específico' })
    @ApiResponse({ status: 200, description: 'Cliente encontrado com sucesso.' })
    @ApiResponse({ status: 404, description: 'Cliente não encontrado.' })
    @ApiResponse({ status: 403, description: 'Sem permissão para acessar este cliente.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    async findOne(@Param('id') id: string, @Request() req) {
      try {
        const result = await this.clientService.findOne(id, req.user.id);
        return result;
      } catch (error) {
        this.logger.error('Error in findOne controller:', error);
        throw error;
      }
    }
  
    @Get(':id/projects')
    @ApiOperation({ summary: 'Listar projetos de um cliente específico' })
    @ApiResponse({ status: 200, description: 'Lista de projetos do cliente retornada com sucesso.' })
    @ApiResponse({ status: 404, description: 'Cliente não encontrado.' })
    @ApiResponse({ status: 403, description: 'Sem permissão para acessar este cliente.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    async findClientProjects(@Param('id') id: string, @Request() req) {
      try {
        const result = await this.clientService.findClientProjects(id, req.user.id);
        return result;
      } catch (error) {
        this.logger.error('Error in findClientProjects controller:', error);
        throw error;
      }
    }
  
    @Get(':id/budgets')
    @ApiOperation({ summary: 'Listar orçamentos de um cliente específico' })
    @ApiResponse({ status: 200, description: 'Lista de orçamentos do cliente retornada com sucesso.' })
    @ApiResponse({ status: 404, description: 'Cliente não encontrado.' })
    @ApiResponse({ status: 403, description: 'Sem permissão para acessar este cliente.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    async findClientBudgets(@Param('id') id: string, @Request() req) {
      try {
        const result = await this.clientService.findClientBudgets(id, req.user.id);
        return result;
      } catch (error) {
        this.logger.error('Error in findClientBudgets controller:', error);
        throw error;
      }
    }
  
    @Patch(':id')
    @ApiOperation({ summary: 'Atualizar um cliente' })
    @ApiResponse({ status: 200, description: 'Cliente atualizado com sucesso.' })
    @ApiResponse({ status: 404, description: 'Cliente não encontrado.' })
    @ApiResponse({ status: 403, description: 'Sem permissão para atualizar este cliente.' })
    @ApiResponse({ status: 400, description: 'Dados inválidos.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    @UsePipes(new ValidationPipe({ 
        transform: true, 
        whitelist: true, 
        skipMissingProperties: true,
        forbidNonWhitelisted: true,
        exceptionFactory: (errors) => {
            Logger.error('Validation errors:', JSON.stringify(errors, null, 2), 'ValidationPipe');
            const messages = errors.map(error => 
                Object.values(error.constraints || {}).join(', ')
            ).join('; ');
            return new BadRequestException(`Dados inválidos: ${messages}`);
        }
    }))
    async update(
        @Param('id') id: string,
        @Body() updateClientDto: UpdateClientDto,
        @Request() req,
    ) {
        // Verificar se pelo menos um campo foi fornecido
        const hasValidFields = Object.keys(updateClientDto).some(key => 
        updateClientDto[key] !== undefined && updateClientDto[key] !== null
        );

        if (!hasValidFields) {
        throw new BadRequestException('Pelo menos um campo deve ser fornecido para atualização');
        }

        try {
        const result = await this.clientService.update(id, updateClientDto, req.user.id);
        return result;
        } catch (error) {
        this.logger.error('Error in update controller:', error);
        throw error;
        }
    }
  
    @Patch(':id/toggle-active')
    @ApiOperation({ summary: 'Ativar/desativar um cliente' })
    @ApiResponse({ status: 200, description: 'Status do cliente alterado com sucesso.' })
    @ApiResponse({ status: 404, description: 'Cliente não encontrado.' })
    @ApiResponse({ status: 403, description: 'Sem permissão para alterar este cliente.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    @HttpCode(HttpStatus.OK)
    async toggleActive(@Param('id') id: string, @Request() req) {
      try {
        const result = await this.clientService.toggleActive(id, req.user.id);
        return result;
      } catch (error) {
        this.logger.error('Error in toggleActive controller:', error);
        throw error;
      }
    }
  
    @Delete(':id')
    @ApiOperation({ summary: 'Remover um cliente' })
    @ApiResponse({ status: 204, description: 'Cliente removido com sucesso.' })
    @ApiResponse({ status: 404, description: 'Cliente não encontrado.' })
    @ApiResponse({ status: 403, description: 'Sem permissão para remover este cliente.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string, @Request() req) {
      try {
        await this.clientService.remove(id, req.user.id);
      } catch (error) {
        this.logger.error('Error in remove controller:', error);
        throw error;
      }
    }
  }