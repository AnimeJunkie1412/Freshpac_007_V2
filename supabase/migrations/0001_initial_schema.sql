create extension if not exists pgcrypto;

create type user_role as enum ('MASTER_USER', 'ADMIN_USER', 'CHIEF_ENGINEER', 'ENGINEER', 'PARENT_USER', 'CHILD_USER');
create type account_status as enum ('ACTIVE', 'ON_HOLD', 'ACTIVE_PREPAYMENT', 'INACTIVE', 'ARCHIVED', 'MARKED_FOR_DELETION');
create type product_type as enum ('NORMAL', 'COFFEE', 'RETAIL');
create type vat_code as enum ('T0', 'T1');
create type order_status as enum ('DRAFT_BASKET', 'SUBMITTED', 'AWAITING_PAYMENT', 'PAID_SUBMITTED', 'PROCESSED', 'CANCELLED');
create type job_status as enum ('NEW', 'ASSIGNED', 'IN_PROGRESS', 'FOLLOW_UP_REQUIRED', 'COMPLETED', 'COMPLETED_INVOICED', 'CANCELLED');

create table if not exists user_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  email text not null unique,
  full_name text not null,
  role user_role not null,
  active boolean not null default true,
  customer_account_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists customer_accounts (
  id uuid primary key default gen_random_uuid(),
  account_number text not null unique,
  site_name text not null,
  parent_account_id uuid references customer_accounts(id),
  invoice_address text not null,
  delivery_address text not null,
  alternative_addresses jsonb,
  contact_names text[] default array[]::text[],
  contact_phones text[] default array[]::text[],
  contact_emails text[] default array[]::text[],
  delivery_day text,
  delivery_driver text,
  courier boolean not null default false,
  contact_frequency_weeks integer not null default 1,
  assigned_sales_rep text,
  account_opened_at timestamptz,
  price_visibility boolean not null default true,
  status account_status not null default 'ACTIVE',
  on_call_list boolean not null default true,
  special_instructions text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table user_profiles add constraint fk_user_customer foreign key (customer_account_id) references customer_accounts(id);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  product_type product_type not null default 'NORMAL',
  category text,
  product_group text,
  pack_size text,
  price_ex_vat_pence integer not null,
  vat_code vat_code not null default 'T1',
  vat_rate numeric(5,2) not null default 20.00,
  active boolean not null default true,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists customer_product_access (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customer_accounts(id),
  product_id uuid not null references products(id),
  created_at timestamptz not null default now(),
  unique(customer_id, product_id)
);

create table if not exists customer_prices (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customer_accounts(id),
  product_id uuid not null references products(id),
  price_ex_vat_pence integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(customer_id, product_id)
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  reference text unique,
  temporary_reference text,
  customer_id uuid not null references customer_accounts(id),
  status order_status not null default 'DRAFT_BASKET',
  delivery_day text,
  delivery_method text,
  customer_notes text,
  internal_notes text,
  total_inc_vat_pence integer not null default 0,
  ordered_by_freshpac boolean not null default false,
  price_visibility_at_order boolean not null default true,
  edited_by_freshpac boolean not null default false,
  edit_note text,
  created_at timestamptz not null default now(),
  submitted_at timestamptz,
  processed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists order_lines (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity integer not null,
  source text not null default 'CUSTOMER_ADDED',
  price_ex_vat_pence integer not null,
  vat_pence integer not null,
  price_inc_vat_pence integer not null,
  locked boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists equipment (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customer_accounts(id),
  description text not null,
  make_model text,
  serial_number text unique,
  status text not null default 'owned',
  installed_at timestamptz,
  last_service_at timestamptz,
  rental_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists engineer_jobs (
  id uuid primary key default gen_random_uuid(),
  reference text unique,
  customer_id uuid not null references customer_accounts(id),
  job_type text not null,
  status job_status not null default 'NEW',
  reported_fault text,
  chargeable boolean not null default false,
  chargeable_note text,
  sage_invoice_no text,
  assigned_engineer_id uuid references user_profiles(id),
  created_by_user_id uuid references user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists trade_account_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text not null,
  business_name text not null,
  business_address text not null,
  relation_to_company text not null,
  notes text,
  status text not null default 'new',
  assigned_sales_rep text,
  customer_id uuid references customer_accounts(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists approved_devices (
  id uuid primary key default gen_random_uuid(),
  device_name text not null,
  device_key_hash text not null unique,
  approved_by text,
  approved_at timestamptz not null default now(),
  revoked_at timestamptz,
  last_sync_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists offline_action_queue (
  id uuid primary key default gen_random_uuid(),
  device_id uuid references approved_devices(id),
  action_type text not null,
  entity_type text not null,
  entity_id text,
  temporary_reference text,
  payload jsonb not null,
  last_known_version text,
  status text not null default 'PENDING',
  error_message text,
  created_at timestamptz not null default now(),
  synced_at timestamptz
);

create table if not exists sync_conflicts (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id text,
  offline_payload jsonb not null,
  cloud_payload jsonb,
  status text not null default 'NEEDS_REVIEW',
  decision text,
  decided_by text,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  action_type text not null,
  entity_type text not null,
  entity_id text,
  user_id uuid references user_profiles(id),
  before_value jsonb,
  after_value jsonb,
  reason text,
  created_at timestamptz not null default now()
);

alter table user_profiles enable row level security;
alter table customer_accounts enable row level security;
alter table products enable row level security;
alter table customer_product_access enable row level security;
alter table customer_prices enable row level security;
alter table orders enable row level security;
alter table order_lines enable row level security;
alter table equipment enable row level security;
alter table engineer_jobs enable row level security;
alter table trade_account_requests enable row level security;
alter table approved_devices enable row level security;
alter table offline_action_queue enable row level security;
alter table sync_conflicts enable row level security;
alter table audit_logs enable row level security;

-- RLS policies are intentionally not opened here.
-- Add role-aware policies before adding production/customer data.
