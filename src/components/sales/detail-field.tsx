import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DetailField({
  label,
  value,
  className,
  children
}: {
  label: string;
  value?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("rounded-2xl border border-freshpac-panel bg-white/70 p-3", className)}>
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-freshpac-grey">{label}</p>
      <div className="mt-1 text-sm font-semibold text-freshpac-charcoal">{children ?? value}</div>
    </div>
  );
}