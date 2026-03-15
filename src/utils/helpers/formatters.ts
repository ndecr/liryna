/**
 * Formate un montant en euros (format fr-FR).
 * @param value  Valeur numérique
 * @param decimals  Nombre de décimales (défaut : 0)
 */
export const formatCurrency = (value: number, decimals = 0): string =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

/**
 * Formate un ratio décimal en pourcentage lisible.
 * @param value     Valeur entre 0 et 1 (ex : 0.35 → "35.00 %")
 * @param decimals  Nombre de décimales (défaut : 2)
 */
export const formatPct = (value: number, decimals = 2): string =>
  `${(value * 100).toFixed(decimals)} %`;
