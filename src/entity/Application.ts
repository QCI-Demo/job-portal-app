import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { IsEnum, IsOptional, MaxLength } from 'class-validator';
import { User } from './User.js';
import { Job } from './Job.js';

export enum ApplicationStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('applications')
@Index('IDX_applications_job_applicant', ['jobId', 'applicantId'], {
  unique: true,
})
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'job_id', type: 'uuid' })
  jobId!: string;

  @ManyToOne(() => Job, (job) => job.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job!: Job;

  @Index()
  @Column({ name: 'applicant_id', type: 'uuid' })
  applicantId!: string;

  @ManyToOne(() => User, (user) => user.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'applicant_id' })
  applicant!: User;

  @Column({ name: 'cover_letter', type: 'text', nullable: true })
  @IsOptional()
  @MaxLength(10_000)
  coverLetter?: string | null;

  @Column({ name: 'resume_url', type: 'varchar', length: 2048, nullable: true })
  @IsOptional()
  @MaxLength(2048)
  resumeUrl?: string | null;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    enumName: 'application_status_enum',
    default: ApplicationStatus.PENDING,
  })
  @IsEnum(ApplicationStatus)
  status!: ApplicationStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
