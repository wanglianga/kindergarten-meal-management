import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class MealDistribution {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: string;

  @Column()
  className: string;

  @Column()
  mealType: string;

  @Column()
  childName: string;

  @Column({ type: 'simple-array', default: '' })
  childAllergens: string[];

  @Column({ type: 'simple-array', default: '' })
  restrictedDishes: string[];

  @Column({ type: 'text', nullable: true })
  substituteMeal: string;

  @Column({ type: 'simple-array', default: '' })
  substitutePhotos: string[];

  @Column({ nullable: true })
  confirmedBy: string;

  @Column({ type: 'datetime', nullable: true })
  confirmedAt: Date;

  @Column({ default: false })
  hasRisk: boolean;

  @Column({ type: 'text', nullable: true })
  riskDescription: string;

  @Column({ default: 'pending' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
