# Freshpac B2B Operations Platform

Starter framework for the Freshpac public website, customer ordering portal, Sales Portal, Engineers Portal and future desktop offline-safe app.

This is a **framework**, not a finished production system. It gives you a clean folder/file base to open in VS Code, connect to Supabase and push to GitHub/Vercel.

## What is included

- Next.js app router structure
- TypeScript configuration
- Tailwind CSS Freshpac theme
- Public website pages
- Login and role-routing placeholder
- Sales Portal dashboard placeholder
- Customer account module placeholder
- Orders, products, call list, reports and sync conflict placeholders
- Ordering Portal placeholder
- Engineers Portal placeholder
- Desktop offline-safe planning page
- Prisma starter schema
- Supabase starter SQL migration
- Environment variable example
- Screenshot/design review notes
- Reference copies of supplied screenshots and forms

## Design direction

The UI aims to be professional and semi-compact:

- Warm cream background
- White cards and panels
- Charcoal navigation and headings
- Freshpac orange for primary actions and highlights
- Compact staff tables
- Clear warning states for on-hold, prepayment and sync conflicts
- Less dense customer-facing screens

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Connect Supabase

1. Open your Supabase project.
2. Copy your project URL and anon key into `.env.local`.
3. Copy your database connection string into `DATABASE_URL` and `DIRECT_URL`.
4. Run Prisma generation:

```bash
npm run prisma:generate
```

For local migration development:

```bash
npm run prisma:migrate -- --name init
```

Or run the SQL in `supabase/migrations/0001_initial_schema.sql` from the Supabase SQL editor.

## Connect GitHub

```bash
git init
git add .
git commit -m "Initial Freshpac platform framework"
git branch -M main
git remote add origin YOUR_REPO_URL
git push -u origin main
```

## Connect Vercel

1. Import the GitHub repository into Vercel.
2. Framework preset: Next.js.
3. Add environment variables from `.env.example` in Vercel project settings.
4. Deploy.

## Important safety notes

- Never commit `.env.local`.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in browser code.
- Do not add real customer data until RLS policies and permissions are implemented.
- Do not build destructive actions until audit logging and role checks are in place.
- Offline desktop actions must be queued and reviewed, not silently pushed over cloud data.

## Suggested next development step

Start with the Sales Portal customer account module because it gives the database shape, internal UI density and real workflow foundation needed by orders, call lists, engineering and reports.
