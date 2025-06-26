import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Project } from '../../project/entities/project.entity';
import { Employee } from '../../employee/entities/employee.entity';
import { Client } from '../../client/entities/client.entity';

export enum EventType {
  MEETING = 'meeting',
  SITE_VISIT = 'site_visit',
  PRESENTATION = 'presentation',
  DEADLINE = 'deadline',
  MILESTONE = 'milestone'
}

export enum EventStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

@Entity('calendar_events')
export class CalendarEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ type: 'enum', enum: EventType })
  type: EventType;

  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.SCHEDULED })
  status: EventStatus;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column('text', { nullable: true })
  location: string;

  @Column({ name: 'project_id', nullable: true })
  projectId: string;

  @ManyToOne(() => Project, project => project.calendarEvents, { nullable: true })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ name: 'client_id', nullable: true })
  clientId: string;

  @ManyToOne(() => Client, { nullable: true })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ name: 'assigned_employee_id', nullable: true })
  assignedEmployeeId: string;

  @ManyToOne(() => Employee, employee => employee.calendarEvents, { nullable: true })
  @JoinColumn({ name: 'assigned_employee_id' })
  assignedEmployee: Employee;

  @Column({ name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
