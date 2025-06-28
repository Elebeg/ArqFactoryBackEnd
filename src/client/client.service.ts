import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto, UpdateClientDto } from './dto/client-dto';

@Injectable()
export class ClientService {
  private readonly logger = new Logger(ClientService.name);

  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  async create(createClientDto: CreateClientDto, userId: string): Promise<Client> {
    this.logger.debug('=== CREATE CLIENT DEBUG ===');
    this.logger.debug('Received DTO:', JSON.stringify(createClientDto, null, 2));
    this.logger.debug('User ID:', userId);
    this.logger.debug('DTO Type:', typeof createClientDto);
    this.logger.debug('DTO Keys:', Object.keys(createClientDto));
    
    // Verificar cada campo individualmente
    this.logger.debug('Field Analysis:');
    this.logger.debug(`- name: ${createClientDto.name} (type: ${typeof createClientDto.name})`);
    this.logger.debug(`- email: ${createClientDto.email} (type: ${typeof createClientDto.email})`);
    this.logger.debug(`- phone: ${createClientDto.phone} (type: ${typeof createClientDto.phone})`);
    this.logger.debug(`- cpf: ${createClientDto.cpf} (type: ${typeof createClientDto.cpf})`);
    this.logger.debug(`- cnpj: ${createClientDto.cnpj} (type: ${typeof createClientDto.cnpj})`);
    this.logger.debug(`- address: ${createClientDto.address} (type: ${typeof createClientDto.address})`);

    const client = this.clientRepository.create({
      ...createClientDto,
      createdBy: userId,
    });

    this.logger.debug('Created entity:', JSON.stringify(client, null, 2));

    try {
      const savedClient = await this.clientRepository.save(client);
      this.logger.debug('Saved successfully:', savedClient.id);
      return savedClient;
    } catch (error) {
      this.logger.error('Error saving client:', error);
      throw error;
    }
  }

  async findAll(userId: string): Promise<Client[]> {
    this.logger.debug('=== FIND ALL CLIENTS DEBUG ===');
    this.logger.debug('User ID:', userId);
    this.logger.debug('User ID Type:', typeof userId);
    
    try {
      const clients = await this.clientRepository.find({
        where: { createdBy: userId },
        relations: ['creator', 'projects', 'budgets'],
        order: { createdAt: 'DESC' },
      });
      
      this.logger.debug(`Found ${clients.length} clients`);
      return clients;
    } catch (error) {
      this.logger.error('Error finding clients:', error);
      throw error;
    }
  }

  async findOne(id: string, userId: string): Promise<Client> {
    this.logger.debug('=== FIND ONE CLIENT DEBUG ===');
    this.logger.debug('Client ID:', id);
    this.logger.debug('User ID:', userId);

    const client = await this.clientRepository.findOne({
      where: { id },
      relations: ['creator', 'projects', 'budgets'],
    });

    if (!client) {
      this.logger.warn(`Client not found: ${id}`);
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }

    // Verifica se o cliente pertence ao usuário autenticado
    if (client.createdBy !== userId) {
      this.logger.warn(`Access denied for user ${userId} to client ${id}`);
      throw new ForbiddenException('Você não tem permissão para acessar este cliente');
    }

    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto, userId: string): Promise<Client> {
    this.logger.debug('=== UPDATE CLIENT DEBUG ===');
    this.logger.debug('Client ID:', id);
    this.logger.debug('User ID:', userId);
    this.logger.debug('Update DTO:', JSON.stringify(updateClientDto, null, 2));

    const client = await this.findOne(id, userId);

    Object.assign(client, updateClientDto);
    
    try {
      const updatedClient = await this.clientRepository.save(client);
      this.logger.debug('Updated successfully');
      return updatedClient;
    } catch (error) {
      this.logger.error('Error updating client:', error);
      throw error;
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    this.logger.debug('=== REMOVE CLIENT DEBUG ===');
    this.logger.debug('Client ID:', id);
    this.logger.debug('User ID:', userId);

    const client = await this.findOne(id, userId);
    
    try {
      await this.clientRepository.remove(client);
      this.logger.debug('Removed successfully');
    } catch (error) {
      this.logger.error('Error removing client:', error);
      throw error;
    }
  }

  async findActiveClients(userId: string): Promise<Client[]> {
    this.logger.debug('=== FIND ACTIVE CLIENTS DEBUG ===');
    this.logger.debug('User ID:', userId);

    try {
      const clients = await this.clientRepository.find({
        where: { 
          createdBy: userId,
          isActive: true 
        },
        relations: ['creator'],
        order: { name: 'ASC' },
      });
      
      this.logger.debug(`Found ${clients.length} active clients`);
      return clients;
    } catch (error) {
      this.logger.error('Error finding active clients:', error);
      throw error;
    }
  }

  async toggleActive(id: string, userId: string): Promise<Client> {
    this.logger.debug('=== TOGGLE ACTIVE DEBUG ===');
    this.logger.debug('Client ID:', id);
    this.logger.debug('User ID:', userId);

    const client = await this.findOne(id, userId);
    const oldStatus = client.isActive;
    client.isActive = !client.isActive;
    
    try {
      const updatedClient = await this.clientRepository.save(client);
      this.logger.debug(`Status changed from ${oldStatus} to ${updatedClient.isActive}`);
      return updatedClient;
    } catch (error) {
      this.logger.error('Error toggling active status:', error);
      throw error;
    }
  }

  async findClientProjects(id: string, userId: string) {
    this.logger.debug('=== FIND CLIENT PROJECTS DEBUG ===');
    this.logger.debug('Client ID:', id);
    this.logger.debug('User ID:', userId);

    const client = await this.findOne(id, userId);
    this.logger.debug(`Found ${client.projects?.length || 0} projects`);
    return client.projects;
  }

  async findClientBudgets(id: string, userId: string) {
    this.logger.debug('=== FIND CLIENT BUDGETS DEBUG ===');
    this.logger.debug('Client ID:', id);
    this.logger.debug('User ID:', userId);

    const client = await this.findOne(id, userId);
    this.logger.debug(`Found ${client.budgets?.length || 0} budgets`);
    return client.budgets;
  }

  async searchClients(query: string, userId: string): Promise<Client[]> {
    this.logger.debug('=== SEARCH CLIENTS DEBUG ===');
    this.logger.debug('Query:', query);
    this.logger.debug('User ID:', userId);

    try {
      const clients = await this.clientRepository
        .createQueryBuilder('client')
        .where('client.createdBy = :userId', { userId })
        .andWhere(
          '(LOWER(client.name) LIKE LOWER(:query) OR LOWER(client.email) LIKE LOWER(:query) OR client.phone LIKE :query OR client.cpf LIKE :query OR client.cnpj LIKE :query)',
          { query: `%${query}%` }
        )
        .leftJoinAndSelect('client.creator', 'creator')
        .orderBy('client.name', 'ASC')
        .getMany();
      
      this.logger.debug(`Search found ${clients.length} clients`);
      return clients;
    } catch (error) {
      this.logger.error('Error searching clients:', error);
      throw error;
    }
  }
}