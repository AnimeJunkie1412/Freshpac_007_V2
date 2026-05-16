import type { ReactNode } from "react";

export type Column<T> = {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
};

export function DataTable<T extends Record<string, unknown>>({ columns, rows }: { columns: Column<T>[]; rows: T[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-freshpac-panel bg-white">
      <div className="overflow-x-auto">
        <table className="fp-compact-table min-w-full border-collapse">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.header}>{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column) => {
                  const value = typeof column.accessor === "function" ? column.accessor(row) : row[column.accessor];
                  return <td key={column.header}>{value as ReactNode}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
