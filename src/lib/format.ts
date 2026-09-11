export function formatPercent(value: number | undefined | null, digits = 1): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "N/A";
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatSignedPercent(value: number | undefined | null, digits = 1): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "N/A";
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${(Math.abs(value) * 100).toFixed(digits)}%`;
}

export function formatDecimal(value: number | undefined | null, digits = 2): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "N/A";
  return value.toFixed(digits);
}

export function formatDate(value: string | undefined | null): string {
  if (!value) return "N/A";
  const d = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatShortDate(value: string | undefined | null): string {
  if (!value) return "N/A";
  const d = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", {
    year: "2-digit",
    month: "short",
    timeZone: "UTC",
  });
}

/** Month + day only (e.g. "Jan 3"): enough to distinguish same-month rebalances in a compact chip strip. */
export function formatChipDate(value: string | undefined | null): string {
  if (!value) return "N/A";
  const d = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatDateRange(start: string | undefined | null, end: string | undefined | null): string {
  return `${formatDate(start)} – ${formatDate(end)}`;
}

export function formatShortDateRange(start: string | undefined | null, end: string | undefined | null): string {
  return `${formatShortDate(start)} – ${formatShortDate(end)}`;
}

export function formatInt(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "N/A";
  return value.toLocaleString("en-US");
}
