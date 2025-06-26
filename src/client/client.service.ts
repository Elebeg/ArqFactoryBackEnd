import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto, UpdateClientDto } from './dto/client-dto';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  async create(createClientDto: CreateClientDto, userId: string): Promise<Client> {
    const client = this.clientRepository.create({
      ...createClientDto,
      createdBy: userId,
    });

    return await this.clientRepository.save(client);
  }

  async findAll(userId: string): Promise<Client[]> {
    return await this.clientRepository.find({
      where: { createdBy: userId },
      relations: ['creator', 'projects', 'budgets'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { id },
      relations: ['creator', 'projects', 'budgets'],
    });

    if (!client) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }

    // Verifica se o cliente pertence ao usuário autenticado
    if (client.createdBy !== userId) {
      throw new ForbiddenException('Você não tem permissão para acessar este cliente');
    }

    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto, userId: string): Promise<Client> {
    const client = await this.findOne(id, userId);

    Object.assign(client, updateClientDto);
    return await this.clientRepository.save(client);
  }

  async remove(id: string, userId: string): Promise<void> {
    const client = await this.findOne(id, userId);
    await this.clientRepository.remove(client);
  }

  async findActiveClients(userId: string): Promise<Client[]> {
    return await this.clientRepository.find({
      where: { 
        createdBy: userId,
        isActive: true 
      },
      relations: ['creator'],
      order: { name: 'ASC' },
    });
  }

  async toggleActive(id: string, userId: string): Promise<Client> {
    const client = await this.findOne(id, userId);
    client.isActive = !client.isActive;
    return await this.clientRepository.save(client);
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
    return await this.clientRepository
      .createQueryBuilder('client')
      .where('client.createdBy = :userId', { userId })
      .andWhere(
        '(LOWER(client.name) LIKE LOWER(:query) OR LOWER(client.email) LIKE LOWER(:query) OR client.phone LIKE :query OR client.cpf LIKE :query OR client.cnpj LIKE :query)',
        { query: `%${query}%` }
      )
      .leftJoinAndSelect('client.creator', 'creator')
      .orderBy('client.name', 'ASC')
      .getMany();
  }
}