import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Rectification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  alertType: string;

  @Column({ nullable: true })
  relatedId: number;

  @Column()
  problemType: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  measures: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ type: 'date', nullable: true })
  deadline: string;

  @Column({ type: 'date', nullable: true })
  completedDate: string;

  @Column({ nullable: true })
  handler: string;

  @Column({ nullable: true, type: 'text' })
  resultPhoto: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
