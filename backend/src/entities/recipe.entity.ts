import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { IngredientBatch } from './ingredient-batch.entity';

@Entity()
export class Recipe {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: string;

  @Column()
  mealType: string;

  @Column()
  dishName: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @ManyToMany(() => IngredientBatch, { eager: true })
  @JoinTable()
  ingredientBatches: IngredientBatch[];

  @Column({ nullable: true })
  photo: string;

  @Column({ type: 'simple-array', default: '' })
  allergens: string[];

  @Column({ default: 'published' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
