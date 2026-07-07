import cors from 'cors';
import express from 'express';
import { runLifecycleJobs, scheduleLifecycleCron } from './cron/lifecycle-jobs.js';
import { tracksRouter } from './routes/tracks.js';

const PORT = Number(process.env.PORT ?? 3001);
const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'pma-music-server' });
});

app.use('/api/tracks', tracksRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`PMA Music API listening on http://localhost:${PORT}`);
  runLifecycleJobs();
  scheduleLifecycleCron();
});
