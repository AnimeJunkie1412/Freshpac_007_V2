import { MarketingShell } from "@/components/layout/marketing-shell";
import { MarketingPage } from "@/components/layout/marketing-page";

const items = [["Family-run since 1979", "Space for the company story, generations involved, roasting room, training room and team values."], ["In-house roasting", "A page structure ready for roast profiles, quality control and the Freshpac approach to coffee."], ["Support teams", "Sales, delivery, office and engineering support can be explained without exposing internal portal data."]].map(([title, body]) => ({ title, body }));

export default function Page() {
  return (
    <MarketingShell>
      <MarketingPage eyebrow="About Freshpac" title="Family-run coffee roasting, service and support" description="Freshpac is planned as a public website and secure operations platform that reflects the company history while making everyday work easier." items={items} />
    </MarketingShell>
  );
}
