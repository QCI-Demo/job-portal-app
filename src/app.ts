import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { createJobsRouter } from './routes/jobs.routes.js';
import type { JobService } from './services/job.service.js';

export function createApp(jobService: JobService): Express {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api/jobs', createJobsRouter(jobService));

  app.use((_req, res) => {
    res.status(404).json({ message: 'Not found' });
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  });

  return app;
}
