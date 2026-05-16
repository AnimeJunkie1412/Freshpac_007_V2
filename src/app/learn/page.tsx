import { MarketingShell } from "@/components/layout/marketing-shell";
import { MarketingPage } from "@/components/layout/marketing-page";

const items = [["Drink guides", "Latte, cappuccino, flat white, cortado, macchiato, americano, mocha and hot chocolate."], ["Cleaning guides", "Espresso machine cleaning and best practice checklists."], ["Training hub", "A structure ready for embedded videos and downloadable support sheets."]].map(([title, body]) => ({ title, body }));

export default function Page() {
  return (
    <MarketingShell>
      <MarketingPage eyebrow="Learn" title="Training videos, guides and machine cleaning support" description="The Learn section can become a tidy public knowledge base for customers and staff reference." items={items} />
    </MarketingShell>
  );
}
