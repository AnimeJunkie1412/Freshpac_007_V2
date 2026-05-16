# Supabase setup notes

This folder contains starter SQL for the Freshpac platform.

Recommended order:

1. Create your Supabase project.
2. Add the values to `.env.local`.
3. Use Prisma migrations during development, or run the SQL in `supabase/migrations` if you prefer Supabase SQL editor first.
4. Enable Row Level Security before real data is added.
5. Never expose `SUPABASE_SERVICE_ROLE_KEY` in browser code.

The scaffold intentionally includes placeholder policy notes rather than pretending the security model is complete. RLS policies should be written once the exact staff/customer authentication model is confirmed.
