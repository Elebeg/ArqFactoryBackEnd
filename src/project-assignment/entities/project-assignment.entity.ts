import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../../project/entities/project.entity';
import { Employee } from '../../employee/entities/employee.entity'; 

export enum AssignmentRole {
  LEAD_ARCHITECT = 'lead_architect',
  ARCHITECT = 'architect',
  ENGINEER = 'engineer',
  SUPERVISOR = 'supervisor',
  TECHNICIAN = 'technician'
}

@Entity('project_assignments')
export class ProjectAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id' })
  projectId: string;

  @ManyToOne(() => Project, project => project.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ name: 'employee_id' })
  employeeId: string;

  @ManyToOne(() => Employee, employee => employee.projectAssignments)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ type: 'enum', enum: AssignmentRole })
  role: AssignmentRole;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @CreateDateColumn({ name: 'assigned_at' })
  assignedAt: Date;
}