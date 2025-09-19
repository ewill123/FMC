// utils/timerUtils.ts
export function calculateAssetLifeSpan(
  acquisitionYear: number,
  lifeSpanYears: number = 5
) {
  const currentYear = new Date().getFullYear();
  const age = currentYear - acquisitionYear;
  const remaining = lifeSpanYears - age;
  return remaining > 0 ? remaining : 0;
}
