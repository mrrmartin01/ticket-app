<p align="center">
  <strong>Ticket App</strong> — backend API for creating events, issuing tickets, booking seats, and processing payments.
</p>

<p align="center">
  <a href="#api-documentation">Swagger Docs</a> •
  <a href="#setup-instructions">Setup</a> •
  <a href="#payment-integration">Payments</a> •
  <a href="#deployment">Deployment</a>
</p>

## Project Overview

Ticket App is a NestJS backend that powers event ticketing:
- Users browse events, book tickets, and pay securely via Paystack.
- Admins manage venues, events, tickets, and oversee bookings/payments.

**Problem it solves**: streamlines end‑to‑end ticketing (catalog → booking → payment → verification) with clear roles, auditability, and reliable state transitions.

## Tech Stack and Dependencies

- **Backend**: NestJS 11 (TypeScript)
- **ORM/DB**: Prisma 6 + PostgreSQL (`pg`)
- **Auth**: JWT (`@nestjs/jwt`, `passport-jwt`), guards for admin access
- **Payments**: Paystack (`paystack-api`)
- **Config/Validation**: `@nestjs/config`, `class-validator`, `class-transformer`
- **Docs**: `@nestjs/swagger`, `swagger-ui-express` (served at `/api/docs`)
- **Testing**: Jest, Supertest
- **Runtime**: Node.js 22+, Yarn
- **Optional infra**: Docker Compose example (Postgres + app) below

## System Architecture

High-level modules and interactions:
- `auth`: sign up/in, JWT issuance, guards/strategies
- `users`: user profile/admin operations
- `venue`, `event`, `ticket`: domain CRUD and validation
- `booking`: create bookings, manage lifecycle
- `payment`: initialize charge, verify, webhook handling
- `prisma`: database access via `PrismaService`

Request flow (typical booking): Client → `booking` → `payment.initialize` → redirect to Paystack → Paystack callback/webhook → `payment.verify` → `booking` status update → response.

Diagrams:
- Sequence diagram: add `docs/flow-sequence.png` and reference it here.
- ERD: export from Prisma to `docs/erd.png` and link it here.

## Setup Instructions

### 1) Clone and install

```bash
git clone https://github.com/mrrmartin01/ticket-app
cd ticket-app
yarn install
```

### 2) Environment variables

Copy and edit `.env` (see full list in Environment Variables section):

```bash
cp .env.example .env
```

Minimal required for local dev:

```dotenv
NODE_ENV=development
PORT=3000

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ticket_app?schema=public"

JWT_SECRET=replace-with-strong-secret
JWT_EXPIRES_IN=1d

PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxx
PAYSTACK_BASE_URL=https://exampleAtYourDomain.com
# Optional: If you prefer a separate webhook key, keep using SECRET_KEY; Paystack uses x-paystack-signature derived from the same secret.
```

### 3) Database setup (Prisma + Postgres)

Run migrations to create schema:

```bash
yarn prisma migrate dev
```

Optional (no-op if you always use migrate):

```bash
yarn prisma db push
```

Seeding (if/when a seed script is added):

```bash
yarn prisma db seed
```

### 4) Start servers

```bash
# development (hot reload)
yarn start:dev

# production build + run
yarn build
yarn start:prod
```

## Optional: Docker (Postgres + App)

Create `docker-compose.yml` in the project root:

```yaml
version: '3.9'
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ticket_app
    ports:
      - "5432:5432"
    volumes:
      - dbdata:/var/lib/postgresql/data

  api:
    build: .
    command: yarn start:dev
    environment:
      NODE_ENV: development
      PORT: 3000
      DATABASE_URL: postgresql://postgres:postgres@db:5432/ticket_app?schema=public
      JWT_SECRET: change-me
      JWT_EXPIRES_IN: 1d
      PAYSTACK_PUBLIC_KEY: pk_test_xxx
      PAYSTACK_SECRET_KEY: sk_test_xxx
    ports:
      - "3000:3000"
    depends_on:
      - db

volumes:
  dbdata:
```

Then:

```bash
docker compose up -d --build
```

## Testing

```bash
yarn test        # unit tests
yarn test:e2e    # e2e tests
yarn test:cov    # coverage
```

- Mock external calls (Paystack) by stubbing the client or HTTP layer.
- Prefer factory/fixtures for entities; use a separate test DB.
- Seed test data by running a dedicated test seed or factory bootstrap.

## Environment Variables

Required variables and purpose:

- `PORT`: API port
- `DATABASE_URL`: Prisma connection string to Postgres
- `JWT_SECRET`: HMAC secret for JWT signing
- `JWT_EXPIRES_IN`: JWT expiration (e.g. `1d`, `3600s`)
- `PAYSTACK_PUBLIC_KEY`: Paystack public key (test: `pk_test_...`)
- `PAYSTACK_SECRET_KEY`: Paystack secret key (test: `sk_test_...`)

Example `.env` file:

```dotenv
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ticket_app?schema=public
JWT_SECRET=replace-with-strong-secret
JWT_EXPIRES_IN=1d
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxx
PAYSTACK_BASE_URL=https://exampleAtYourDomain.com
```

## Payment Integration

Flow (Paystack):
1. Initialize transaction on backend (`payment` module) with amount, email, reference.
2. Return authorization URL to client; client redirects user to Paystack.
3. On success/cancel, Paystack redirects to your callback URL; backend also receives a webhook.
4. Verify transaction on backend (server-to-server) and update booking status.

Test/Sandbox:
- Use test keys (`pk_test_*`, `sk_test_*`).
- Use Paystack test cards from their docs.

Webhook verification:
- Paystack sends `x-paystack-signature` (HMAC SHA512 of raw request body using your secret key).
- Compute HMAC (hex) over the raw body with `PAYSTACK_SECRET_KEY` and compare to header. Reject if mismatch.

Reference guidelines:
- Make references unique and idempotent, e.g. `booking_<bookingId>_<timestamp>`.
- Store reference on your `booking`/`payment` record and only accept a reference once.

## Roles and Permissions

Roles:
- `USER`: can register/login, view events, create bookings, pay.
- `ADMIN`: full CRUD for venues, events, tickets; view/resolve payments and bookings.

AuthN/Z:
- JWT-based authentication (Bearer token).
- Guards enforce authentication; admin guard protects admin-only routes.

## Booking Lifecycle

Statuses:
- `pending`: booking created, awaiting payment.
- `confirmed`: payment verified; inventory decremented and booking finalized.
- `failed`: payment failed/expired or verification invalid.

Transitions:
- Create booking → `pending`.
- On successful Paystack verify/webhook → `confirmed`.
- On failure/timeout/verification mismatch → `failed`.

Manual operations:
- Admin can re-verify a reference, retry verification, or mark a disputed booking for review.

## API Documentation

- Swagger is served at: `http://localhost:3000/api/docs`
- Explore endpoints for `auth`, `users`, `event`, `ticket`, `booking`, `payment`, `venue`.
- Postman collection available at [Postman Collection](docs/postman_collection.json) (import into Postman).
  Add this evironment for easy testing: {{apiURL}} = http://localhost:3000.

Example: create booking

```http
POST /booking
Cookie: access_token=<access_token>; refresh_token=<refresh_token>
Content-Type: application/json

{
  "eventId": "<uuid>",
  "ticketTypeId": "<uuid>",
  "quantity": 2
}
```

Error response format example:

```json
{
  "statusCode": 400,
  "message": ["quantity must be a positive number"],
  "error": "Bad Request"
}
```

## Database Schema

- Managed with Prisma; see `prisma/schema.prisma` and `prisma/migrations/`.
- Use `yarn prisma migrate dev` for local changes; `yarn prisma migrate deploy` in CI/CD.
- Rollback by creating a new corrective migration; avoid force-reset in production.
- Seed strategy: add a `prisma/seed.ts` and wire `package.json` → `prisma.db.seed`.

## Deployment

Environment setup:
- Provide `.env` with production credentials and strong secrets.
- Run `yarn build` and `yarn start:prod` behind a reverse proxy (HTTPS).

CI/CD (example):
- On push to `main`: install deps, run tests, `prisma migrate deploy`, build, deploy container.

Health & monitoring:
- Expose a health endpoint (e.g. `/health`) and wire to your load balancer checks.

## Monitoring and Logging

- Centralize logs (e.g., Winston + JSON) and forward to your log aggregator.
- Track errors and failed transactions; alert on verification failures.
- Optional integrations: Sentry, Datadog, Grafana/Loki, Prometheus.

## Security Practices

- Enforce HTTPS and secure headers (HSTS, no sniff, XSS protection).
- Do not log PII/secrets; rotate `JWT_SECRET` and API keys.
- Store secrets via your cloud secret manager rather than plaintext.

## Contributing and License

Development hygiene:
- Lint & format: `yarn lint` and `yarn format`.
- Branch naming: `feature/…`, `fix/…`, `chore/…`.
- Conventional commits recommended.

License: UNLICENSED (see `package.json`). Provide contact/maintainer details in your fork as needed.

## Additional Recommendations

- Add screenshots or a short demo GIF of core flows.
- Add build/test/coverage badges.
- Keep a `CHANGELOG.md` or GitHub Releases.


