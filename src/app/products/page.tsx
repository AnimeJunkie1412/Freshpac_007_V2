import { MarketingShell } from "@/components/layout/marketing-shell";
import { MarketingPage } from "@/components/layout/marketing-page";

const items = [["Coffee highlights", "Public-friendly coffee overview with no restricted product access or account pricing."], ["Tea and beverages", "Tea blends, hot chocolate, syrups, oat or dairy alternatives and cafe essentials."], ["Compostable takeaway", "Cups, lids, sleeves and consumables can be presented as categories before login."]].map(([title, body]) => ({ title, body }));

export default function Page() {
  return (
    <MarketingShell>
      <MarketingPage eyebrow="Products" title="Public product categories without confidential pricing" description="This page is intentionally public-safe: B2B prices, restricted coffee products and retail assignments belong behind login." items={items} />
    </MarketingShell>
  );
}
