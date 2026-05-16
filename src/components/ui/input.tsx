import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "fp-focus-ring h-10 w-full rounded-xl border border-freshpac-panel bg-white px-3 text-sm text-freshpac-charcoal placeholder:text-freshpac-grey/70",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "fp-focus-ring min-h-28 w-full rounded-xl border border-freshpac-panel bg-white px-3 py-2 text-sm text-freshpac-charcoal placeholder:text-freshpac-grey/70",
        className
      )}
      {...props}
    />
  );
}
