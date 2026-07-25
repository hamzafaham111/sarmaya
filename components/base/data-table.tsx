import { DASH } from "@/lib/format";

// Dense financial table (UI mandate #4): 13px numerals, 1.4 line-height,
// compact cells, first column sticky-ish label column, horizontal scroll on
// small screens — statements must never break the layout.
export interface DataTableColumn {
  key: string;
  header: string;
  /** right-align (numbers) — the default; false for label columns */
  numeric?: boolean;
}

export type DataTableCell = string | null;

export interface DataTableRow {
  label: string;
  cells: DataTableCell[]; // aligned with columns
  /** subtle emphasis for total/subtotal rows */
  emphasis?: boolean;
}

export function DataTable({
  columns,
  rows,
  ariaLabel,
}: {
  columns: DataTableColumn[];
  rows: DataTableRow[];
  ariaLabel: string;
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-line bg-surface">
      <table
        className="w-full min-w-max text-[13px] leading-[1.4]"
        aria-label={ariaLabel}
      >
        <thead>
          <tr className="border-b border-line">
            <th className="sticky left-0 bg-surface px-3 py-1.5 text-left font-medium text-ink-muted">
              {/* label column */}
            </th>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-3 py-1.5 font-medium text-ink-muted ${col.numeric === false ? "text-left" : "text-right"}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.label}
              className="border-b border-line last:border-0 hover:bg-surface-2"
            >
              <td
                className={`sticky left-0 bg-surface px-3 py-1.5 text-left ${row.emphasis ? "font-medium text-ink" : "text-ink-muted"}`}
              >
                {row.label}
              </td>
              {row.cells.map((cell, i) => (
                <td
                  key={columns[i]?.key ?? i}
                  className={`font-numeric px-3 py-1.5 tabular-nums ${columns[i]?.numeric === false ? "text-left" : "text-right"} ${row.emphasis ? "font-medium text-ink" : "text-ink"}`}
                >
                  {cell ?? DASH}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
