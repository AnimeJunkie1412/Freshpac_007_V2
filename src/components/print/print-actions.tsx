"use client";

import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";

export function PrintActions({ backHref }: { backHref: string }) {
  return (
    <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-freshpac-panel bg-white p-4 shadow-sm">
      <Link
        href={backHref}
        className="inline-flex items-center rounded-xl border border-freshpac-panel bg-white px-4 py-2 text-sm font-bold text-freshpac-charcoal transition hover:border-freshpac-orange hover:bg-orange-50"
      >
        <ArrowLeft className="mr-2 size-4" />
        Back
      </Link>

      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center rounded-xl bg-freshpac-orange px-4 py-2 text-sm font-black text-freshpac-charcoal transition hover:bg-orange-400"
      >
        <Printer className="mr-2 size-4" />
        Print / Save PDF
      </button>
    </div>
  );
}