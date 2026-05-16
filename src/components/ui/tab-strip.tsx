import { cn } from "@/lib/utils";

export function TabStrip({ tabs, active = 0 }: { tabs: string[]; active?: number }) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-2xl border border-freshpac-panel bg-white p-1">
      {tabs.map((tab, index) => (
        <button
          key={tab}
          className={cn(
            "whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold transition",
            index === active ? "bg-freshpac-charcoal text-white" : "text-freshpac-grey hover:bg-orange-50 hover:text-freshpac-charcoal"
          )}
          type="button"
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
