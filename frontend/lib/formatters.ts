/**
 * Currency & Number Formatter
 */
export function formatCurrency(
  amount: number | undefined | null,
  currency: string = "₹"
): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${currency}0`;
  }
  return `${currency}${Math.round(amount).toLocaleString()}`;
}

/**
 * Format date string or Date object to localized readable string
 */
export function formatDate(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return "";
  try {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(dateInput);
  }
}

/**
 * Format date range (e.g. "Sep 10 – Sep 16" or "Sep 10 – 16, 2026")
 */
export function formatDateRange(
  start: string | Date | undefined | null,
  end: string | Date | undefined | null
): string {
  const startStr = formatDate(start);
  const endStr = formatDate(end);
  if (!startStr && !endStr) return "";
  if (!startStr) return endStr;
  if (!endStr) return startStr;
  return `${startStr} – ${endStr}`;
}

/**
 * Calculate duration in days between two dates
 */
export function calculateDurationDays(
  start: string | Date,
  end: string | Date
): number {
  try {
    const d1 = new Date(start);
    const d2 = new Date(end);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  } catch {
    return 1;
  }
}
