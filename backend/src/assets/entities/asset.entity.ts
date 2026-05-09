import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { AssetCondition } from '../enums/asset-condition.enum';
import { AssetCategory } from '../enums/asset-category.enum';
import { User } from '../../users/entities/user.entity';
import { Document } from '../../documents/entities/document.entity';
import { MaintenanceEvent } from '../../maintenance-events/entities/maintenance-event.entity';

@Entity()
@Index(['user', 'created_at'])
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  name!: string;

  @Column({
    type: 'enum',
    enum: AssetCategory,
    default: AssetCategory.OTHER,
  })
  category!: AssetCategory;

  @Index()
  @Column()
  purchase_date!: Date;

  @Index()
  @Column()
  purchase_price_cents!: number;

  @Column({
    type: 'enum',
    nullable: true,
    enum: AssetCondition,
  })
  condition!: AssetCondition;

  @Column({ nullable: true })
  notes!: string;

  @Index()
  @Column({ nullable: true })
  warranty_end_date!: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Index()
  @ManyToOne(() => User, (user) => user.assets, { onDelete: 'CASCADE' })
  user!: User;

  @OneToMany(() => Document, (document) => document.asset)
  documents!: Document[];

  @OneToMany(
    () => MaintenanceEvent,
    (maintenanceEvent) => maintenanceEvent.asset,
  )
  maintenanceEvents!: MaintenanceEvent[];
}
