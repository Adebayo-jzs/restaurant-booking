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