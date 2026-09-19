export function formatCurrency(
  value: number | string | null | undefined,
  currency = "USD"
): string {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(Number.isNaN(amount) ? 0 : amount);
}
