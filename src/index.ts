import 'reflect-metadata';
import dotenv from 'dotenv';

dotenv.config();

const { AppDataSource } = await import('./data-source.js');
const { Job } = await import('./entity/Job.js');
const { JobService } = await import('./services/job.service.js');
const { createApp } = await import('./app.js');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

await AppDataSource.initialize();
const jobService = new JobService(AppDataSource.getRepository(Job));
const app = createApp(jobService);

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
