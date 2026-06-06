import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Supplier } from './supplier.entity';

@Entity()
export class IngredientBatch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  batchNumber: string;

  @Column()
  ingredientName: string;

  @Column()
  quantity: number;

  @Column({ default: 'kg' })
  unit: string;

  @ManyToOne(() => Supplier, supplier => supplier.batches, { eager: true })
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @Column()
  supplierId: number;

  @Column({ type: 'date' })
  productionDate: string;

  @Column({ type: 'date' })
  expirationDate: string;

  @Column({ type: 'date' })
  receiveDate: string;

  @Column({ nullable: true, type: 'text' })
  acceptancePhoto: string;

  @Column({ nullable: true, type: 'text' })
  invoicePhoto: string;

  @Column({ default: 'normal' })
  status: string;

  @Column({ nullable: true })
  remark: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
