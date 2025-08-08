export function formatDate(date: string | Date): string {
  const userLocale = navigator.language || "en-GB";
  const locale = userLocale.startsWith("en-US") ? "en-US" : "en-GB";

  return new Date(date).toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export function formatDateTime(date: string | Date): string {
  const userLocale = navigator.language || "en-GB";
  const locale = userLocale.startsWith("en-US") ? "en-US" : "en-GB";

  return new Date(date).toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
