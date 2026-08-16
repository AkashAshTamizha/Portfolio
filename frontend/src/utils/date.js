export function formatMonthYear(dateValue) {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function formatPeriod(startDate, endDate, current) {
  const start = formatMonthYear(startDate);
  const end = current ? "Present" : formatMonthYear(endDate) || "Present";
  if (!start) return "";
  return `${start} — ${end}`;
}

export function formatDate(dateValue) {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Reviews need both date AND time shown (per the review spec), so this is
// distinct from formatDate, which is used everywhere else (timelines etc.)
// where only the day matters.
export function formatDateTime(dateValue) {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
