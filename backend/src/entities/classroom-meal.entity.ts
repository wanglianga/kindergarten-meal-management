import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class ClassroomMeal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: string;

  @Column()
  className: string;

  @Column()
  mealType: string;

  @Column({ nullable: true, type: 'text' })
  allergies: string;

  @Column({ nullable: true, type: 'text' })
  tempRestrictions: string;

  @Column({ nullable: true, type: 'text' })
  leftovers: string;

  @Column({ default: 0 })
  leftoverCount: number;

  @Column({ nullable: true })
  recorder: string;

  @Column({ nullable: true })
  remark: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
