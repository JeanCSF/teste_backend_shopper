import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'measures' })
export class MeasureEntity {
  @PrimaryGeneratedColumn('uuid')
  measure_uuid: string;

  @Column({ name: 'image_url', nullable: false })
  image_url: string;

  @Column({ name: 'measure_value', nullable: false })
  measure_value: number;

  @Column({ name: 'customer_code', nullable: false })
  customer_code: string;

  @Column({ name: 'measure_datetime', nullable: false })
  measure_datetime: Date;

  @Column({ name: 'measure_type', nullable: false })
  measure_type: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @Column({ name: 'has_confirmed', nullable: false, default: false })
  has_confirmed: boolean;

  constructor(measure?: Partial<MeasureEntity>) {
    Object.assign(this, measure);
  }
}
