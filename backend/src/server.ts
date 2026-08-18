import 'dotenv/config';
import app from './app';
import { startCronJobs } from './services/cron.service';

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    startCronJobs();
});

