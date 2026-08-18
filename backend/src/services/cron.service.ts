import cron from 'node-cron';
import prisma from '../config/prisma';
import { sendReminderEmail } from './email.service';

export const startCronJobs = () => {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            // Target is exactly 10 minutes from now
            const targetTime = new Date(now.getTime() + 10 * 60 * 1000);

            // Extract the target date and time in West Africa Time (WAT)
            const watDateString = new Intl.DateTimeFormat('en-CA', { 
                timeZone: 'Africa/Lagos', 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
            }).format(targetTime);
            
            // Prisma stores dates as UTC midnight representing the day
            const targetDay = new Date(`${watDateString}T00:00:00.000Z`);
            
            const targetTimeStr = targetTime.toLocaleTimeString('en-GB', { 
                timeZone: 'Africa/Lagos', 
                hour: '2-digit', 
                minute: '2-digit' 
            });

            const upcomingBookings = await prisma.booking.findMany({
                where: {
                    status: "CONFIRMED",
                    reminderSent: false,
                    bookingDate: targetDay,
                    bookingTime: targetTimeStr
                },
                include: {
                    restaurant: true
                }
            });

            if (upcomingBookings.length > 0) {
                console.log(`[Cron] Found ${upcomingBookings.length} bookings starting in exactly 10 minutes.`);
            }

            for (const booking of upcomingBookings) {
                try {
                    await sendReminderEmail(
                        booking.guestEmail,
                        booking.guestName,
                        booking.restaurant.name,
                        booking.bookingDate,
                        booking.bookingTime,
                        booking.numberOfPeople,
                        booking.specialRequests || undefined
                    );

                    // Mark as sent so we don't spam if the server restarts or cron triggers twice somehow
                    await prisma.booking.update({
                        where: { id: booking.id },
                        data: { reminderSent: true }
                    });

                } catch (emailError) {
                    console.error(`[Cron] Failed to send reminder for booking ${booking.id}:`, emailError);
                }
            }
        } catch (error) {
            console.error("[Cron] Error processing reminder checks:", error);
        }
    });

    console.log("[Cron] Scheduled jobs initialized.");
};
