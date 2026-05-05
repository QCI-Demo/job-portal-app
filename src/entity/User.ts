import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  Length,
} from 'class-validator';
import { Job } from './Job.js';
import { Application } from './Application.js';
import { AuditLog } from './AuditLog.js';

export enum UserRole {
  SEEKER = 'seeker',
  EMPLOYER = 'employer',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  @IsEmail()
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255, select: false })
  @Length(1, 255)
  passwordHash!: string;

  @Column({ type: 'varchar', length: 120 })
  @Length(1, 120)
  name!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    enumName: 'user_role_enum',
    default: UserRole.SEEKER,
  })
  @IsEnum(UserRole)
  role!: UserRole;

  @Column({ name: 'company_name', type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @Length(1, 255)
  companyName?: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => Job, (job) => job.employer)
  jobs!: Job[];

  @OneToMany(() => Application, (application) => application.applicant)
  applications!: Application[];

  @OneToMany(() => AuditLog, (log) => log.user)
  auditLogs!: AuditLog[];
}
