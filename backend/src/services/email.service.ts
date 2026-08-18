import {SendByte} from "@sendbyte/node";

const sendbyte = new SendByte(process.env.SENDBYTE_API_KEY as string);

export const sendVerificationEmail = async (email: string, name: string, otp: string) => {
    try {

        await sendbyte.emails.send({
            from: 'Restaurant Booking Platform <bayo@try.sendbyte.africa>',
            to: email,
            subject: 'Verify your email address',
            template_id:'bb1ddc1c-d935-4f78-95ec-8a3da5086313',
            variables: {
                email: email,
                name: name.split(' ')[0], 
                otp: otp
            }
        });
    } catch (error) {
        console.error("Failed to send verification email: ", error);
    }
}

export const sendBookingVerificationEmail = async (email: string, name: string, otp: string) => {
    try {
        await sendbyte.emails.send({
            from: 'Restaurant Booking Platform <bayo@try.sendbyte.africa>',
            to: email,
            subject: 'Verify your restaurant booking',
            // You can easily swap this out for a dedicated booking verification template later!
            template_id:'bb1ddc1c-d935-4f78-95ec-8a3da5086313',
            variables: {
                email: email,
                name: name.split(' ')[0], 
                otp: otp
            }
        });
    } catch (error) {
        console.error("Failed to send booking verification email: ", error);
    }
}

export const sendReminderEmail = async (email:string, name: string, restaurant:string, date:Date, time: string, numberOfPeople: number, specialRequests?:string ) => {
    try {
        await sendbyte.emails.send({
            from: 'Restaurant Booking Platform <bayo@try.sendbyte.africa>',
            to: email,
            subject: 'Reminder: Your restaurant booking is in 10 minutes!',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #4F46E5;">Booking Reminder</h2>
                    <p>Hi ${name.split(' ')[0]},</p>
                    <p>This is a quick reminder that your table at <strong>${restaurant}</strong> is reserved for exactly 10 minutes from now!</p>
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4F46E5;">
                        <p style="margin: 5px 0;"><strong>Date:</strong> ${date.toDateString()}</p>
                        <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
                        <p style="margin: 5px 0;"><strong>Guests:</strong> ${numberOfPeople}</p>
                        ${specialRequests ? `<p style="margin: 5px 0;"><strong>Special Requests:</strong> ${specialRequests}</p>` : ''}
                    </div>
                    <p>We hope you have a great time!</p>
                </div>
            `
        });
    } catch(error) {
        console.error("Failed to send reminder email: ", error);
    }
}

export const sendBookingStatusEmail = async (
    email: string, 
    name: string, 
    restaurant: string, 
    status: 'CONFIRMED' | 'REJECTED' | 'CANCELLED',
    date: Date,
    time: string,
    numberOfPeople: number
) => {
    try {
        let subject = '';
        let message = '';
        let color = '#4F46E5';
        
        const firstName = name.split(' ')[0];

        if (status === 'CONFIRMED') {
            subject = `Confirmed: Your booking at ${restaurant}`;
            message = `Great news, ${firstName}! Your booking at <strong>${restaurant}</strong> has been confirmed by the restaurant.`;
            color = '#10B981'; // Green
        } else if (status === 'REJECTED') {
            subject = `Update on your booking at ${restaurant}`;
            message = `Hi ${firstName}, we're sorry to inform you that <strong>${restaurant}</strong> could not accommodate your booking request for this time.`;
            color = '#EF4444'; // Red
        } else if (status === 'CANCELLED') {
            subject = `Cancelled: Your booking at ${restaurant}`;
            message = `Hi ${firstName}, your booking at <strong>${restaurant}</strong> has been successfully cancelled.`;
            color = '#6B7280'; // Gray
        }

        await sendbyte.emails.send({
            from: 'Restaurant Booking Platform <bayo@try.sendbyte.africa>',
            to: email,
            subject: subject,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: ${color};">Booking Update</h2>
                    <p>${message}</p>
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${color};">
                        <p style="margin: 5px 0;"><strong>Date:</strong> ${date.toDateString()}</p>
                        <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
                        <p style="margin: 5px 0;"><strong>Guests:</strong> ${numberOfPeople}</p>
                    </div>
                    <p>Thanks for using our platform!</p>
                </div>
            `
        });
    } catch (error) {
        console.error(`Failed to send ${status} email: `, error);
    }
}

export const sendNewBookingNotificationToOwner = async (
    ownerEmail: string,
    restaurantName: string,
    guestName: string,
    date: Date,
    time: string,
    numberOfPeople: number,
    specialRequests?: string
) => {
    try {
        await sendbyte.emails.send({
            from: 'Restaurant Booking Platform <bayo@try.sendbyte.africa>',
            to: ownerEmail,
            subject: `New Booking Request: ${restaurantName}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #4F46E5;">New Booking Request</h2>
                    <p>You have a new booking request for <strong>${restaurantName}</strong> that requires your approval.</p>
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4F46E5;">
                        <p style="margin: 5px 0;"><strong>Guest:</strong> ${guestName}</p>
                        <p style="margin: 5px 0;"><strong>Date:</strong> ${date.toDateString()}</p>
                        <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
                        <p style="margin: 5px 0;"><strong>Guests:</strong> ${numberOfPeople}</p>
                        ${specialRequests ? `<p style="margin: 5px 0;"><strong>Special Requests:</strong> ${specialRequests}</p>` : ''}
                    </div>
                    <p>Please log in to your dashboard to Accept or Reject this booking.</p>
                </div>
            `
        });
    } catch (error) {
        console.error("Failed to send new booking notification to owner: ", error);
    }
}

export const sendBookingPendingEmailToCustomer = async (
    email: string,
    name: string,
    restaurantName: string,
    date: Date,
    time: string,
    numberOfPeople: number
) => {
    try {
        await sendbyte.emails.send({
            from: 'Restaurant Booking Platform <bayo@try.sendbyte.africa>',
            to: email,
            subject: `Booking Request Sent: ${restaurantName}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #F59E0B;">Booking Request Pending</h2>
                    <p>Hi ${name.split(' ')[0]},</p>
                    <p>Your booking request for <strong>${restaurantName}</strong> has been successfully verified and sent to the restaurant!</p>
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
                        <p style="margin: 5px 0;"><strong>Date:</strong> ${date.toDateString()}</p>
                        <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
                        <p style="margin: 5px 0;"><strong>Guests:</strong> ${numberOfPeople}</p>
                    </div>
                    <p>We will notify you by email as soon as the restaurant Confirms or Rejects your request.</p>
                </div>
            `
        });
    } catch (error) {
        console.error("Failed to send pending booking email to customer: ", error);
    }
}