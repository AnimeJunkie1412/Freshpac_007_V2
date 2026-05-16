import { MarketingShell } from "@/components/layout/marketing-shell";
import { MarketingPage } from "@/components/layout/marketing-page";

const items = [["Espresso machines", "Traditional coffee equipment and grinder pairings."], ["Bean-to-cup", "Hospitality and workplace machine options."], ["Engineering records", "Internal serial numbers, service history and job sheets stay in the secure portal."]].map(([title, body]) => ({ title, body }));

export default function Page() {
  return (
    <MarketingShell>
      <MarketingPage eyebrow="Machines" title="Equipment options and engineering support" description="A public overview for espresso machines, grinders, bean-to-cup machines and hospitality equipment." items={items} />
    </MarketingShell>
  );
}
