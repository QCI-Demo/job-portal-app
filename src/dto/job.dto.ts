import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  Length,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { EmploymentType, JobStatus } from '../entity/Job.js';

/** Request body for creating a job (employer-only). */
export class CreateJobDto {
  @Length(1, 200)
  title!: string;

  @MinLength(1)
  description!: string;

  @Length(1, 180)
  location!: string;

  @IsEnum(EmploymentType)
  employmentType!: EmploymentType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  salaryMin?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  salaryMax?: number | null;

  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;
}

/** Partial update for a job (employer-only, owner). */
export class UpdateJobDto {
  @IsOptional()
  @Length(1, 200)
  title?: string;

  @IsOptional()
  @MinLength(1)
  description?: string;

  @IsOptional()
  @Length(1, 180)
  location?: string;

  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  salaryMin?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  salaryMax?: number | null;

  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;
}

/** Query string for listing jobs with pagination and filters. */
export class JobListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @IsOptional()
  @Length(1, 200)
  title?: string;

  @IsOptional()
  @Length(1, 180)
  location?: string;
}
