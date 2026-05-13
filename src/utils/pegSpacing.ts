import type { LoomShape, RoundLoomParamsMm } from '@/types/loom'

/** Solid slab base (extruded plate): rake = one straight peg row; rectangular = pegs on outer frame. */
export function isSlabBoardShape(shape: LoomShape): boolean {
  return shape === 'rake' || shape === 'rectangular'
}

/** @deprecated Use {@link isSlabBoardShape} - name kept during refactor reads. */
export const isSlabStraightRowShape = isSlabBoardShape

export function isRakeSlab(params: RoundLoomParamsMm): boolean {
  return params.shape === 'rake'
}

export function isRectangularFrameSlab(params: RoundLoomParamsMm): boolean {
  return params.shape === 'rectangular'
}

/** Symmetric inset from each slab end to outer peg face (mm); derived so the peg row stays centered. */
function autoSlabEndMarginMm(params: RoundLoomParamsMm): number {
  return Math.max(1.5, params.pegDiameterMm * 0.32)
}

/**
 * Effective outer corner radius of the slab rounded rectangle (mm).
 * Shared with {@link createLoomBaseGeometry} so peg pitch matches the extruded outline.
 */
export function getSlabOuterCornerRadiusMm(params: RoundLoomParamsMm): number {
  const w = Math.max(20, params.baseOuterDiameterMm)
  const h = Math.max(12, params.baseWidthMm)
  const fillet = Math.max(0, Math.min(params.edgeFilletMm, params.baseThicknessMm * 0.35, h * 0.35, w * 0.12))
  const cornerR = fillet * 1.25 + 0.5
  return Math.max(0.15, Math.min(cornerR, w / 2 - 0.1, h / 2 - 0.1))
}

/** Target span along X for evenly spaced pegs (between outer peg centers), single-row rake only. */
export function getRakePitchSpanTargetMm(params: RoundLoomParamsMm): number {
  const d = params.pegDiameterMm
  const m = autoSlabEndMarginMm(params)
  const w = Math.max(20, params.baseOuterDiameterMm)
  const R = getSlabOuterCornerRadiusMm(params)
  return Math.max(8, w - d - 2 * m - 2 * R)
}

/** Half-extents of the peg pitch rectangle (mm), inset inside the slab flat outer edges (rounded corners accounted for). */
export function getRectangularPitchHalfExtentsMm(params: RoundLoomParamsMm): { hx: number; hy: number } {
  const m = autoSlabEndMarginMm(params)
  const w = Math.max(20, params.baseOuterDiameterMm)
  const h = Math.max(12, params.baseWidthMm)
  const R = getSlabOuterCornerRadiusMm(params)
  const hx = Math.max(0.8, w / 2 - R - m)
  const hy = Math.max(0.8, h / 2 - R - m)
  return { hx, hy }
}

/** From peg-center path inward to inner void edge (mm); keeps printable wall under pegs. */
const RECT_SLAB_VOID_INSET_FROM_PITCH_MM = 6.5

/** Skip void if the cutout would be narrower than this (mm full width). */
const RECT_SLAB_VOID_MIN_OPENING_MM = 14

/**
 * Half-extents of the axis-aligned inner cutout on rectangular slab bases (material savings), or null if omitted.
 */
export function getRectangularSlabInnerVoidHalfExtentsMm(
  params: RoundLoomParamsMm,
): { ix: number; iy: number } | null {
  if (!isRectangularFrameSlab(params)) return null
  const { hx, hy } = getRectangularPitchHalfExtentsMm(params)
  const inset = RECT_SLAB_VOID_INSET_FROM_PITCH_MM + params.pegDiameterMm / 2
  const ix = hx - inset
  const iy = hy - inset
  if (ix <= 0.6 || iy <= 0.6) return null
  if (ix * 2 < RECT_SLAB_VOID_MIN_OPENING_MM || iy * 2 < RECT_SLAB_VOID_MIN_OPENING_MM) return null
  const w = Math.max(20, params.baseOuterDiameterMm)
  const h = Math.max(12, params.baseWidthMm)
  if (w / 2 - ix < 3 || h / 2 - iy < 3) return null
  return { ix, iy }
}

/** Arclength fraction [0,1) so peg index 0 sits at bottom edge midpoint (symmetric about board center). */
export function getRectangularPegLoopPhaseOffsetU(params: RoundLoomParamsMm): number {
  const { hx, hy } = getRectangularPitchHalfExtentsMm(params)
  const p = 4 * (hx + hy)
  if (p <= 1e-6) return 0
  return hx / p
}

/** Closed-loop path length for peg centers on a rectangular frame (mm). */
export function getRectangularPitchPerimeterMm(params: RoundLoomParamsMm): number {
  const { hx, hy } = getRectangularPitchHalfExtentsMm(params)
  return 4 * (hx + hy)
}

/** Rake: center-to-center distance from first to last peg along the row. Rectangular: full perimeter. */
export function getSlabPegPathLengthMm(params: RoundLoomParamsMm): number {
  if (isRectangularFrameSlab(params)) {
    return getRectangularPitchPerimeterMm(params)
  }
  const n = Math.max(3, Math.round(params.pegCount))
  return Math.max(0, (n - 1) * params.pegSpacingMm)
}

/** @deprecated Prefer {@link getSlabPegPathLengthMm} for clarity. */
export function getRakePegLineLengthMm(params: RoundLoomParamsMm): number {
  return getSlabPegPathLengthMm(params)
}

/**
 * XY on the rectangular pitch loop: u in [0,1) is normalized arc length, CCW from (-hx,-hy)
 * along bottom -> right -> top -> left.
 */
export function xyOnRectangularPitchPerimeter(params: RoundLoomParamsMm, u: number): { x: number; y: number } {
  const { hx, hy } = getRectangularPitchHalfExtentsMm(params)
  const Lb = 2 * hx
  const Lr = 2 * hy
  const Lt = 2 * hx
  const Ll = 2 * hy
  const P = Lb + Lr + Lt + Ll
  const s = (((u % 1) + 1) % 1) * P
  let dist = s
  if (dist <= Lb) {
    const t = Lb <= 1e-9 ? 0 : dist / Lb
    return { x: -hx + t * Lb, y: -hy }
  }
  dist -= Lb
  if (dist <= Lr) {
    const t = Lr <= 1e-9 ? 0 : dist / Lr
    return { x: hx, y: -hy + t * Lr }
  }
  dist -= Lr
  if (dist <= Lt) {
    const t = Lt <= 1e-9 ? 0 : dist / Lt
    return { x: hx - t * Lt, y: hy }
  }
  dist -= Lt
  const t = Ll <= 1e-9 ? 0 : dist / Ll
  return { x: -hx, y: hy - t * Ll }
}

/** Peg axis circle radius (mm): round = mid-annulus. Rake: half single-row length (legacy helper). */
export function getPegPitchRadiusMm(params: RoundLoomParamsMm): number {
  if (isRakeSlab(params)) {
    return getSlabPegPathLengthMm(params) / 2
  }
  if (isRectangularFrameSlab(params)) {
    const { hx, hy } = getRectangularPitchHalfExtentsMm(params)
    return Math.hypot(hx, hy)
  }
  const outerR = params.baseOuterDiameterMm / 2
  const innerR = Math.max(outerR - params.baseWidthMm, 0.5)
  const r = params.pegDiameterMm / 2
  const midR = (outerR + innerR) / 2
  const lo = innerR + r + 0.2
  const hi = outerR - r - 0.2
  if (hi <= lo) return Math.max((lo + hi) / 2, 0.5)
  return Math.max(lo, Math.min(hi, midR))
}

export function getPegPitchCircumferenceMm(params: RoundLoomParamsMm): number {
  if (isRakeSlab(params)) {
    return Math.max(1e-6, getSlabPegPathLengthMm(params))
  }
  if (isRectangularFrameSlab(params)) {
    return Math.max(1e-6, getRectangularPitchPerimeterMm(params))
  }
  return 2 * Math.PI * getPegPitchRadiusMm(params)
}

export function spacingFromCount(params: RoundLoomParamsMm): number {
  const n = Math.max(3, Math.round(params.pegCount))
  if (isRakeSlab(params)) {
    const L = getRakePitchSpanTargetMm(params)
    return L / (n - 1)
  }
  if (isRectangularFrameSlab(params)) {
    const P = getRectangularPitchPerimeterMm(params)
    return P / Math.max(4, n)
  }
  const c = getPegPitchCircumferenceMm(params)
  return c / n
}

export function countFromSpacing(params: RoundLoomParamsMm, spacingMm: number): number {
  if (isRakeSlab(params)) {
    const L = getRakePitchSpanTargetMm(params)
    if (spacingMm <= 0.01) return 3
    const n = Math.round(L / spacingMm + 1)
    return Math.max(3, n)
  }
  if (isRectangularFrameSlab(params)) {
    const P = getRectangularPitchPerimeterMm(params)
    if (spacingMm <= 0.01) return 4
    const n = Math.round(P / spacingMm)
    return Math.max(4, Math.min(240, n))
  }
  const c = getPegPitchCircumferenceMm(params)
  if (spacingMm <= 0.01) return 3
  const n = Math.round(c / spacingMm)
  return Math.max(3, n)
}

/** Inner opening of annular round base; solid slabs have no hole. */
export function getInnerOpeningDiameterMm(params: RoundLoomParamsMm): number {
  if (isSlabBoardShape(params.shape)) {
    return 0
  }
  return params.baseOuterDiameterMm - 2 * params.baseWidthMm
}
