import { beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import type { JobService } from '../services/job.service.js';
import { Job, EmploymentType, JobStatus } from '../entity/Job.js';
import { UserRole } from '../entity/User.js';
import { signAccessToken } from '../utils/jwt.js';

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret';
});

function sampleJob(overrides: Partial<Job> = {}): Job {
  const job = new Job();
  job.id = '11111111-1111-1111-1111-111111111111';
  job.employerId = '22222222-2222-2222-2222-222222222222';
  job.title = 'Backend Engineer';
  job.description = 'We are hiring';
  job.location = 'Berlin';
  job.employmentType = EmploymentType.FULL_TIME;
  job.salaryMin = 70000;
  job.salaryMax = 90000;
  job.status = JobStatus.ACTIVE;
  job.createdAt = new Date('2024-01-01T00:00:00.000Z');
  job.updatedAt = new Date('2024-01-02T00:00:00.000Z');
  return Object.assign(job, overrides);
}

describe('GET /api/jobs', () => {
  it('returns paginated list', async () => {
    const jobService = {
      list: vi.fn().mockResolvedValue({
        items: [sampleJob()],
        total: 1,
        page: 1,
        limit: 20,
      }),
    } as unknown as JobService;

    const res = await request(createApp(jobService)).get('/api/jobs');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta.total).toBe(1);
    expect(jobService.list).toHaveBeenCalled();
  });

  it('returns 400 for invalid query', async () => {
    const jobService = { list: vi.fn() } as unknown as JobService;
    const res = await request(createApp(jobService))
      .get('/api/jobs')
      .query({ limit: 500 });
    expect(res.status).toBe(400);
    expect(jobService.list).not.toHaveBeenCalled();
  });
});

describe('GET /api/jobs/:id', () => {
  it('returns 404 when missing', async () => {
    const jobService = {
      findById: vi.fn().mockResolvedValue(null),
    } as unknown as JobService;
    const res = await request(createApp(jobService)).get(
      '/api/jobs/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    );
    expect(res.status).toBe(404);
  });

  it('returns job', async () => {
    const jobService = {
      findById: vi.fn().mockResolvedValue(sampleJob()),
    } as unknown as JobService;
    const res = await request(createApp(jobService)).get(
      '/api/jobs/11111111-1111-1111-1111-111111111111',
    );
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Backend Engineer');
  });
});

describe('POST /api/jobs', () => {
  it('returns 401 without token', async () => {
    const jobService = { create: vi.fn() } as unknown as JobService;
    const res = await request(createApp(jobService))
      .post('/api/jobs')
      .send({
        title: 'T',
        description: 'D',
        location: 'L',
        employmentType: EmploymentType.FULL_TIME,
      });
    expect(res.status).toBe(401);
  });

  it('returns 403 for seeker token', async () => {
    const token = signAccessToken(
      { sub: '22222222-2222-2222-2222-222222222222', role: UserRole.SEEKER },
      'test-secret',
    );
    const jobService = { create: vi.fn() } as unknown as JobService;
    const res = await request(createApp(jobService))
      .post('/api/jobs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'T',
        description: 'D',
        location: 'L',
        employmentType: EmploymentType.FULL_TIME,
      });
    expect(res.status).toBe(403);
  });

  it('creates job for employer', async () => {
    const employerId = '22222222-2222-2222-2222-222222222222';
    const token = signAccessToken(
      { sub: employerId, role: UserRole.EMPLOYER },
      'test-secret',
    );
    const created = sampleJob({ employerId });
    const jobService = {
      create: vi.fn().mockResolvedValue(created),
    } as unknown as JobService;

    const res = await request(createApp(jobService))
      .post('/api/jobs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'New role',
        description: 'Details here',
        location: 'Remote',
        employmentType: EmploymentType.PART_TIME,
      });
    expect(res.status).toBe(201);
    expect(jobService.create).toHaveBeenCalledWith(
      employerId,
      expect.objectContaining({
        title: 'New role',
        employmentType: EmploymentType.PART_TIME,
      }),
    );
  });
});

describe('PATCH /api/jobs/:id', () => {
  it('returns 403 when not owner', async () => {
    const token = signAccessToken(
      { sub: '99999999-9999-9999-9999-999999999999', role: UserRole.EMPLOYER },
      'test-secret',
    );
    const jobService = {
      update: vi.fn().mockResolvedValue({ forbidden: true }),
    } as unknown as JobService;
    const res = await request(createApp(jobService))
      .patch('/api/jobs/11111111-1111-1111-1111-111111111111')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'X' });
    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/jobs/:id', () => {
  it('returns 204 on success', async () => {
    const token = signAccessToken(
      { sub: '22222222-2222-2222-2222-222222222222', role: UserRole.EMPLOYER },
      'test-secret',
    );
    const jobService = {
      remove: vi.fn().mockResolvedValue({ ok: true }),
    } as unknown as JobService;
    const res = await request(createApp(jobService))
      .delete('/api/jobs/11111111-1111-1111-1111-111111111111')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
  });
});
