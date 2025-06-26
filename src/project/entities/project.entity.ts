import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Client } from '../../client/entities/client.entity';
import { Budget } from '../../budget/entities/budget.entity';
import { ProjectAssignment } from '../../project-assignment/entities/project-assignment.entity';
import { CalendarEvent } from '../../calendar-event/entities/calendar-event.entity';

export enum ProjectStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum ProjectType {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  INDUSTRIAL = 'industrial',
  RENOVATION = 'renovation',
  LANDSCAPE = 'landscape'
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ProjectType })
  type: ProjectType;

  @Column({ type: 'enum', enum: ProjectStatus, default: ProjectStatus.PLANNING })
  status: ProjectStatus;

  @Column('text', { nullable: true })
  address: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  totalArea: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  estimatedValue: number;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ name: 'client_id' })
  clientId: string;

  @ManyToOne(() => Client, client => client.projects, { eager: true })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => Budget, budget => budget.project)
  budgets: Budget[];

  @OneToMany(() => ProjectAssignment, assignment => assignment.project)
  assignments: ProjectAssignment[];

  @OneToMany(() => CalendarEvent, event => event.project)
  calendarEvents: CalendarEvent[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
