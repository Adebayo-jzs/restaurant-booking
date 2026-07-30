# Advanced Authentication Implementation Guide

Here is a step-by-step conceptual guide and architectural notes for implementing the remaining authentication routes yourself.

## 1. Refresh Token (`POST /refresh-token`)
**Why:** Access tokens (JWTs) should have a short lifespan (e.g., 15 minutes) for security. A refresh token is a longer-lived token (e.g., 7 days) used to get a new access token without forcing the user to log in again.

**Implementation Steps:**
1. **Schema Update:** Update your `schema.prisma` `User` model (or create a new `RefreshToken` model) to store the hashed refresh token or track token revocation.
2. **Login Update:** During `POST /login`, generate *two* tokens:
   - `accessToken`: Short expiry (`15m`). Send this in the JSON response.
   - `refreshToken`: Long expiry (`7d`). Send this as an `httpOnly`, `secure` cookie (so JavaScript cannot access it, preventing XSS attacks).
3. **The Route:** Create `POST /refresh-token`.
   - Read the refresh token from `req.cookies`.
   - Verify the token using `jsonwebtoken`.
   - Check if the user exists and the token matches the one in the database (if tracking).
   - Generate a new `accessToken` and send it back to the client.

## 2. Forgot / Reset Password
**Why:** Users will forget their passwords. This flow securely allows them to regain access using their email.

**Implementation Steps:**
1. **Schema Update:** Add two fields to the `User` model: 
   - `resetPasswordToken` (String, nullable)
   - `resetPasswordExpires` (DateTime, nullable)
2. **Forgot Route (`POST /forgot-password`):**
   - Accept an `email` in the request body.
   - Look up the user. If they exist, generate a random secure token (e.g., using Node's `crypto.randomBytes`).
   - Hash the token and save it to the database with an expiration time (e.g., 1 hour from now).
   - Send an email to the user (using a service like Resend, SendGrid, or Nodemailer) containing a link to your frontend: `https://yourfrontend.com/reset-password?token=UNHASHED_TOKEN`.
3. **Reset Route (`POST /reset-password`):**
   - Accept the `token` and a `newPassword` in the request body.
   - Hash the incoming token and look for a user in the database with that exact hash AND where `resetPasswordExpires` is greater than `now()`.
   - If valid, hash the `newPassword` using `bcryptjs`, update the user's password, and clear the reset token/expiry fields.

## 3. Email Verification (`POST /verify-email`)
**Why:** Prevents spam accounts and ensures you can reliably contact the user.

**Implementation Steps:**
1. **Schema Update:** Add `isEmailVerified` (Boolean, default `false`), `verificationToken` (String, nullable).
2. **Register Update:** During `POST /register`, generate a verification token, save it to the user, and send them an email with a verification link.
3. **Verify Route (`POST /verify-email`):**
   - Accept the token from the URL/body.
   - Find the user with that token.
   - Set `isEmailVerified = true` and clear the token.

## 4. Update Password (`PUT /update-password`)
**Why:** Logged-in users should be able to change their password proactively.

**Implementation Steps:**
1. **The Route:** Protect this route with your existing `authMiddleware`.
2. **The Logic:**
   - Accept `currentPassword` and `newPassword` in the request body.
   - Find the user by `req.user.id` (set by your middleware).
   - Use `bcrypt.compare` to verify `currentPassword` matches the database.
   - If it matches, hash `newPassword` and update the database.

## 5. Logout (`POST /logout`)
**Why:** Important if you are using cookies for either access tokens or refresh tokens.

**Implementation Steps:**
1. **The Route:** If using cookies, call `res.clearCookie('refreshToken')` (and `accessToken` if applicable).
2. **Database (Optional):** If you are storing refresh tokens in the database, delete the record so the token can no longer be used.
