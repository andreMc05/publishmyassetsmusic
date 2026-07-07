import cron from 'node-cron';
import { refreshAllTrackLifecycles } from '../db/index.js';

export function runLifecycleJobs(): { updated: number; flagged: string[] } {
  console.log(`[lifecycle-cron] Running lifecycle refresh at ${new Date().toISOString()}`);
  const result = refreshAllTrackLifecycles();
  console.log(`[lifecycle-cron] Updated ${result.updated} track(s), ${result.flagged.length} flagged for curation`);
  return result;
}

export function scheduleLifecycleCron(): void {
  // Daily at 02:00 UTC
  cron.schedule('0 2 * * *', () => {
    runLifecycleJobs();
  });
  console.log('[lifecycle-cron] Scheduled daily lifecycle refresh at 02:00 UTC');
}

const isDirectRun = process.argv.includes('--once');
if (isDirectRun) {
  runLifecycleJobs();
}
