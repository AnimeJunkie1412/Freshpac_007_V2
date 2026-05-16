import { Badge } from "@/components/ui/badge";

export function PageHeader({
  eyebrow,
  title,
  description,
  badge
}: {
  eyebrow?: string;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div>
        {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.18em] text-freshpac-orange">{eyebrow}</p> : null}
        <h1 className="mt-2 text-3xl font-black tracking-tight text-freshpac-charcoal md:text-4xl">{title}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-freshpac-grey">{description}</p>
      </div>
      {badge ? <Badge tone="info">{badge}</Badge> : null}
    </div>
  );
}
