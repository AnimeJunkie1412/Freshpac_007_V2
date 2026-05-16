import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { publicHighlights } from "@/lib/mock-data";

const serviceCards = [
  { title: "Coffee and trade products", text: "A focused catalogue for coffee, tea, hot chocolate, syrups, barista essentials and compostable takeaway products." },
  { title: "Machine support", text: "Machine packages, engineer workflows, service records, breakdown history and parts requests planned into the same platform." },
  { title: "Simple B2B ordering", text: "Customers see only the products assigned to them, while Freshpac keeps pricing, coffee access and account rules controlled." }
];

export default function HomePage() {
  return (
    <MarketingShell>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-16">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-freshpac-orange">Freshpac Teas & Coffees</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight text-freshpac-charcoal md:text-6xl">Artisan coffee roasted in Suffolk.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-freshpac-grey">A warm public website paired with a secure operations platform for ordering, customer accounts, engineering, machine tracking and practical day-to-day Freshpac workflows.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <LinkButton href="/request-trade-account" size="lg">Request trade account</LinkButton>
            <LinkButton href="/products" variant="secondary" size="lg">Explore products</LinkButton>
            <LinkButton href="/portal" variant="ghost" size="lg">View portal framework</LinkButton>
          </div>
        </div>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-freshpac-charcoal p-5 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-freshpac-orange">Semi-compact operations preview</p>
              <h2 className="mt-2 text-2xl font-black">Built for real office speed</h2>
            </div>
            <div className="grid gap-3 p-5">
              {publicHighlights.map((highlight) => (
                <div key={highlight} className="flex items-center justify-between rounded-2xl border border-freshpac-panel bg-[#fbf8f2] px-4 py-3">
                  <span className="font-semibold text-freshpac-charcoal">{highlight}</span>
                  <span className="rounded-full bg-freshpac-orange px-2 py-1 text-xs font-black text-freshpac-charcoal">Ready</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {serviceCards.map((card) => (
            <Card key={card.title}>
              <CardContent>
                <h2 className="text-lg font-black text-freshpac-charcoal">{card.title}</h2>
                <p className="mt-2 text-sm leading-6 text-freshpac-grey">{card.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
