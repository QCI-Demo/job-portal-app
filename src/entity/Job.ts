import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import {
  IsEnum,
  IsInt,
  IsOptional,
  Length,
  Min,
  MinLength,
} from 'class-validator';
import { User } from './User.js';
import { Application } from './Application.js';

export enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERNSHIP = 'internship',
}

export enum JobStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  CLOSED = 'closed',
}

@Entity('jobs')
@Index('IDX_jobs_title', ['title'])
@Index('IDX_jobs_location', ['location'])
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'employer_id', type: 'uuid' })
  employerId!: string;

  @ManyToOne(() => User, (user) => user.jobs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employer_id' })
  employer!: User;

  @Column({ type: 'varchar', length: 200 })
  @Length(1, 200)
  title!: string;

  @Column({ type: 'text' })
  @MinLength(1)
  description!: string;

  @Column({ type: 'varchar', length: 180 })
  @Length(1, 180)
  location!: string;

  @Column({
    name: 'employment_type',
    type: 'enum',
    enum: EmploymentType,
    enumName: 'employment_type_enum',
    default: EmploymentType.FULL_TIME,
  })
  @IsEnum(EmploymentType)
  employmentType!: EmploymentType;

  @Column({ name: 'salary_min', type: 'int', nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMin?: number | null;

  @Column({ name: 'salary_max', type: 'int', nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMax?: number | null;

  @Column({
    type: 'enum',
    enum: JobStatus,
    enumName: 'job_status_enum',
    default: JobStatus.DRAFT,
  })
  @IsEnum(JobStatus)
  status!: JobStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => Application, (application) => application.job)
  applications!: Application[];
}
