# Freshpac plan analysis

## What is strong

The supplied plan is unusually complete for a first build. It already separates the work into public website, ordering portal, sales portal, engineers portal, desktop app, sync layer and reporting. That makes the project easier to phase safely.

The strongest decisions are:

- No payments inside the app. Sage remains responsible for invoicing and payments.
- Coffee and retail products are treated as restricted products that must be assigned to accounts.
- Customer account status, price visibility and cut-off rules are explicitly defined.
- Weekly rollover is manual, password-confirmed and non-reversible.
- Offline mode is treated as pending/safe work, not as a second uncontrolled master database.
- Audit logging is identified early rather than added later.

## Main build risks

1. **Offline desktop sync is the hardest part.** Build it after the core web data model and permissions are stable.
2. **Pricing needs careful audit history.** Customer-specific pricing, VAT and price visibility affect both trust and accounting workflows.
3. **Coffee/retail product access must be enforced server-side.** Customers must never be able to discover restricted products through the browser.
4. **Weekly rollover needs preview reports and duplicate prevention.** Treat it like a controlled operational ritual, not a button anyone can press twice.
5. **PDF generation should be centralised.** Order sheets, pick lists, engineer reports and equipment forms all need consistent Freshpac branding.

## Recommended first build slice

The first practical sprint should be:

1. Public site shell and Freshpac branding.
2. Login screen and role routing placeholders.
3. Sales Portal dashboard mock layout.
4. Customer account module shell.
5. Product module shell.
6. Prisma schema and Supabase starter migration.
7. Environment setup and Git/Vercel deployment.

This gives management something visible quickly while keeping the dangerous business logic untouched until the foundation is ready.
