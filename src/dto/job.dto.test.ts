import { describe, expect, it } from 'vitest';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  CreateJobDto,
  JobListQueryDto,
  UpdateJobDto,
} from './job.dto.js';
import { EmploymentType, JobStatus } from '../entity/Job.js';

describe('CreateJobDto', () => {
  it('rejects empty title', async () => {
    const dto = plainToInstance(CreateJobDto, {
      title: '',
      description: 'Desc',
      location: 'NYC',
      employmentType: EmploymentType.FULL_TIME,
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'title')).toBe(true);
  });

  it('accepts valid payload', async () => {
    const dto = plainToInstance(CreateJobDto, {
      title: 'Engineer',
      description: 'Build things',
      location: 'Remote',
      employmentType: EmploymentType.CONTRACT,
      salaryMin: 80000,
      salaryMax: 120000,
      status: JobStatus.ACTIVE,
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});

describe('JobListQueryDto', () => {
  it('applies defaults for page and limit', async () => {
    const dto = plainToInstance(JobListQueryDto, {}, { exposeDefaultValues: true });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(20);
  });

  it('rejects limit over 100', async () => {
    const dto = plainToInstance(
      JobListQueryDto,
      { page: 1, limit: 200 },
      { enableImplicitConversion: true },
    );
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'limit')).toBe(true);
  });
});

describe('UpdateJobDto', () => {
  it('allows partial body', async () => {
    const dto = plainToInstance(UpdateJobDto, { title: 'Only title' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
