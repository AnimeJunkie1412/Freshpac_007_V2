import { MarketingShell } from "@/components/layout/marketing-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

const fields = [
  "Name",
  "Phone number",
  "Email address",
  "Business name",
  "Business address",
  "Relation to company"
];

export default function RequestTradeAccountPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <PageHeader eyebrow="Trade account" title="Request a Freshpac trade account" description="This starter form is ready to wire into Supabase so requests appear inside the Sales Portal trade requests area." />
        <Card>
          <CardHeader>
            <CardTitle>Application details</CardTitle>
            <CardDescription>No customer account is created automatically. Freshpac reviews and contacts the applicant first.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2">
              {fields.map((field) => (
                <label key={field} className="grid gap-2 text-sm font-semibold text-freshpac-charcoal">
                  {field}
                  <Input placeholder={field} />
                </label>
              ))}
              <label className="grid gap-2 text-sm font-semibold text-freshpac-charcoal md:col-span-2">
                Optional notes
                <Textarea placeholder="Tell us about your business, products you are interested in, or machine support required." />
              </label>
              <div className="md:col-span-2">
                <Button type="button">Submit request placeholder</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </MarketingShell>
  );
}
