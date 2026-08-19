/**
 * Cloudflare Worker entry point.
 *
 * Bridges the Express app to the Workers runtime via httpServerHandler
 * and handles scheduled (cron) triggers for booking reminders.
 */
import 'dotenv/config';
import { httpServerHandler } from 'cloudflare:node';
import app from './app';
import { checkAndSendBookingReminders } from './services/cron.service';

const PORT = 8787;

// Start Express on a local port (internal to the Worker runtime)
app.listen(PORT, () => {
    console.log(`[Worker] Express server listening on internal port ${PORT}`);
});

// httpServerHandler returns an ExportedHandler with a fetch method.
// Spread it so we inherit the fetch handler, then add our scheduled handler.
const httpHandler = httpServerHandler({ port: PORT });

export default {
    ...httpHandler,

    // Cloudflare Cron Trigger – runs booking reminder checks
    async scheduled(
        controller: ScheduledController,
        env: Record<string, string>,
        ctx: ExecutionContext
    ) {
        console.log(`[Worker] Scheduled event triggered: ${controller.cron}`);
        ctx.waitUntil(checkAndSendBookingReminders());
    },
};

