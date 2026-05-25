export function DetailField({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-freshpac-panel bg-white p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-freshpac-grey">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-bold leading-5 text-freshpac-charcoal">
        {value}
      </p>
    </div>
  );
}