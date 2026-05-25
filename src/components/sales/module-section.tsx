import type { ReactNode } from "react";

export function ModuleSection({
  id,
  title,
  description,
  action,
  children
}: {
  id: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-2xl border border-freshpac-panel bg-white shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-freshpac-panel px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-base font-black tracking-tight text-freshpac-charcoal">
            {title}
          </h2>
          {description ? (
            <p className="mt-0.5 text-xs font-medium leading-5 text-freshpac-grey">
              {description}
            </p>
          ) : null}
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      <div className="p-4">{children}</div>
    </section>
  );
}