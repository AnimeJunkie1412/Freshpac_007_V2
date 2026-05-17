import { CheckCircle2, Send } from "lucide-react";
import { createTradeAccountRequest } from "@/app/trade-account/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";

export default function TradeAccountPage({
  searchParams
}: {
  searchParams?: {
    status?: string;
  };
}) {
  const status = searchParams?.status;

  return (
    <main className="min-h-screen bg-freshpac-cream px-4 py-10">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-3xl bg-freshpac-charcoal p-6 text-white shadow-panel">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-freshpac-orange">
            Freshpac Teas & Coffees
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight">
            Apply for a trade account
          </h1>

          <p className="mt-4 text-sm leading-6 text-white/75">
            Tell us about your business and the Freshpac team will review your request.
            This does not create an account automatically. We will contact you before
            anything is set up.
          </p>

          <div className="mt-6 grid gap-3">
            <InfoBox title="For cafés, hospitality and catering" />
            <InfoBox title="Coffee, tea, hot chocolate and sundries" />
            <InfoBox title="Machine and equipment discussions available" />
          </div>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Trade account request</CardTitle>
            <CardDescription>
              Submit your details and Freshpac will review the enquiry.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {status === "success" ? (
              <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                <div className="flex items-center gap-2 font-black">
                  <CheckCircle2 className="size-4" />
                  Request submitted
                </div>
                <p className="mt-2">
                  Thank you. Your request has been sent to the Freshpac team.
                </p>
              </div>
            ) : null}

            {status === "invalid" ? (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                Please check all required fields and enter a valid email address.
              </div>
            ) : null}

            <form action={createTradeAccountRequest} className="grid gap-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Your name">
                  <Input name="name" required placeholder="Your name" />
                </Field>

                <Field label="Phone number">
                  <Input name="phone" required placeholder="Phone number" />
                </Field>
              </div>

              <Field label="Email address">
                <Input name="email" type="email" required placeholder="you@example.co.uk" />
              </Field>

              <Field label="Business name">
                <Input name="businessName" required placeholder="Business name" />
              </Field>

              <Field label="Business address">
                <Textarea name="businessAddress" required placeholder="Business address" />
              </Field>

              <Field label="Your relationship to the company">
                <Input name="relationToCompany" required placeholder="Owner, manager, buyer..." />
              </Field>

              <Field label="Tell us what you are interested in">
                <Textarea
                  name="notes"
                  placeholder="Coffee, tea, machines, retail coffee, cups, delivery area, current supplier..."
                />
              </Field>

              <div className="flex justify-end">
                <Button type="submit">
                  <Send className="mr-2 size-4" />
                  Submit request
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-grey">
        {label}
      </span>
      {children}
    </label>
  );
}

function InfoBox({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm font-semibold text-white/85">
      {title}
    </div>
  );
}