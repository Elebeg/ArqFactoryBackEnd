import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Client } from '../../client/entities/client.entity';
import { Project } from '../../project/entities/project.entity';
import { BudgetItem } from '../../budget-item/entities/budget-item.entity';

export enum BudgetStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

@Entity('budgets')
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ type: 'enum', enum: BudgetStatus, default: BudgetStatus.DRAFT })
  status: BudgetStatus;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  totalValue: number;

  @Column({ type: 'date', nullable: true })
  validUntil: Date;

  @Column({ name: 'client_id' })
  clientId: string;

  @ManyToOne(() => Client, client => client.budgets, { eager: true })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ name: 'project_id', nullable: true })
  projectId: string;

  @ManyToOne(() => Project, project => project.budgets, { nullable: true })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => BudgetItem, item => item.budget, { cascade: true })
  items: BudgetItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}