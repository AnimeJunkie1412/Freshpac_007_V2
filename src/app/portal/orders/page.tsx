import { PortalShell } from "@/components/layout/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";

export default function OrderingPortalPage() {
  return (
    <PortalShell title="Ordering portal" subtitle="Customer basket, assigned products, retail orders, standing orders and past orders." activeHref="/portal/ordering">
      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Customer dashboard</CardTitle>
            <CardDescription>Account status, delivery day, cut-off and basket summary.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="rounded-2xl bg-orange-50 p-4">
              <p className="font-bold text-freshpac-charcoal">Delivery day: Thursday</p>
              <p className="text-sm text-freshpac-grey">Cut-off: 3pm the day before delivery.</p>
            </div>
            <Badge tone="success">Active account</Badge>
            <Badge tone="info">Price visibility on</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Customer-facing interface should be less dense than the staff portal.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {[
              "Browse assigned products",
              "View basket",
              "Create retail order",
              "Manage standing orders",
              "Past orders",
              "Favourites"
            ].map((action) => (
              <LinkButton key={action} href="#" variant="secondary" className="justify-start">{action}</LinkButton>
            ))}
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
