export function formatNumber(
  value: number | string | null | undefined
): string {
  const number = Number(value ?? 0);

  return new Intl.NumberFormat("fr-FR").format(
    Number.isNaN(number) ? 0 : number
  );
}
