
# Snack Counter Automation

A backend application that automates office snack counter refill requests, volunteer assignments, purchase tracking, receipt submission, and HR reimbursement review.

## Tech Stack

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- Prisma ORM
- Zod
- Vitest
- Supertest

## Features

- Office management
- Volunteer management
- Refill request creation and tracking
- Volunteer request claiming
- Atomic claim protection to prevent duplicate claims
- 12-hour claim expiry check
- Purchase amount and receipt reference tracking
- HR reimbursement approval and rejection workflow
- Office-specific currency and monthly budgets

## Project Structure

```text
src/
  config/
  modules/
    offices/
    volunteers/
    refill-requests/
  app.ts
  server.ts

prisma/
  migrations/
  schema.prisma
  seed.ts

prisma.config.ts
```

## Installation

Clone the repository:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd snack-counter-automation
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/snack_automation?schema=public"
```

## Database Setup

Run migrations:

```bash
npx prisma migrate dev
npx prisma generate
```

Seed sample data:

```bash
npx tsx prisma/seed.ts
```

## Run the Application

Development:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /health | Health check |
| GET | /offices | Get all offices |
| GET | /offices/:id | Get office |
| GET | /volunteers | Get all volunteers |
| GET | /volunteers/:id | Get volunteer |
| GET | /offices/:officeId/volunteers | Get office volunteers |
| GET | /refill-requests | Get all requests |
| GET | /refill-requests/:id | Get request |
| POST | /refill-requests | Create request |
| POST | /refill-requests/:id/claim | Claim request |
| POST | /refill-requests/:id/purchase | Record purchase |
| POST | /refill-requests/:id/receipt | Submit receipt |
| POST | /refill-requests/:id/hr-review | HR review |

## Sample Offices

- Oslo, Norway — NOK 6,000 monthly budget
- Bengaluru, India — INR 15,000 monthly budget

## Environment Variables

Never commit `.env` or database credentials.

## Future Improvements

- Teams chat notifications
- HR integration and webhooks
- Automated background expiry scheduler
- Role-based authentication
- Budget enforcement and financial ledger
- Automated test coverage
