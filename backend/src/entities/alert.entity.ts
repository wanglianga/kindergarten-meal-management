import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Alert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: 'active' })
  status: string;

  @Column({ nullable: true })
  relatedId: number;

  @Column({ type: 'date', nullable: true })
  alertDate: string;

  @Column({ default: false })
  hasRectification: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
