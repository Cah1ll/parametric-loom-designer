/**
 * Round + slab boards: rake = single straight peg row; rectangular = pegs on a rectangular frame.
 * Press-fit / threaded peg assemblies - keep merge entrypoints stable for STL + preview.
 */
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { RoundLoomParamsMm } from '@/types/loom'
import { createLoomBaseGeometry } from '@/geometry/createLoomBase'
import { createPegGeometry } from '@/geometry/createPeg'
import { calculatePegInstanceMatrices } from '@/geometry/calculatePegPositions'
import { prepareGeometryForLoomMerge } from '@/geometry/prepareForMerge'

export function createRoundLoomMergedGeometry(params: RoundLoomParamsMm): THREE.BufferGeometry {
  const baseRaw = createLoomBaseGeometry(params)
  const base = prepareGeometryForLoomMerge(baseRaw)
  baseRaw.dispose()

  const pegRaw = createPegGeometry(params)
  const pegTemplate = prepareGeometryForLoomMerge(pegRaw)
  pegRaw.dispose()

  const pegMats = calculatePegInstanceMatrices(params)
  const parts: THREE.BufferGeometry[] = [base]

  for (const mat of pegMats) {
    const g = pegTemplate.clone()
    g.applyMatrix4(mat)
    parts.push(g)
  }

  const merged = mergeGeometries(parts, false)
  for (const g of parts) g.dispose()
  pegTemplate.dispose()

  if (!merged) {
    throw new Error(
      'Could not merge loom geometry (incompatible mesh buffers). Try toggling shape or base settings.',
    )
  }

  merged.computeVertexNormals()
  return merged
}
