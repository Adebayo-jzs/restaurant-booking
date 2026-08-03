import {OAuth2Client} from 'google-auth-library';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

const googleClient = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
);

export function getGoogleAuthUrl(state: string): string {
    return googleClient.generateAuthUrl({
        access_type: "offline",       // get a refresh token from Google (not needed for our flow but good practice)
        scope: ["openid", "email", "profile"],
        state,                        // CSRF protection
        prompt: "consent",            // force consent screen so we always get a refresh_token
    });
}

export async function getGoogleUser(code: string) {
    const { tokens } = await googleClient.getToken(code);

    if (!tokens.id_token) {
        throw new Error("No id_token returned from Google");
    }
    const ticket = await googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) {
        throw new Error("Failed to decode Google id_token");
    }

     return {
        googleId: payload.sub,       // Google's unique user ID
        email: payload.email!,
        name: payload.name || "Google User",
        picture: payload.picture || null,
        emailVerified: payload.email_verified || false,
    };
}