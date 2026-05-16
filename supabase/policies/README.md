# RLS policy plan

Create policies only after the exact Supabase Auth setup is confirmed.

Minimum intended behaviour:

- Master/Admin can access Sales Portal data.
- Master/Admin can access Engineers Portal data.
- Chief Engineer and Engineer can access engineering data only.
- Parent/Child users can only access their own customer account, assigned products, basket and past orders.
- Coffee and retail products require `customer_product_access`.
- Service role is server-only and used only by trusted API routes/actions.
- All important writes create `audit_logs` rows.

Do not trust frontend checks alone.
