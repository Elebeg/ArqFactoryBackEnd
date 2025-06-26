import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Project } from '../../project/entities/project.entity';
import { Budget } from '../../budget/entities/budget.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  cpf: string;

  @Column({ nullable: true })
  cnpj: string;

  @Column('text', { nullable: true })
  address: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => Project, project => project.client)
  projects: Project[];

  @OneToMany(() => Budget, budget => budget.client)
  budgets: Budget[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}