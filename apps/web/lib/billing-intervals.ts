export function intervalToSeconds(interval: string | null | undefined): number {
  switch (interval) {
    case "minutely":  return 60;
    case "weekly":    return 7 * 24 * 60 * 60;
    case "biweekly":  return 14 * 24 * 60 * 60;
    case "monthly":   return 30 * 24 * 60 * 60;
    case "quarterly": return 90 * 24 * 60 * 60;
    case "yearly":    return 365 * 24 * 60 * 60;
    default:          return 0;
  }
}

export function formatInterval(interval: string | null | undefined): string {
  switch (interval) {
    case "minutely":  return "per minute";
    case "weekly":    return "per week";
    case "biweekly":  return "every 2 weeks";
    case "monthly":   return "per month";
    case "quarterly": return "per quarter";
    case "yearly":    return "per year";
    default:          return "";
  }
}
