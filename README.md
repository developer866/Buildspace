# Buildspace

An ever-growing full-stack playground — built with Next.js, TypeScript, and MongoDB — where new ideas get built and shipped as real features. It started as a from-scratch authentication system and keeps expanding from there.

## Why "Buildspace"?

This repo isn't named after any one feature on purpose. Auth was the starting point, not the ceiling — new ideas (a dashboard, a small tool, whatever comes next) get added here as they're built, instead of spinning up a new repo every time.

## What's inside right now

### Authentication (the foundation)
- Signup & login with hashed passwords (bcrypt)
- JWT-based sessions stored in httpOnly cookies
- Auto-login immediately after signup
- **Single active-session enforcement** — logging in from a new browser invalidates any previous session
- Protected routes via middleware + server-side session verification
- Logout that clears both the cookie and the server-side session record

### Observability
- A `withLogging` wrapper that captures request/response data for any route it wraps
- MongoDB-backed log storage with automatic 30-day expiry (TTL index) so logs don't grow forever
- An admin-only `/logs` dashboard — method, path, status, request body, and response, in a table

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Database | MongoDB + Mongoose |
| Auth | `jsonwebtoken` (Node routes) + `jose` (Edge middleware), `bcryptjs` |
| Styling | Tailwind CSS |

## Why build auth manually instead of using NextAuth?

This project deliberately implements authentication from scratch — signup, JWT signing/verification, cookie handling, session invalidation — instead of reaching for a library. The point was understanding what's actually happening underneath: how a JWT gets verified, why `httpOnly` cookies matter, how single-session enforcement works against a database. NextAuth (or similar) is a completely reasonable choice for production work — this repo just isn't optimized for "fastest path to shipped." It's optimized for understanding every layer.

## Getting started

### Prerequisites
- Node.js 18+
- A MongoDB connection string (Atlas or local)

### Setup

```bash
git clone https://github.com/<your-username>/buildspace.git
cd buildspace
npm install
```

Create a `.env.local` file in the project root:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
```

Run the dev server:

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Project structure (auth module)

```
app/
  api/auth/
    signup/route.ts
    login/route.ts
    logout/route.ts
    me/route.ts
  profile/page.tsx
  application/page.tsx
  logs/page.tsx
components/
  SignForm.tsx
  LoginForm.tsx
  Navbar.tsx
  LogoutButton.tsx
context/
  AuthContext.tsx
lib/
  mongodb.ts
  auth.ts
  withLogging.ts
  requireAuth.ts
models/
  User.ts
  Log.ts
middleware.ts
```

## How the auth system works, briefly

1. **Signup/Login** — password is hashed with bcrypt; on success, a JWT (`{ userId, sessionId }`) is signed and set as an httpOnly cookie. `sessionId` is also saved on the user document in MongoDB.
2. **Every protected request** — middleware checks the JWT is validly signed (fast, Edge-safe check). Deeper server logic (`getCurrentUser()`) additionally confirms the token's `sessionId` still matches what's stored on the user — this is what enforces single-device login.
3. **Logging in elsewhere** — overwrites `sessionId` in the database. The old browser's token is still validly signed, but its `sessionId` no longer matches, so `getCurrentUser()` treats it as logged out on the next check.
4. **Logout** — clears the cookie client-side and resets `sessionId` to `null` server-side.

## Roadmap

This repo is meant to keep growing. New features land here as they're built rather than being split into separate repos, at least while the project stays small enough to make sense as one app. Check commit history for what's currently in progress.

## License

MIT