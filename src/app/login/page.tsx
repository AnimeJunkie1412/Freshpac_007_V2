import { LockKeyhole, LogIn } from "lucide-react";
import { loginWithPassword } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage({
  searchParams
}: {
  searchParams?: {
    error?: string;
    redirectTo?: string;
  };
}) {
  const error = searchParams?.error;
  const redirectTo = searchParams?.redirectTo || "/portal";

  return (
    <main className="min-h-screen bg-freshpac-cream px-4 py-10">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-3xl bg-freshpac-charcoal p-6 text-white shadow-panel">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-freshpac-orange">
            Freshpac
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight">
            Operations Portal
          </h1>

          <p className="mt-4 text-sm leading-6 text-white/75">
            Sign in with your Freshpac username and password.
          </p>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 font-black text-white">
              <LockKeyhole className="size-4 text-freshpac-orange" />
              Protected staff area
            </div>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Usernames are mapped to internal Freshpac login accounts.
            </p>
          </div>
        </section>

        <Card className="portal-card-safe">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Use your username, for example admin, sales or engineer.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error === "missing" ? (
              <Alert message="Enter both username and password." />
            ) : null}

            {error === "invalid" ? (
              <Alert message="Sign-in failed. Check the username and password." />
            ) : null}

            {error === "profile" ? (
              <Alert message="You signed in, but no Freshpac user profile exists for this account." />
            ) : null}

            {error === "forbidden" ? (
              <Alert message="Your role does not have access to that portal area." />
            ) : null}

            <form action={loginWithPassword} className="grid gap-5">
              <input type="hidden" name="redirectTo" value={redirectTo} />

              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-grey">
                  Username
                </span>
                <Input name="username" required placeholder="admin" autoComplete="username" />
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-grey">
                  Password
                </span>
                <Input name="password" type="password" required placeholder="Password" autoComplete="current-password" />
              </label>

              <Button type="submit">
                <LogIn className="mr-2 size-4" />
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function Alert({ message }: { message: string }) {
  return (
    <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
      {message}
    </div>
  );
}