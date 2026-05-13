import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { RoundLoomParamsMm } from '@/types/loom'

/** Peg stands on XY plane, grows along +Z; bottom at z=0. */
export function createPegGeometry(params: RoundLoomParamsMm): THREE.BufferGeometry {
  const r = params.pegDiameterMm / 2
  const h = params.pegHeightMm
  const segs = Math.max(16, Math.min(48, Math.round(params.pegDiameterMm * 4)))
  const style = params.pegTipStyle

  if (style === 'flat') {
    const shaft = new THREE.CylinderGeometry(r * 0.98, r, h, segs, 1, false)
    shaft.rotateX(Math.PI / 2)
    shaft.translate(0, 0, h / 2)
    shaft.computeVertexNormals()
    return shaft
  }

  if (style === 'rounded') {
    return createRoundedTopPegLathe(r, h, segs)
  }

  // spherical - large cap, radius typically > shaft radius (material / yarn stop)
  const capMul = Math.max(1.02, Math.min(1.35, params.pegCapRadiusMultiple))
  const capR = r * capMul
  const shaftH = Math.max(h - capR, h * 0.12)
  const shaft = new THREE.CylinderGeometry(r * 0.98, r, shaftH, segs, 1, false)
  shaft.rotateX(Math.PI / 2)
  shaft.translate(0, 0, shaftH / 2)

  const cap = new THREE.SphereGeometry(capR, segs, Math.ceil(segs / 2))
  cap.translate(0, 0, h - capR)

  const merged = mergeGeometries([shaft, cap], false)
  shaft.dispose()
  cap.dispose()
  if (!merged) {
    throw new Error('Could not merge peg geometry.')
  }
  merged.computeVertexNormals()
  return merged
}

/** Lathe solid: shaft + quarter-torus profile on the outer top corner (rounded, not a full dome). */
function createRoundedTopPegLathe(r: number, h: number, segs: number): THREE.BufferGeometry {
  let fillet = Math.min(r * 0.34, h * 0.24, 3.8)
  fillet = Math.min(fillet, h * 0.38)
  const z0 = h - fillet
  const arcSeg = Math.max(10, Math.round(fillet * 6))
  const pts: THREE.Vector2[] = []

  pts.push(new THREE.Vector2(0.02, 0))
  pts.push(new THREE.Vector2(r * 0.98, 0))
  pts.push(new THREE.Vector2(r * 0.98, z0))
  pts.push(new THREE.Vector2(r, z0))

  for (let i = 0; i <= arcSeg; i++) {
    const u = (i / arcSeg) * (Math.PI / 2)
    const rad = r - fillet + fillet * Math.cos(u)
    const z = z0 + fillet * Math.sin(u)
    pts.push(new THREE.Vector2(rad, z))
  }

  pts.push(new THREE.Vector2(0.02, h))

  const geo = new THREE.LatheGeometry(pts, segs)
  geo.rotateX(Math.PI / 2)
  geo.computeBoundingBox()
  const bb = geo.boundingBox
  if (bb) {
    geo.translate(0, 0, -bb.min.z)
  }
  geo.computeVertexNormals()
  return geo
}
