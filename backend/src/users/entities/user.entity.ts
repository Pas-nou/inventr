import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserRole } from '../enums/user-role.enum';
import { Asset } from '../../assets/entities/asset.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ nullable: true, type: 'text' })
  refresh_token: string | null;

  @Column({ default: false })
  email_verified: boolean;

  @Column({ nullable: true, type: 'text' })
  verification_token: string | null;

  @Column({ nullable: true, type: 'timestamptz' })
  verification_token_expires_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Asset, (asset) => asset.user)
  assets: Asset[];
}
