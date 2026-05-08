import { Router, type IRouter } from 'express';
import type { JobService } from '../services/job.service.js';
import { toJobResponse } from '../services/job.service.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireEmployer } from '../middleware/employer.middleware.js';
import { CreateJobDto, JobListQueryDto, UpdateJobDto } from '../dto/job.dto.js';
import { validateDto } from '../utils/validation.js';

export function createJobsRouter(jobService: JobService): IRouter {
  const router = Router();

  router.get('/', async (req, res) => {
    try {
      const { dto, errors } = await validateDto(JobListQueryDto, req.query);
      if (errors.length > 0) {
        res.status(400).json({ message: 'Validation failed', errors });
        return;
      }
      const result = await jobService.list(dto);
      res.status(200).json({
        data: result.items.map(toJobResponse),
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit) || 0,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const job = await jobService.findById(id);
      if (!job) {
        res.status(404).json({ message: 'Job not found' });
        return;
      }
      res.status(200).json({ data: toJobResponse(job) });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.post(
    '/',
    authenticate,
    requireEmployer,
    async (req, res) => {
      try {
        const { dto, errors } = await validateDto(CreateJobDto, req.body);
        if (errors.length > 0) {
          res.status(400).json({ message: 'Validation failed', errors });
          return;
        }
        const userId = req.auth!.userId;
        const job = await jobService.create(userId, dto);
        res.status(201).json({ data: toJobResponse(job) });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
      }
    },
  );

  router.patch(
    '/:id',
    authenticate,
    requireEmployer,
    async (req, res) => {
      try {
        const { dto, errors } = await validateDto(UpdateJobDto, req.body);
        if (errors.length > 0) {
          res.status(400).json({ message: 'Validation failed', errors });
          return;
        }
        const userId = req.auth!.userId;
        const { id } = req.params;
        const outcome = await jobService.update(userId, id, dto);
        if ('notFound' in outcome) {
          res.status(404).json({ message: 'Job not found' });
          return;
        }
        if ('forbidden' in outcome) {
          res.status(403).json({ message: 'You can only update your own job postings' });
          return;
        }
        res.status(200).json({ data: toJobResponse(outcome.job) });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
      }
    },
  );

  router.delete(
    '/:id',
    authenticate,
    requireEmployer,
    async (req, res) => {
      try {
        const userId = req.auth!.userId;
        const { id } = req.params;
        const outcome = await jobService.remove(userId, id);
        if ('notFound' in outcome) {
          res.status(404).json({ message: 'Job not found' });
          return;
        }
        if ('forbidden' in outcome) {
          res.status(403).json({ message: 'You can only delete your own job postings' });
          return;
        }
        res.status(204).send();
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
      }
    },
  );

  return router;
}
