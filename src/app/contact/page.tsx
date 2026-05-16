import { MarketingShell } from "@/components/layout/marketing-shell";
import { MarketingPage } from "@/components/layout/marketing-page";

const items = [["Phone", "01986 873410"], ["Email", "sales@freshpac.co.uk"], ["Address", "Unit B, Broadway Drive, Halesworth, Suffolk, IP19 8QR"]].map(([title, body]) => ({ title, body }));

export default function Page() {
  return (
    <MarketingShell>
      <MarketingPage eyebrow="Contact" title="Speak to Freshpac" description="Contact details, enquiry form placeholder, map link area and trade account call-to-action." items={items} />
    </MarketingShell>
  );
}
