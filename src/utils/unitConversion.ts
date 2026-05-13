const MM_PER_INCH = 25.4

export function mmToInches(mm: number): number {
  return mm / MM_PER_INCH
}

export function inchesToMm(inches: number): number {
  return inches * MM_PER_INCH
}

export function formatLength(valueMm: number, unit: 'mm' | 'in', digits = 2): string {
  if (unit === 'mm') return `${valueMm.toFixed(digits)} mm`
  return `${mmToInches(valueMm).toFixed(digits)} in`
}

export function parseLengthInput(text: string, unit: 'mm' | 'in'): number | null {
  const t = text.trim().replace(/,/g, '')
  if (!t) return null
  const n = Number(t)
  if (!Number.isFinite(n)) return null
  return unit === 'mm' ? n : inchesToMm(n)
}
