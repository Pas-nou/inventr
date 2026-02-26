import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { DocumentType } from '../enums/document-type.enum';
import { Asset } from '../../assets/entities/asset.entity';

@Entity()
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
    type: 'enum',
    enum: DocumentType,
  })
  type: DocumentType;

  @Column()
  original_filename: string;

  @Column()
  mime_type: string;

  @Column()
  size_bytes: number;

  @Column({ unique: true })
  storage_key: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ default: 'supabase' })
  storage_provider: string;

  @ManyToOne(() => Asset, (asset) => asset.documents, { onDelete: 'CASCADE' })
  asset: Asset;
}
