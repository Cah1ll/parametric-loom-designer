import type { RoundLoomParamsMm, ValidationMessage } from '@/types/loom'
import { resolveBuildPlate } from '@/presets/buildPlatePresets'
import { getInnerOpeningDiameterMm, isRakeSlab, isSlabBoardShape } from '@/utils/pegSpacing'

export interface ValidationContext {
  buildPlatePresetId: string
  customBuildPlateWidthMm: number
  customBuildPlateDepthMm: number
  enforceBuildPlateFit: boolean
}

function boundingFootprintMm(params: RoundLoomParamsMm): { w: number; d: number } {
  if (isSlabBoardShape(params.shape)) {
    if (params.shape === 'rectangular') {
      const w = params.baseOuterDiameterMm + params.pegDiameterMm
      const h = params.baseWidthMm + params.pegDiameterMm
      return { w, d: h }
    }

    const n = Math.max(3, Math.round(params.pegCount))
    const lineLen = isRakeSlab(params) ? (n - 1) * params.pegSpacingMm : 0
    const halfLine = lineLen / 2
    const halfBoard = params.baseOuterDiameterMm / 2
    const maxX = Math.max(halfBoard, halfLine + params.pegDiameterMm / 2)
    return {
      w: maxX * 2,
      d: params.baseWidthMm + params.pegDiameterMm,
    }
  }

  const r = params.baseOuterDiameterMm / 2
  return { w: r * 2, d: r * 2 }
}

export function validateLoom(
  params: RoundLoomParamsMm,
  ctx: ValidationContext,
): ValidationMessage[] {
  const msgs: ValidationMessage[] = []
  const inner = getInnerOpeningDiameterMm(params)
  const clearance = params.pegSpacingMm - params.pegDiameterMm
  const isSlabBoard = isSlabBoardShape(params.shape)

  if (params.pegCount > 200) {
    msgs.push({
      id: 'heavy_model',
      severity: 'warn',
      text: 'Peg count is very high - the preview and STL may be slow or heavy.',
    })
  }

  if (params.pegDiameterMm < 4) {
    msgs.push({
      id: 'peg_thin',
      severity: 'warn',
      text: 'Peg diameter is below 4 mm - pegs may snap during use.',
    })
  } else if (params.pegDiameterMm < 5) {
    msgs.push({
      id: 'peg_thin_rec',
      severity: 'info',
      text: 'Peg diameter under 5 mm - consider 5 mm or larger for durability.',
    })
  }

  if (params.baseThicknessMm < 5) {
    msgs.push({
      id: 'base_thin',
      severity: 'warn',
      text: 'Base thickness is below 5 mm - the base may flex or crack.',
    })
  } else if (params.baseThicknessMm < 6) {
    msgs.push({
      id: 'base_thin_rec',
      severity: 'info',
      text: 'Base thickness under 6 mm - 6 mm+ is a good default for stiffness.',
    })
  }

  if (clearance < 1.5) {
    msgs.push({
      id: 'spacing_tight',
      severity: 'warn',
      text: 'Peg spacing is tight relative to peg diameter - yarn may snag.',
    })
  } else if (clearance < 3) {
    msgs.push({
      id: 'spacing_okish',
      severity: 'info',
      text: 'Peg spacing is close to peg diameter - watch for tight stitches.',
    })
  }

  if (!isSlabBoard && inner < params.pegDiameterMm * 2) {
    msgs.push({
      id: 'inner_small',
      severity: 'warn',
      text: 'Inner opening is very small compared to base width - check the center hole size.',
    })
  }

  if (!isSlabBoard && inner <= 0) {
    msgs.push({
      id: 'inner_invalid',
      severity: 'error',
      text: 'Inner opening is zero or negative - reduce base width or increase outer diameter.',
    })
  }

  if (params.baseWidthMm <= 0 || params.baseOuterDiameterMm <= 0) {
    msgs.push({
      id: 'dims_invalid',
      severity: 'error',
      text: 'Base dimensions must be positive.',
    })
  }

  if (params.pegHeightMm <= 0 || params.pegDiameterMm <= 0) {
    msgs.push({
      id: 'peg_invalid',
      severity: 'error',
      text: 'Peg height and diameter must be positive.',
    })
  }

  const plate = resolveBuildPlate(ctx.buildPlatePresetId, ctx.customBuildPlateWidthMm, ctx.customBuildPlateDepthMm)
  const fp = boundingFootprintMm(params)
  const fits = fp.w <= plate.widthMm && fp.d <= plate.depthMm
  if (ctx.enforceBuildPlateFit && !fits) {
    msgs.push({
      id: 'enforce_bed',
      severity: 'error',
      text: `Does not fit ${plate.label} (${plate.widthMm} x ${plate.depthMm} mm) with enforcement enabled.`,
    })
  }
  if (!fits) {
    msgs.push({
      id: 'bed_oversize',
      severity: 'warn',
      text: `Footprint (~${fp.w.toFixed(0)} x ${fp.d.toFixed(0)} mm) exceeds ${plate.label} (${plate.widthMm} x ${plate.depthMm} mm).`,
    })
    msgs.push({
      id: 'modular_hint',
      severity: 'info',
      text: 'Large looms may need modular sections - splitting is planned for a future release.',
    })
  }

  return msgs
}

export function canExportStl(params: RoundLoomParamsMm): boolean {
  if (isSlabBoardShape(params.shape)) {
    if (params.shape === 'rectangular' && params.pegCount < 4) return false
    if (params.pegCount < 3) return false
    if (!Number.isFinite(params.baseOuterDiameterMm) || params.baseOuterDiameterMm <= 0) return false
    if (params.baseWidthMm <= 0) return false
    return true
  }
  const inner = getInnerOpeningDiameterMm(params)
  if (inner <= 0) return false
  if (params.pegCount < 3) return false
  if (!Number.isFinite(params.baseOuterDiameterMm)) return false
  return true
}
