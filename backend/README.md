# CampusConnect Backend

Node.js 20+, Express 5, TypeScript, and MongoDB API.

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and configure `MONGODB_URI`, `JWT_SECRET`, and `CORS_ORIGINS`.
3. Start MongoDB locally or provide a reachable MongoDB URI.
4. Run `npm run dev` for the development server.

## Commands

- `npm run dev` starts the server with TypeScript watch mode.
- `npm run typecheck` checks types without generating output.
- `npm run build` compiles into `dist/`.
- `npm start` runs the compiled production server.

## Endpoints

- `GET /health/live` reports whether the process is alive.
- `GET /health/ready` reports readiness and MongoDB connectivity.
- `GET /` identifies the API.
- `GET /admin/clubs/pending` lists club registrations awaiting review; admin access token required.
- `PATCH /admin/clubs/:clubId/approve` approves a pending club; admin access token required.

## Authentication

Authentication routes are prefixed with `/auth`. Registration and login requests use JSON; refresh and logout send the refresh token in the `Authorization` header and have no request body.

### Student registration

`POST /student/register` creates a student and immediately returns a session.

```json
{
	"username": "sam.student",
	"email": "sam@example.edu",
	"password": "a-long-unique-passphrase",
	"fullName": "Sam Student",
	"batchYear": 2026,
	"universityRollNumber": "U2026-00421",
	"phoneNumber": "+919876543210"
}
```

Usernames are 3-30 characters and may contain letters, numbers, `_`, `.`, and `-`. Email and username are normalized to lowercase. Passwords must be 8-128 characters. `fullName` is 2-100 characters, `batchYear` is an integer from 1900 to 2200, and `universityRollNumber` is 1-40 characters. `phoneNumber` is required, validated as an international phone number, and stored in E.164 format with a country code (for example, `+919876543210`). Email, username, and roll number must be unique.

`POST /student/login` accepts:

```json
{
	"email": "sam@example.edu",
	"password": "a-long-unique-passphrase"
}
```

### Club registration and login

`POST /club/register` creates a club account in `pending` status. It does not issue login tokens until an admin approves the club:

```json
{
	"email": "robotics@example.edu",
	"password": "a-long-unique-passphrase",
	"clubName": "Robotics Club",
	"foundedYear": 2018
}
```

Club names are 2-100 characters. `foundedYear` must be an integer from 1800 through the current year. Club email addresses must be unique. `POST /club/login` accepts the same email/password shape as student login. CEO/club users use this club account flow; there is no separate public CEO registration route.

The registration response includes the club ID and status:

```json
{
	"status": "pending",
	"message": "Club registration submitted and is waiting for admin approval",
	"club": {
		"id": "<club id>",
		"role": "club",
		"email": "robotics@example.edu",
		"clubName": "Robotics Club",
		"foundedYear": 2018,
		"approvalStatus": "pending"
	}
}
```

Until approval, `POST /club/login` returns `403` with a pending-approval message. The club can use the same email and password after approval.

### Google sign-in

Configure a Google OAuth web client and set its client ID as `GOOGLE_CLIENT_ID` on the backend and frontend. The frontend sends the Google Identity Services ID token to `POST /google`:

```json
{
	"credential": "<Google ID token from the sign-in response>"
}
```

The server verifies the signature, audience, and verified email. Google sign-in is for an already-registered student whose account email matches that Google email; it does not create a partial student account or skip required registration fields. The first successful Google login links that Google account to the student record.

### Admin login

`POST /admin/login` accepts:

```json
{
	"id": "campus-admin",
	"password": "<admin password>"
}
```

Configure `ADMIN_ID` and `ADMIN_PASSWORD` only in the backend's private `.env` or deployment secret store. Both must be set together; the admin password must be at least 8 characters. There is intentionally no admin registration endpoint, and admin credentials must never be placed in frontend code or committed to source control. Admin login is unavailable until these values are configured.

Use the admin access token from login to review and approve clubs. Send it as `Authorization: Bearer <accessToken>`:

```http
GET /admin/clubs/pending
Authorization: Bearer <admin access token>
```

The response contains pending club IDs and their submitted email, name, founding year, status, and submission time. Approve the reviewed registration using its returned ID:

```http
PATCH /admin/clubs/65f1a0b2c3d4e5f607182930/approve
Authorization: Bearer <admin access token>
```

Approval sets the club status to `approved`; the club can then log in with its registration email and password. These review routes require the `admin` role and reject student or club tokens.

### Bearer sessions, refresh, and logout

Successful registration and login return this shape (the `user` fields vary by role):

```json
{
	"accessToken": "<signed JWT>",
	"tokenType": "Bearer",
	"expiresIn": 900,
	"refreshToken": "<signed refresh JWT>",
	"refreshTokenType": "Bearer",
	"refreshTokenExpiresIn": 604800,
	"user": {
		"id": "<account id>",
		"role": "student"
	}
}
```

Send the short-lived access token on protected requests as `Authorization: Bearer <accessToken>`. `GET /auth/me` validates it and returns the current account. When the access token expires, exchange the refresh token for a new token pair:

```http
POST /auth/refresh
Authorization: Bearer <refreshToken>
```

The refresh response has the same shape as login. Refresh tokens last 7 days, are stored in MongoDB only as SHA-256 hashes, and rotate on every successful refresh. Discard the old refresh token immediately after receiving the new pair. Reuse of a rotated token revokes the active token family and requires a new login.

Log out the current token family with:

```http
POST /auth/logout
Authorization: Bearer <refreshToken>
```

Logout returns `204 No Content`. Access tokens are stateless and may remain usable for up to 15 minutes after logout; keep that lifetime in mind when protecting sensitive operations. Student and club passwords are stored as scrypt hashes and are never included in API responses.

### Forgot and reset password

Students and clubs have separate reset endpoints:

- `POST /student/forgot-password`
- `POST /student/reset-password`
- `POST /club/forgot-password`
- `POST /club/reset-password`

Request a reset with the account email:

```json
{
	"email": "sam@example.edu"
}
```

Forgot-password requests always return `202` with the same generic message, whether or not that email exists for the requested account type. This prevents account enumeration. If the account exists, an email contains a one-time link valid for 15 minutes. Configure `SMTP_URL`, `SMTP_FROM`, and `PASSWORD_RESET_URL` in `.env`; production requires all three and requires the reset URL to use HTTPS. The frontend reset page should read the `token` and `accountType` query parameters from that URL.

Submit the token and a new password to the matching role endpoint:

```json
{
	"token": "<token from reset link>",
	"password": "a-new-password-of-at-least-8-characters"
}
```

Reset tokens are stored only as hashes and can only be used once. Resetting a password revokes all refresh-token sessions for that account; already-issued access tokens can remain valid for up to 15 minutes. In development only, when the account exists and SMTP is not configured, the response includes `developmentResetToken` and `developmentResetUrl` for local testing. These fields are never returned in production.

### Protecting feature routes

Use `authenticate` to require a valid access token, then `authorize` to restrict the account role. Apply these to every private feature route; hiding a page or button in the frontend is not authorization.

```ts
import { Router } from "express";
import { authenticate, authorize } from "../middleware/authenticate.js";

const adminRouter = Router();
adminRouter.get("/reports", authenticate, authorize("admin"), getReports);
```

Allowed roles are `student`, `club`, and `admin`. Public discovery routes are listed below; student and club routes require their matching role, and admin routes require an admin token.

## Website APIs

All paths below are mounted at the server root; there is no `/api/v1` prefix. Private calls use `Authorization: Bearer <accessToken>`.

### Public discovery

- `GET /societies?page=1&limit=20&q=robotics&category=Technical` lists approved societies. `q`, `category`, `page`, and `limit` are optional; categories are `Technical`, `Cultural`, `Sports`, `Social`, `Startup`, `Academic`, and `Other`.
- `GET /societies/:societyId` returns the complete public profile, member counts by year, and event/recruitment summary counts.
- `GET /societies/:societyId/team` returns the public team list.
- `GET /societies/:societyId/events?page=1&limit=20` lists that society's published events.
- `GET /societies/:societyId/recruitments` lists recruitments currently open to applications.
- `GET /events?period=upcoming&page=1&limit=20` lists upcoming events across approved societies. `period` can be `upcoming`, `past`, or `all`.
- `GET /events/:eventId` returns a published event and its society.
- `GET /announcements?page=1&limit=20` lists published global and approved-society announcements.
- `GET /faqs` returns the FAQ content.

### Approved club dashboard and publishing

All `/club` routes require an approved club access token and operate only on that token's society.

- `GET /club/dashboard` returns member/event/recruitment/application totals and the latest applications.
- `GET /club/profile` and `PATCH /club/profile` read or update the society name, category, descriptions, imagery URLs, website/social links, and tags.
- `PUT /club/team` replaces the team list and optionally updates `memberCountsByYear`.
- `GET /club/events`, `POST /club/events`, `PATCH /club/events/:eventId`, and `DELETE /club/events/:eventId` manage events. Event creation accepts:

```json
{
	"title": "Web Development Workshop",
	"summary": "Build and deploy your first web app",
	"description": "A hands-on workshop for campus students.",
	"startsAt": "2026-11-08T10:00:00.000Z",
	"endsAt": "2026-11-08T13:00:00.000Z",
	"location": "Main Auditorium",
	"mode": "in-person",
	"registrationUrl": "https://forms.google.com/example"
}
```

- `GET /club/recruitments`, `POST /club/recruitments`, and `PATCH /club/recruitments/:recruitmentId` manage openings. Creation accepts a title, description, `opensAt`, `closesAt`, optional `applicationUrl`, and one or more positions, each with a title and seat count.
- `GET /club/recruitments/:recruitmentId/applications` lists applicants and their student profiles.
- `PATCH /club/applications/:applicationId/status` accepts `{"status":"shortlisted","decisionNote":"..."}`. Allowed statuses are `pending`, `shortlisted`, `selected`, and `rejected`.
- `GET /club/announcements` and `POST /club/announcements` manage society announcements. A post accepts `title`, `body`, and optional `status` (`draft` or `published`).

### Student applications

Student routes require a student access token:

- `GET /student/dashboard` returns featured societies, upcoming events, open recruitments, and the signed-in student's recent application statuses.
- `GET /student/applications` lists the signed-in student's applications with recruitment, society, and current selection status.
- `POST /student/recruitments/:recruitmentId/applications` applies to an open recruitment. Send `positionTitle`, and optionally `coverLetter` and `resumeUrl`. Each student can apply once per recruitment. If the club supplied an external Google Form URL, the response includes `externalApplicationUrl` for the frontend to open after recording the application.

### Admin announcements

- `POST /admin/announcements` publishes a global announcement; requires an admin access token. Body: `{"title":"CampusConnect update","body":"...","status":"published"}`. Use `status: "draft"` to save without showing it in the public feed.

Errors use `{ "error": { "message": "..." } }`. Common statuses are `400` for invalid input, `401` for invalid credentials or tokens, `404` for missing routes/accounts, `409` for duplicate registration details, `429` for rate limiting, and `503` when an optional authentication provider is not configured. Authentication routes allow up to 20 requests per IP per 15 minutes.

`JWT_SECRET` must be at least 32 characters; production startup rejects its omission. Generate a random value with `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`. Do not commit `.env`. Set `TRUST_PROXY=true` only behind a trusted reverse proxy, and configure `CORS_ORIGINS` as a comma-separated allowlist.

The service validates environment variables at startup, redacts authorization and cookie headers from logs, returns generic messages for unexpected server errors, and closes HTTP and MongoDB connections on shutdown signals.