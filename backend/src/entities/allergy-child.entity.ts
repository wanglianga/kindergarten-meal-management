import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class AllergyChild {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  childName: string;

  @Column()
  className: string;

  @Column({ type: 'simple-array', default: '' })
  allergens: string[];

  @Column({ type: 'text', nullable: true })
  remark: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
