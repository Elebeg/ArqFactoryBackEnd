import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ProjectTask } from '../../project/entities/project-task.entity';
import { CalendarEvent } from '../../calendar-event/entities/calendar-event.entity';

export enum EmployeeRole {
  ARCHITECT = 'architect',
  ENGINEER = 'engineer',
  TECHNICIAN = 'technician',
  SUPERVISOR = 'supervisor',
  INTERN = 'intern'
}

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({ type: 'enum', enum: EmployeeRole })
  role: EmployeeRole;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  hourlyRate: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => ProjectTask, task => task.assignee)
  projectTask: ProjectTask[];

  @OneToMany(() => CalendarEvent, event => event.assignedEmployee)
  calendarEvents: CalendarEvent[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}