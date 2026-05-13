import type { GaugePreset } from '@/types/loom'

export const GAUGE_PRESETS: GaugePreset[] = [
  {
    id: 'fine',
    label: 'Fine',
    description: 'Thinner yarn, socks, small projects, tighter stitches.',
    pegSpacingMm: { min: 8, max: 10, default: 9 },
    pegDiameterMm: { min: 4, max: 5, default: 4.5 },
  },
  {
    id: 'regular',
    label: 'Regular',
    description: 'Hats, scarves, general loom knitting.',
    pegSpacingMm: { min: 11, max: 14, default: 12.5 },
    pegDiameterMm: { min: 5, max: 6, default: 5.5 },
  },
  {
    id: 'chunky',
    label: 'Chunky',
    description: 'Thick yarn, blanket rails, and chunky scarves.',
    pegSpacingMm: { min: 14, max: 24, default: 18 },
    pegDiameterMm: { min: 7, max: 12, default: 9 },
  },
  {
    id: 'custom',
    label: 'Custom',
    description: 'You control spacing and peg dimensions.',
    pegSpacingMm: { min: 6, max: 40, default: 12 },
    pegDiameterMm: { min: 3, max: 12, default: 5.5 },
  },
]

export function getGaugePreset(id: string): GaugePreset | undefined {
  return GAUGE_PRESETS.find((g) => g.id === id)
}
