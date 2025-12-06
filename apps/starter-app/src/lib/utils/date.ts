export function getHumanFriendlyDate(date: Date | string | number): string {
  const d = new Date(date)
  if (!d || isNaN(d.getTime())) {
    return "N/A"
  }
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d)
}
