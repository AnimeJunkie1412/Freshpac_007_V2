import { MarketingShell } from "@/components/layout/marketing-shell";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { roleLabels } from "@/lib/auth/roles";

export default function LoginPage() {
  return (
    <MarketingShell>
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Supabase Auth will be connected here. Portal routing is driven by role after sign-in.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4">
              <label className="grid gap-2 text-sm font-semibold text-freshpac-charcoal">
                Email address
                <Input type="email" placeholder="you@example.com" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-freshpac-charcoal">
                Password
                <Input type="password" placeholder="Password" />
              </label>
              <Button type="button">Login placeholder</Button>
              <LinkButton href="/portal" variant="secondary">Open portal demo</LinkButton>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Role routing map</CardTitle>
            <CardDescription>These roles match the supplied platform plan.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(roleLabels).map(([key, label]) => (
                <div key={key} className="rounded-2xl border border-freshpac-panel bg-[#fbf8f2] p-4">
                  <p className="font-bold text-freshpac-charcoal">{label}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.12em] text-freshpac-grey">{key}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </MarketingShell>
  );
}
