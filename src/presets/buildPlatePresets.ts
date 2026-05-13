import type { BuildPlatePreset } from '@/types/loom'

/**
 * XY plate sizes (mm) for fit checking. Where vendors quote multiple volumes (e.g. dual-tool),
 * we include a conservative row in the label.
 */
export const BUILD_PLATE_PRESETS: BuildPlatePreset[] = [
  { id: 'bambu_a1_mini', label: 'Bambu Lab A1 mini', widthMm: 180, depthMm: 180 },
  { id: 'bambu_a1', label: 'Bambu Lab A1', widthMm: 256, depthMm: 256 },
  { id: 'bambu_p1', label: 'Bambu Lab P1P / P1S', widthMm: 256, depthMm: 256 },
  { id: 'bambu_x1', label: 'Bambu Lab X1C / X1E', widthMm: 256, depthMm: 256 },
  {
    id: 'bambu_h2d_dual',
    label: 'Bambu Lab H2D (dual nozzle, conservative)',
    widthMm: 300,
    depthMm: 320,
  },
  {
    id: 'bambu_h2d_single',
    label: 'Bambu Lab H2D (single nozzle)',
    widthMm: 325,
    depthMm: 320,
  },
  {
    id: 'bambu_h2d_bed',
    label: 'Bambu Lab H2D (heatbed footprint)',
    widthMm: 350,
    depthMm: 320,
  },
  { id: 'prusa_mini', label: 'Original Prusa MINI / MINI+', widthMm: 180, depthMm: 180 },
  { id: 'prusa_mk4', label: 'Original Prusa MK4 / MK4S / MK3S+ (i3 bed)', widthMm: 250, depthMm: 210 },
  { id: 'prusa_core_one', label: 'Prusa CORE One / CORE One+', widthMm: 250, depthMm: 220 },
  { id: 'prusa_core_one_l', label: 'Prusa CORE One L', widthMm: 300, depthMm: 300 },
  { id: 'prusa_xl', label: 'Original Prusa XL', widthMm: 360, depthMm: 360 },
  { id: 'snapmaker_u1', label: 'Snapmaker U1', widthMm: 270, depthMm: 270 },
  { id: 'generic_220', label: 'Generic 220', widthMm: 220, depthMm: 220 },
  { id: 'generic_300', label: 'Generic 300', widthMm: 300, depthMm: 300 },
  { id: 'custom', label: 'Custom', widthMm: 220, depthMm: 220 },
]

const FALLBACK_PRESET_ID = 'generic_220'

export function resolveBuildPlate(
  presetId: string,
  customW: number,
  customD: number,
): BuildPlatePreset {
  if (presetId === 'custom') {
    return {
      id: 'custom',
      label: 'Custom',
      widthMm: Math.max(1, customW),
      depthMm: Math.max(1, customD),
    }
  }
  return (
    BUILD_PLATE_PRESETS.find((p) => p.id === presetId) ??
    BUILD_PLATE_PRESETS.find((p) => p.id === FALLBACK_PRESET_ID) ??
    BUILD_PLATE_PRESETS[0]
  )
}
