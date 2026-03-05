export function formatILS(agorot: number): string {
  return `₪${(agorot / 100).toLocaleString('he-IL')}`
}
// formatILS(19700) → "₪197"
// formatILS(99700) → "₪997"
