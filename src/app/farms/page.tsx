import { MarketingShell } from "@/components/layout/marketing-shell";
import { MarketingPage } from "@/components/layout/marketing-page";

const items = [["Direct sourcing", "Where possible, explain direct farm relationships and transparent supply chains."], ["Quality control", "Room for coffee origin stories, cupping notes and quality standards."], ["Long-term growers", "Profiles and stories can be added without changing the portal logic."]].map(([title, body]) => ({ title, body }));

export default function Page() {
  return (
    <MarketingShell>
      <MarketingPage eyebrow="Farms" title="Sourcing and direct farm relationships" description="A public area for Freshpac sourcing, ethical relationships and future farm profile content." items={items} />
    </MarketingShell>
  );
}
