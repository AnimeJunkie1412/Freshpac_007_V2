import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export function MarketingPage({
  eyebrow,
  title,
  description,
  items
}: {
  eyebrow: string;
  title: string;
  description: string;
  items: { title: string; body: string }[];
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.title}>
            <CardContent>
              <h2 className="text-lg font-black text-freshpac-charcoal">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-freshpac-grey">{item.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
