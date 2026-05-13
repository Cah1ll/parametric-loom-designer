/** Millimeters internally for all numeric design fields. */

export type LoomShape = 'round' | 'oval' | 'rectangular' | 'rake'

export type GaugeStyleId = 'fine' | 'regular' | 'chunky' | 'custom'

export type PegDerivationMode = 'from_count' | 'from_spacing'

/** Future: press-fit / threaded pegs attach mode. */
export type PegAttachMode = 'fixed' | 'press_fit' | 'threaded'

/** Peg tip: flat cylinder, lathe-rounded outer top corner, or large spherical stop (slider). */
export type PegTipStyle = 'flat' | 'rounded' | 'spherical'

export interface GaugePreset {
  id: GaugeStyleId
  label: string
  description: string
  /** Suggested peg spacing along peg pitch circle (mm). */
  pegSpacingMm: { min: number; max: number; default: number }
  /** Suggested peg diameter (mm). */
  pegDiameterMm: { min: number; max: number; default: number }
}

export interface BuildPlatePreset {
  id: string
  label: string
  widthMm: number
  depthMm: number
}

export interface RoundLoomParamsMm {
  shape: LoomShape
  /** Outer diameter of the annular base (mm). */
  baseOuterDiameterMm: number
  /** Radial width of the ring band (mm). */
  baseWidthMm: number
  baseThicknessMm: number
  pegCount: number
  pegSpacingMm: number
  pegDiameterMm: number
  pegHeightMm: number
  pegTipStyle: PegTipStyle
  /**
   * Spherical tip only: sphere radius as a multiple of peg shaft radius (use >1 for a wider-than-shaft yarn stop).
   */
  pegCapRadiusMultiple: number
  edgeFilletMm: number
  pegAttachMode: PegAttachMode
}

export interface FieldOverrideState {
  pegSpacing: boolean
  pegDiameter: boolean
  pegHeight: boolean
  baseThickness: boolean
  baseWidth: boolean
  edgeFillet: boolean
}

export interface LoomDesignState {
  gaugeStyle: GaugeStyleId
  pegDerivationMode: PegDerivationMode
  params: RoundLoomParamsMm
  fieldOverrides: FieldOverrideState
  displayUnit: 'mm' | 'in'
  buildPlatePresetId: string
  customBuildPlateWidthMm: number
  customBuildPlateDepthMm: number
  showBuildPlate: boolean
  enforceBuildPlateFit: boolean
  /** Camera preset for preview (nice-to-have). */
  cameraPreset: 'iso' | 'top' | 'front'
}

export type ValidationSeverity = 'info' | 'warn' | 'error'

export interface ValidationMessage {
  id: string
  severity: ValidationSeverity
  text: string
}
