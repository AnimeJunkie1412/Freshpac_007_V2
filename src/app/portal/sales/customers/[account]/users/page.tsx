import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, KeyRound, ShieldCheck, UserPlus, UsersRound } from "lucide-react";
import {
  createCustomerLogin,
  disableCustomerLogin,
  enableCustomerLogin,
  resetCustomerLoginPassword
} from "@/app/portal/sales/customers/[account]/users/actions";
import { PortalShell } from "@/components/layout/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  getCustomerUserRoleLabel,
  getCustomerUserRoleTone,
  getCustomerWithUsersFromDb
} from "@/lib/sales/customer-users-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CustomerUsersPage({
  params,
  searchParams
}: {
  params: Promise<{
    account: string;
  }>;
  searchParams?: {
    created?: string;
    enabled?: string;
    disabled?: string;
    reset?: string;
    error?: string;
  };
}) {
  const { account } = await params;
  const decodedAccountNumber = decodeURIComponent(account);
  const customer = await getCustomerWithUsersFromDb(decodedAccountNumber);

  if (!customer) {
    notFound();
  }

  const customerHref = `/portal/sales/customers/${encodeURIComponent(customer.accountNumber)}`;
  const activeUsers = customer.users.filter((user) => user.active);
  const disabledUsers = customer.users.filter((user) => !user.active);
  const errorMessage = getCustomerLoginErrorMessage(searchParams?.error);

  return (
    <PortalShell
      title="Customer logins"
      subtitle={`${customer.accountNumber} · ${customer.siteName}`}
      activeHref="/portal/sales/customers"
    >
      <div className="mb-3 grid gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <Link
          href={customerHref}
          className="inline-flex h-8 w-fit items-center rounded-lg border border-freshpac-panel bg-white px-2.5 text-xs font-black text-freshpac-charcoal hover:border-freshpac-orange hover:bg-orange-50"
        >
          <ArrowLeft className="mr-1.5 size-3.5" />
          Back to customer
        </Link>

        <Link
          href="/portal/settings/users"
          className="inline-flex h-8 w-fit items-center rounded-lg border border-freshpac-panel bg-white px-2.5 text-xs font-black text-freshpac-charcoal hover:border-freshpac-orange hover:bg-orange-50"
        >
          <UsersRound className="mr-1.5 size-3.5" />
          All users
        </Link>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1fr_380px]">
        <Card className="portal-card-safe">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Existing customer logins</CardTitle>
                <CardDescription>
                  Parent and child logins linked directly to this customer account.
                </CardDescription>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <Badge tone="success">{activeUsers.length} active</Badge>
                <Badge tone={disabledUsers.length ? "warning" : "neutral"}>
                  {disabledUsers.length} disabled
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {searchParams?.created ? (
              <StatusNotice tone="success" text="Customer login created successfully." />
            ) : null}

            {searchParams?.enabled ? (
              <StatusNotice tone="success" text="Customer login enabled successfully." />
            ) : null}

            {searchParams?.disabled ? (
              <StatusNotice tone="warning" text="Customer login disabled successfully." />
            ) : null}

            {searchParams?.reset ? (
              <StatusNotice tone="success" text="Customer password reset successfully." />
            ) : null}

            {errorMessage ? (
              <StatusNotice tone="danger" text={errorMessage} />
            ) : null}

            <div className="grid gap-3 md:hidden">
              {customer.users.map((user) => (
                <CustomerUserCard
                  key={user.id}
                  user={user}
                  customerAccountId={customer.id}
                  accountNumber={customer.accountNumber}
                />
              ))}

              {!customer.users.length ? (
                <div className="rounded-xl border border-freshpac-panel bg-white p-4 text-sm text-freshpac-grey">
                  No customer logins have been created for this account yet.
                </div>
              ) : null}
            </div>

            <div className="hidden md:block">
              <div className="portal-scroll-panel">
                <table className="fp-compact-table min-w-full border-collapse">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Enable</th>
                      <th>Reset password</th>
                    </tr>
                  </thead>

                  <tbody>
                    {customer.users.map((user) => (
                      <tr key={user.id}>
                        <td className="font-black">{user.fullName}</td>
                        <td>{user.email}</td>
                        <td>
                          <Badge tone={getCustomerUserRoleTone(user.role)}>
                            {getCustomerUserRoleLabel(user.role)}
                          </Badge>
                        </td>
                        <td>
                          <Badge tone={user.active ? "success" : "danger"}>
                            {user.active ? "Active" : "Disabled"}
                          </Badge>
                        </td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>
                          {user.active ? (
                            <form action={disableCustomerLogin}>
                              <input type="hidden" name="accountNumber" value={customer.accountNumber} />
                              <input type="hidden" name="customerAccountId" value={customer.id} />
                              <input type="hidden" name="userId" value={user.id} />
                              <Button type="submit" size="sm" variant="secondary">
                                Disable
                              </Button>
                            </form>
                          ) : (
                            <form action={enableCustomerLogin}>
                              <input type="hidden" name="accountNumber" value={customer.accountNumber} />
                              <input type="hidden" name="customerAccountId" value={customer.id} />
                              <input type="hidden" name="userId" value={user.id} />
                              <Button type="submit" size="sm">
                                Enable
                              </Button>
                            </form>
                          )}
                        </td>
                        <td>
                          {user.authUserId ? (
                            <form action={resetCustomerLoginPassword} className="flex min-w-[210px] items-center gap-2">
                              <input type="hidden" name="accountNumber" value={customer.accountNumber} />
                              <input type="hidden" name="customerAccountId" value={customer.id} />
                              <input type="hidden" name="userId" value={user.id} />
                              <input type="hidden" name="authUserId" value={user.authUserId} />
                              <Input
                                name="password"
                                type="password"
                                required
                                minLength={8}
                                placeholder="New password"
                                className="h-8 min-w-0 text-xs"
                              />
                              <Button type="submit" size="sm" variant="secondary">
                                Reset
                              </Button>
                            </form>
                          ) : (
                            <Badge tone="warning">No auth link</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {!customer.users.length ? (
                  <div className="p-6 text-sm text-freshpac-grey">
                    No customer logins have been created for this account yet.
                  </div>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid content-start gap-3">
          <Card className="portal-card-safe">
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserPlus className="size-4 text-freshpac-orange" />
                <div>
                  <CardTitle>Create customer login</CardTitle>
                  <CardDescription>
                    Creates the Supabase login and links it to this customer.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <form action={createCustomerLogin} className="grid gap-3">
                <input type="hidden" name="accountNumber" value={customer.accountNumber} />
                <input type="hidden" name="customerAccountId" value={customer.id} />

                <FormField
                  label="Full name"
                  name="fullName"
                  placeholder="Example: Test Customer"
                />

                <FormField
                  label="Email login"
                  name="email"
                  type="email"
                  placeholder="testcustomer@freshpac.test"
                />

                <FormField
                  label="Temporary password"
                  name="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  minLength={8}
                />

                <label className="block">
                  <span className="text-[10px] font-black uppercase tracking-[0.12em] text-freshpac-grey">
                    Role
                  </span>
                  <select
                    name="role"
                    defaultValue="PARENT_USER"
                    className="mt-1 h-9 w-full rounded-xl border border-freshpac-panel bg-white px-3 text-sm font-semibold text-freshpac-charcoal outline-none transition focus:border-freshpac-orange focus:ring-4 focus:ring-orange-100"
                  >
                    <option value="PARENT_USER">Parent Customer</option>
                    <option value="CHILD_USER">Child Customer</option>
                  </select>
                </label>

                <label className="flex items-center gap-2 rounded-xl border border-freshpac-panel bg-freshpac-cream/60 p-3">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked
                    className="size-4 accent-freshpac-orange"
                  />
                  <span className="text-sm font-bold text-freshpac-charcoal">
                    User is active
                  </span>
                </label>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold leading-5 text-amber-900">
                  Passwords must be at least 8 characters. Parent users should normally be for the main account holder. Child users are best for branch/site-level access.
                </div>

                <Button type="submit">
                  <ShieldCheck className="mr-2 size-4" />
                  Create login
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="portal-card-safe">
            <CardHeader>
              <CardTitle>Customer account</CardTitle>
              <CardDescription>
                Login users created here are linked to this customer only.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-2 text-sm font-semibold text-freshpac-charcoal">
              <p>
                <span className="text-freshpac-grey">Account:</span>{" "}
                {customer.accountNumber}
              </p>
              <p>
                <span className="text-freshpac-grey">Site:</span>{" "}
                {customer.siteName}
              </p>
              <p>
                <span className="text-freshpac-grey">Status:</span>{" "}
                {customer.status.replace(/_/g, " ")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalShell>
  );
}

function CustomerUserCard({
  user,
  customerAccountId,
  accountNumber
}: {
  user: {
    id: string;
    authUserId: string | null;
    fullName: string;
    email: string;
    role: string;
    active: boolean;
    createdAt: Date;
  };
  customerAccountId: string;
  accountNumber: string;
}) {
  return (
    <div className="rounded-2xl border border-freshpac-panel bg-white p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-black text-freshpac-charcoal">{user.fullName}</p>
          <p className="truncate text-xs font-semibold text-freshpac-grey">{user.email}</p>
        </div>

        <Badge tone={user.active ? "success" : "danger"}>
          {user.active ? "Active" : "Disabled"}
        </Badge>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <Badge tone={getCustomerUserRoleTone(user.role)}>
          {getCustomerUserRoleLabel(user.role)}
        </Badge>
        <Badge>{formatDate(user.createdAt)}</Badge>
      </div>

      <div className="mt-3 grid gap-2">
        {user.active ? (
          <form action={disableCustomerLogin}>
            <input type="hidden" name="accountNumber" value={accountNumber} />
            <input type="hidden" name="customerAccountId" value={customerAccountId} />
            <input type="hidden" name="userId" value={user.id} />
            <Button type="submit" size="sm" variant="secondary" className="w-full">
              Disable login
            </Button>
          </form>
        ) : (
          <form action={enableCustomerLogin}>
            <input type="hidden" name="accountNumber" value={accountNumber} />
            <input type="hidden" name="customerAccountId" value={customerAccountId} />
            <input type="hidden" name="userId" value={user.id} />
            <Button type="submit" size="sm" className="w-full">
              Enable login
            </Button>
          </form>
        )}

        {user.authUserId ? (
          <form action={resetCustomerLoginPassword} className="grid grid-cols-[1fr_auto] gap-2">
            <input type="hidden" name="accountNumber" value={accountNumber} />
            <input type="hidden" name="customerAccountId" value={customerAccountId} />
            <input type="hidden" name="userId" value={user.id} />
            <input type="hidden" name="authUserId" value={user.authUserId} />
            <label className="relative block min-w-0">
              <KeyRound className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-freshpac-grey" />
              <Input
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="New password"
                className="h-8 pl-7 text-xs"
              />
            </label>
            <Button type="submit" size="sm" variant="secondary">
              Reset
            </Button>
          </form>
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-2 text-xs font-bold text-amber-900">
            This profile has no Supabase auth link, so the password cannot be reset here.
          </div>
        )}
      </div>
    </div>
  );
}

function FormField({
  label,
  name,
  placeholder,
  type = "text",
  minLength
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
  minLength?: number;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-black uppercase tracking-[0.12em] text-freshpac-grey">
        {label}
      </span>
      <Input
        className="mt-1"
        name={name}
        type={type}
        placeholder={placeholder}
        minLength={minLength}
        required
      />
    </label>
  );
}

function StatusNotice({
  text,
  tone
}: {
  text: string;
  tone: "success" | "warning" | "danger";
}) {
  const className =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-red-200 bg-red-50 text-red-800";

  return (
    <div className={`mb-3 rounded-2xl border p-3 text-sm font-bold ${className}`}>
      {text}
    </div>
  );
}

function getCustomerLoginErrorMessage(error?: string) {
  if (error === "password") {
    return "Password must be at least 8 characters.";
  }

  if (error === "exists") {
    return "A user profile already exists for that email address.";
  }

  if (error === "auth") {
    return "Supabase could not create that login. Check the email and password, then try again.";
  }

  if (error === "customer") {
    return "Customer account could not be verified. Go back to the customer account and try again.";
  }

  if (error === "user") {
    return "That login could not be verified against this customer account.";
  }

  if (error === "reset") {
    return "Supabase could not reset that password. Try again or check the Supabase user record.";
  }

  return null;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}