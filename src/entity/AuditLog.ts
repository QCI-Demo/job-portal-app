import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { IsOptional, IsUUID, Length } from 'class-validator';
import { User } from './User.js';

@Entity('audit_logs')
@Index('IDX_audit_logs_entity', ['entityType', 'entityId'])
@Index('IDX_audit_logs_created_at', ['createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  userId!: string | null;

  @ManyToOne(() => User, (user) => user.auditLogs, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'user_id' })
  user?: User | null;

  @Column({ name: 'entity_type', type: 'varchar', length: 100 })
  @Length(1, 100)
  entityType!: string;

  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  entityId!: string | null;

  @Column({ type: 'varchar', length: 100 })
  @Length(1, 100)
  action!: string;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  payload!: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
