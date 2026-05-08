import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entity/User.js';
import { Job } from './entity/Job.js';
import { Application } from './entity/Application.js';
import { AuditLog } from './entity/AuditLog.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: process.env.TYPEORM_SYNC === 'true',
  logging: process.env.TYPEORM_LOGGING === 'true',
  entities: [User, Job, Application, AuditLog],
});
