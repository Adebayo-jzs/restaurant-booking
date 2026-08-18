import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:8000/api';

async function testAuth() {
    const ownerEmail = 'calmsp0+owner1@gmail.com';
    const customerEmail = 'calmsp0+customer1@gmail.com';
    const password = 'passwword';

    console.log(=== Testing Authentication Endpoints ===);

    // 1. Register Owner
    console.log(\n[1] Registering Owner: );
    let res = await fetch(${API_URL}/auth/register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test Owner', email: ownerEmail, password, role: 'OWNER' })
    });
    let data = await res.json();
    console.log(Register Owner Response:, data);

    // 2. Register Customer
    console.log(\n[2] Registering Customer: );
    res = await fetch(${API_URL}/auth/register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test Customer', email: customerEmail, password, role: 'CUSTOMER' })
    });
    data = await res.json();
    console.log(Register Customer Response:, data);

    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3. Fetch OTPs from DB directly
    console.log(\n[3] Fetching OTPs from Database to bypass email...);
    const ownerRecord = await prisma.user.findUnique({ where: { email: ownerEmail } });
    const customerRecord = await prisma.user.findUnique({ where: { email: customerEmail } });

    console.log(Owner OTP:, ownerRecord?.verificationToken);
    console.log(Customer OTP:, customerRecord?.verificationToken);

    // 4. Verify Owner
    if (ownerRecord?.verificationToken) {
        console.log(\n[4] Verifying Owner...);
        res = await fetch(${API_URL}/auth/verify-email, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: ownerEmail, otp: ownerRecord.verificationToken })
        });
        data = await res.json();
        console.log(Verify Owner Response:, data);
    }

    // 5. Verify Customer
    if (customerRecord?.verificationToken) {
        console.log(\n[5] Verifying Customer...);
        res = await fetch(${API_URL}/auth/verify-email, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: customerEmail, otp: customerRecord.verificationToken })
        });
        data = await res.json();
        console.log(Verify Customer Response:, data);
    }

    // 6. Login Owner
    console.log(\n[6] Logging in Owner...);
    res = await fetch(${API_URL}/auth/login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ownerEmail, password })
    });
    data = await res.json();
    console.log(Login Owner Response:, data.success ? Success (Token Hidden) : data);
    const ownerToken = data.accessToken;

    if (ownerToken) {
        console.log(\n[7] Testing /me with Owner Token...);
        res = await fetch(${API_URL}/auth/me, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + ownerToken
            }
        });
        data = await res.json();
        console.log(/me Response:, data);
    }
}
testAuth().catch(console.error).finally(() => prisma.$disconnect());
