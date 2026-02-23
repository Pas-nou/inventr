import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { MaintenanceEventType } from '../enums/maintenance-event-type.enum';
import { Asset } from '../../assets/entities/asset.entity';

@Entity()
export class MaintenanceEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: MaintenanceEventType,
    default: MaintenanceEventType.OTHER,
  })
  type: MaintenanceEventType;

  @Column()
  date: Date;

  @Column({ nullable: true })
  cost_cents: number;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  next_due_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Asset, (asset) => asset.maintenanceEvents, {
    onDelete: 'CASCADE',
  })
  asset: Asset;
}
