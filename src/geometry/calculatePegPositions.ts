import * as THREE from 'three'
import type { RoundLoomParamsMm } from '@/types/loom'
import {
  getPegPitchRadiusMm,
  getRectangularPegLoopPhaseOffsetU,
  getSlabPegPathLengthMm,
  isRakeSlab,
  isRectangularFrameSlab,
  xyOnRectangularPitchPerimeter,
} from '@/utils/pegSpacing'

function pegInstanceCount(params: RoundLoomParamsMm): number {
  return Math.round(params.pegCount)
}

export function calculatePegInstanceMatrices(params: RoundLoomParamsMm): THREE.Matrix4[] {
  const n = pegInstanceCount(params)
  const m: THREE.Matrix4[] = []
  const baseZ = params.baseThicknessMm

  if (isRakeSlab(params)) {
    const lineLen = getSlabPegPathLengthMm(params)
    const half = lineLen / 2
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0 : i / (n - 1)
      const x = -half + t * lineLen
      const mat = new THREE.Matrix4().makeTranslation(x, 0, baseZ)
      m.push(mat)
    }
    return m
  }

  if (isRectangularFrameSlab(params)) {
    const phase = getRectangularPegLoopPhaseOffsetU(params)
    for (let i = 0; i < n; i++) {
      const u = n <= 0 ? 0 : (((i / n + phase) % 1) + 1) % 1
      const { x, y } = xyOnRectangularPitchPerimeter(params, u)
      m.push(new THREE.Matrix4().makeTranslation(x, y, baseZ))
    }
    return m
  }

  const R = getPegPitchRadiusMm(params)
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const x = Math.cos(a) * R
    const y = Math.sin(a) * R
    const mat = new THREE.Matrix4().makeTranslation(x, y, baseZ)
    m.push(mat)
  }
  return m
}
