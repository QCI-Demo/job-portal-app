import { Repository } from 'typeorm';
import { Job, JobStatus } from '../entity/Job.js';
import type { CreateJobDto, JobListQueryDto, UpdateJobDto } from '../dto/job.dto.js';

export type JobListResult = {
  items: Job[];
  total: number;
  page: number;
  limit: number;
};

export function toJobResponse(job: Job) {
  return {
    id: job.id,
    employerId: job.employerId,
    title: job.title,
    description: job.description,
    location: job.location,
    employmentType: job.employmentType,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    status: job.status,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}

export class JobService {
  constructor(private readonly repo: Repository<Job>) {}

  async list(query: JobListQueryDto): Promise<JobListResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const qb = this.repo.createQueryBuilder('job');

    if (query.title?.trim()) {
      qb.andWhere('job.title ILIKE :title', {
        title: `%${query.title.trim()}%`,
      });
    }
    if (query.location?.trim()) {
      qb.andWhere('job.location ILIKE :location', {
        location: `%${query.location.trim()}%`,
      });
    }

    qb.orderBy('job.created_at', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async findById(id: string): Promise<Job | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(employerId: string, dto: CreateJobDto): Promise<Job> {
    const job = this.repo.create({
      employerId,
      title: dto.title,
      description: dto.description,
      location: dto.location,
      employmentType: dto.employmentType,
      salaryMin: dto.salaryMin ?? null,
      salaryMax: dto.salaryMax ?? null,
      status: dto.status ?? JobStatus.DRAFT,
    });
    return this.repo.save(job);
  }

  async update(
    employerId: string,
    id: string,
    dto: UpdateJobDto,
  ): Promise<{ job: Job } | { notFound: true } | { forbidden: true }> {
    const job = await this.repo.findOne({ where: { id } });
    if (!job) {
      return { notFound: true };
    }
    if (job.employerId !== employerId) {
      return { forbidden: true };
    }
    if (dto.title !== undefined) job.title = dto.title;
    if (dto.description !== undefined) job.description = dto.description;
    if (dto.location !== undefined) job.location = dto.location;
    if (dto.employmentType !== undefined) job.employmentType = dto.employmentType;
    if (dto.salaryMin !== undefined) job.salaryMin = dto.salaryMin;
    if (dto.salaryMax !== undefined) job.salaryMax = dto.salaryMax;
    if (dto.status !== undefined) job.status = dto.status;
    await this.repo.save(job);
    return { job };
  }

  async remove(
    employerId: string,
    id: string,
  ): Promise<{ ok: true } | { notFound: true } | { forbidden: true }> {
    const job = await this.repo.findOne({ where: { id } });
    if (!job) {
      return { notFound: true };
    }
    if (job.employerId !== employerId) {
      return { forbidden: true };
    }
    await this.repo.remove(job);
    return { ok: true };
  }
}
