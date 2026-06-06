import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class EscortReview {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: string;

  @Column()
  parentName: string;

  @Column({ nullable: true })
  className: string;

  @Column()
  rating: number;

  @Column({ nullable: true, type: 'text' })
  photo: string;

  @Column({ nullable: true, type: 'text' })
  suggestion: string;

  @Column({ default: false })
  isNegative: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
