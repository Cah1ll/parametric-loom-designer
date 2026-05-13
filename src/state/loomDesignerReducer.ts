import type {
  FieldOverrideState,
  GaugeStyleId,
  LoomDesignState,
  PegDerivationMode,
  RoundLoomParamsMm,
} from '@/types/loom'
import { getGaugePreset } from '@/presets/gaugePresets'
import { countFromSpacing, spacingFromCount } from '@/utils/pegSpacing'

/** Integer peg count; rectangular frames need at least four pegs on the loop. */
function normalizePegCountForShape(params: RoundLoomParamsMm): RoundLoomParamsMm {
  const rounded = Math.round(params.pegCount)
  if (params.shape === 'rectangular') {
    return { ...params, pegCount: Math.max(4, rounded) }
  }
  return { ...params, pegCount: Math.max(3, rounded) }
}

export type LoomDesignerAction =
  | { type: 'set_gauge_style'; gauge: GaugeStyleId }
  | { type: 'set_shape'; shape: RoundLoomParamsMm['shape'] }
  | { type: 'set_peg_derivation_mode'; mode: PegDerivationMode }
  | { type: 'set_param'; key: keyof RoundLoomParamsMm; value: number | boolean | string }
  | { type: 'set_display_unit'; unit: 'mm' | 'in' }
  | { type: 'set_build_plate_preset'; id: string }
  | { type: 'set_custom_build_plate'; widthMm: number; depthMm: number }
  | { type: 'toggle_build_plate' }
  | { type: 'set_enforce_build_plate_fit'; value: boolean }
  | { type: 'set_camera_preset'; preset: LoomDesignState['cameraPreset'] }
  | { type: 'reset_all' }

const defaultOverrides = (): FieldOverrideState => ({
  pegSpacing: false,
  pegDiameter: false,
  pegHeight: false,
  baseThickness: false,
  baseWidth: false,
  edgeFillet: false,
})

export function syncPegGeometry(params: RoundLoomParamsMm, mode: PegDerivationMode): RoundLoomParamsMm {
  const p0 = normalizePegCountForShape(params)
  if (mode === 'from_count') {
    return { ...p0, pegSpacingMm: spacingFromCount(p0) }
  }
  return { ...p0, pegCount: countFromSpacing(p0, p0.pegSpacingMm) }
}

/** Default round loom (~10.5 in ring class, 48 pegs) after gauge + sync. */
export const defaultRoundParams = (): RoundLoomParamsMm => ({
  shape: 'round',
  baseOuterDiameterMm: 266.7,
  baseWidthMm: 18,
  baseThicknessMm: 6,
  pegCount: 48,
  pegSpacingMm: 12,
  pegDiameterMm: 6,
  pegHeightMm: 22,
  pegTipStyle: 'rounded',
  pegCapRadiusMultiple: 1.12,
  edgeFilletMm: 1.2,
  pegAttachMode: 'fixed',
})

function applySuggestedPegDiameter(params: RoundLoomParamsMm, gauge: GaugeStyleId): RoundLoomParamsMm {
  const g = getGaugePreset(gauge)
  if (!g || gauge === 'custom') return params
  return { ...params, pegDiameterMm: g.pegDiameterMm.default }
}

export function createInitialState(): LoomDesignState {
  const gauge: GaugeStyleId = 'regular'
  const overrides = defaultOverrides()
  let params = applySuggestedPegDiameter(defaultRoundParams(), gauge)
  const paramsSynced = syncPegGeometry(params, 'from_count')
  return {
    gaugeStyle: gauge,
    pegDerivationMode: 'from_count',
    params: paramsSynced,
    fieldOverrides: overrides,
    displayUnit: 'mm',
    buildPlatePresetId: 'bambu_a1',
    customBuildPlateWidthMm: 220,
    customBuildPlateDepthMm: 220,
    showBuildPlate: true,
    enforceBuildPlateFit: false,
    cameraPreset: 'iso',
  }
}

export function loomDesignerReducer(state: LoomDesignState, action: LoomDesignerAction): LoomDesignState {
  switch (action.type) {
    case 'reset_all':
      return createInitialState()

    case 'set_gauge_style': {
      const nextGauge = action.gauge
      const overrides: FieldOverrideState =
        nextGauge === 'custom' ? { ...state.fieldOverrides } : defaultOverrides()
      let params = { ...state.params }
      const g = getGaugePreset(nextGauge)
      if (g && nextGauge !== 'custom') {
        params.pegDiameterMm = g.pegDiameterMm.default
        if (state.pegDerivationMode === 'from_spacing') {
          params.pegSpacingMm = g.pegSpacingMm.default
        }
      }
      params = syncPegGeometry(params, state.pegDerivationMode)
      return { ...state, gaugeStyle: nextGauge, params, fieldOverrides: overrides }
    }

    case 'set_shape': {
      let nextParams = { ...state.params, shape: action.shape }
      nextParams = normalizePegCountForShape(nextParams)
      const params = syncPegGeometry(nextParams, state.pegDerivationMode)
      return { ...state, params }
    }

    case 'set_peg_derivation_mode': {
      const mode = action.mode
      let overrides = { ...state.fieldOverrides }
      if (mode === 'from_count') overrides.pegSpacing = false
      const params = syncPegGeometry(state.params, mode)
      return { ...state, pegDerivationMode: mode, params, fieldOverrides: overrides }
    }

    case 'set_param': {
      const key = action.key
      const value = action.value
      let overrides = { ...state.fieldOverrides }
      let params = { ...state.params, [key]: value } as RoundLoomParamsMm

      if (key === 'pegTipStyle' && value === 'spherical' && params.pegCapRadiusMultiple < 1.02) {
        params = { ...params, pegCapRadiusMultiple: 1.12 }
      }

      if (key === 'pegDiameterMm') overrides.pegDiameter = true
      if (key === 'pegSpacingMm' && state.pegDerivationMode === 'from_spacing') overrides.pegSpacing = true

      if (key === 'pegHeightMm') overrides.pegHeight = true
      if (key === 'baseThicknessMm') overrides.baseThickness = true
      if (key === 'baseWidthMm') overrides.baseWidth = true
      if (key === 'edgeFilletMm') overrides.edgeFillet = true

      params = syncPegGeometry(params, state.pegDerivationMode)

      return { ...state, params, fieldOverrides: overrides }
    }

    case 'set_display_unit':
      return { ...state, displayUnit: action.unit }

    case 'set_build_plate_preset':
      return { ...state, buildPlatePresetId: action.id }

    case 'set_custom_build_plate':
      return {
        ...state,
        customBuildPlateWidthMm: action.widthMm,
        customBuildPlateDepthMm: action.depthMm,
      }

    case 'toggle_build_plate':
      return { ...state, showBuildPlate: !state.showBuildPlate }

    case 'set_enforce_build_plate_fit':
      return { ...state, enforceBuildPlateFit: action.value }

    case 'set_camera_preset':
      return { ...state, cameraPreset: action.preset }

    default:
      return state
  }
}
