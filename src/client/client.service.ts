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
    const client = this.clientRepository.create({
      ...createClientDto,
      createdBy: userId,
    });

    try {
      const savedClient = await this.clientRepository.save(client);
      return savedClient;
    } catch (error) {
      this.logger.error('Error saving client:', error);
      throw error;
    }
  }

  async findAll(userId: string): Promise<Client[]> {
    try {
      const clients = await this.clientRepository.find({
        where: { createdBy: userId },
        relations: ['creator', 'projects', 'budgets'],
        order: { createdAt: 'DESC' },
      });
      
      return clients;
    } catch (error) {
      this.logger.error('Error finding clients:', error);
      throw error;
    }
  }

  async findOne(id: string, userId: string): Promise<Client> {
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
    const client = await this.findOne(id, userId);

    Object.assign(client, updateClientDto);
    
    try {
      const updatedClient = await this.clientRepository.save(client);
      return updatedClient;
    } catch (error) {
      this.logger.error('Error updating client:', error);
      throw error;
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    const client = await this.findOne(id, userId);
    
    try {
      await this.clientRepository.remove(client);
    } catch (error) {
      this.logger.error('Error removing client:', error);
      throw error;
    }
  }

  async findActiveClients(userId: string): Promise<Client[]> {
    try {
      const clients = await this.clientRepository.find({
        where: { 
          createdBy: userId,
          isActive: true 
        },
        relations: ['creator'],
        order: { name: 'ASC' },
      });
      
      return clients;
    } catch (error) {
      this.logger.error('Error finding active clients:', error);
      throw error;
    }
  }

  async toggleActive(id: string, userId: string): Promise<Client> {
    const client = await this.findOne(id, userId);
    const oldStatus = client.isActive;
    client.isActive = !client.isActive;
    
    try {
      const updatedClient = await this.clientRepository.save(client);
      return updatedClient;
    } catch (error) {
      this.logger.error('Error toggling active status:', error);
      throw error;
    }
  }

  async findClientProjects(id: string, userId: string) {
    const client = await this.findOne(id, userId);
    return client.projects;
  }

  async findClientBudgets(id: string, userId: string) {
    const client = await this.findOne(id, userId);
    return client.budgets;
  }

  async searchClients(query: string, userId: string): Promise<Client[]> {
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
      
      return clients;
    } catch (error) {
      this.logger.error('Error searching clients:', error);
      throw error;
    }
  }
}