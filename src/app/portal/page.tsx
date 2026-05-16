import { PortalShell } from "@/components/layout/portal-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { siteConfig } from "@/lib/config/site";

export default function PortalHomePage() {
  return (
    <PortalShell title="Portal chooser" subtitle="Master and Admin users can choose Sales or Engineering; customers and engineers are routed directly." activeHref="/portal">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {siteConfig.portals.map((portal) => (
          <Card key={portal.href}>
            <CardHeader>
              <CardTitle>{portal.label}</CardTitle>
              <CardDescription>{portal.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <LinkButton href={portal.href} variant="secondary" className="w-full">Open</LinkButton>
            </CardContent>
          </Card>
        ))}
      </div>
    </PortalShell>
  );
}
