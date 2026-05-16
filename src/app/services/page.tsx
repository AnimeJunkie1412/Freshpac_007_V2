import { MarketingShell } from "@/components/layout/marketing-shell";
import { MarketingPage } from "@/components/layout/marketing-page";

const items = [["Coffee training", "Barista training, cleaning support and drink preparation guidance."], ["Machine packages", "Rent, lease and buy pathways, with engineering workflows held securely inside the portal."], ["Cafe supplies", "Bespoke packaging, garden centre cafe supplies and ongoing account support."]].map(([title, body]) => ({ title, body }));

export default function Page() {
  return (
    <MarketingShell>
      <MarketingPage eyebrow="Services" title="Training, packages and practical customer support" description="A public landing page for Freshpac services with room to grow into customer-specific portal tools later." items={items} />
    </MarketingShell>
  );
}
