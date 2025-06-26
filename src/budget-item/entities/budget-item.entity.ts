import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Budget } from '../../budget/entities/budget.entity';

@Entity('budget_items')
export class BudgetItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column('decimal', { precision: 10, scale: 3 })
  quantity: number;

  @Column()
  unit: string; // m², m³, unidade, etc.

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;

  @Column('decimal', { precision: 12, scale: 2 })
  totalPrice: number;

  @Column({ name: 'budget_id' })
  budgetId: string;

  @ManyToOne(() => Budget, budget => budget.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'budget_id' })
  budget: Budget;
}