import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Sample {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  sampleBoxNumber: string;

  @Column({ type: 'date' })
  date: string;

  @Column()
  mealType: string;

  @Column()
  dishName: string;

  @Column()
  sampleTime: string;

  @Column()
  sampler: string;

  @Column({ nullable: true })
  photo: string;

  @Column({ default: 'stored' })
  status: string;

  @Column({ nullable: true })
  disposeTime: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
