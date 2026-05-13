import * as THREE from 'three'
import type { RoundLoomParamsMm } from '@/types/loom'
import {
  getInnerOpeningDiameterMm,
  getRectangularSlabInnerVoidHalfExtentsMm,
  getSlabOuterCornerRadiusMm,
  isSlabBoardShape,
} from '@/utils/pegSpacing'

function createRoundedRectShape(w: number, h: number, cornerR: number): THREE.Shape {
  const shape = new THREE.Shape()
  const x0 = -w / 2
  const y0 = -h / 2
  const r = Math.max(0.15, Math.min(cornerR, w / 2 - 0.1, h / 2 - 0.1))
  shape.moveTo(x0 + r, y0)
  shape.lineTo(x0 + w - r, y0)
  shape.absarc(x0 + w - r, y0 + r, r, -Math.PI / 2, 0, false)
  shape.lineTo(x0 + w, y0 + h - r)
  shape.absarc(x0 + w - r, y0 + h - r, r, 0, Math.PI / 2, false)
  shape.lineTo(x0 + r, y0 + h)
  shape.absarc(x0 + r, y0 + h - r, r, Math.PI / 2, Math.PI, false)
  shape.lineTo(x0, y0 + r)
  shape.absarc(x0 + r, y0 + r, r, Math.PI, -Math.PI / 2, false)
  return shape
}

/**
 * Inner void for extruded slab; hole path uses clockwise arcs (Three.js hole convention vs CCW outer).
 */
function createRoundedRectHolePath(w: number, h: number, cornerR: number): THREE.Path {
  const path = new THREE.Path()
  const x0 = -w / 2
  const y0 = -h / 2
  const r = Math.max(0.15, Math.min(cornerR, w / 2 - 0.1, h / 2 - 0.1))
  path.moveTo(x0 + r, y0)
  path.lineTo(x0 + w - r, y0)
  path.absarc(x0 + w - r, y0 + r, r, -Math.PI / 2, 0, true)
  path.lineTo(x0 + w, y0 + h - r)
  path.absarc(x0 + w - r, y0 + h - r, r, 0, Math.PI / 2, true)
  path.lineTo(x0 + r, y0 + h)
  path.absarc(x0 + r, y0 + h - r, r, Math.PI / 2, Math.PI, true)
  path.lineTo(x0, y0 + r)
  path.absarc(x0 + r, y0 + r, r, Math.PI, -Math.PI / 2, true)
  return path
}

export function createLoomBaseGeometry(params: RoundLoomParamsMm): THREE.BufferGeometry {
  if (isSlabBoardShape(params.shape)) {
    const w = Math.max(20, params.baseOuterDiameterMm)
    const h = Math.max(12, params.baseWidthMm)
    const fillet = Math.max(0, Math.min(params.edgeFilletMm, params.baseThicknessMm * 0.35, h * 0.35, w * 0.12))
    const outerCornerR = getSlabOuterCornerRadiusMm(params)
    const shape = createRoundedRectShape(w, h, outerCornerR)

    const innerVoid = getRectangularSlabInnerVoidHalfExtentsMm(params)
    const hasInnerVoid = Boolean(innerVoid)

    if (innerVoid) {
      const iw = innerVoid.ix * 2
      const ih = innerVoid.iy * 2
      const innerCornerR = Math.max(
        0.15,
        Math.min(outerCornerR * 0.85, iw * 0.12, ih * 0.12, iw / 2 - 0.15, ih / 2 - 0.15),
      )
      shape.holes.push(createRoundedRectHolePath(iw, ih, innerCornerR))
    }

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: params.baseThicknessMm,
      bevelEnabled: fillet > 0.15 && !hasInnerVoid,
      bevelThickness: fillet * 0.55,
      bevelSize: fillet * 0.55,
      bevelOffset: 0,
      bevelSegments: Math.max(2, Math.round(fillet)),
      curveSegments: 24,
    }
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings)
    geo.computeVertexNormals()
    return geo
  }

  const outerR = params.baseOuterDiameterMm / 2
  const innerR = Math.max(outerR - params.baseWidthMm, 0.5)
  const innerD = getInnerOpeningDiameterMm(params)
  if (innerD <= 0) {
    /** Degenerate placeholder - validation blocks export. */
    return new THREE.CylinderGeometry(outerR, outerR, params.baseThicknessMm, 64, 1, true)
  }

  const shape = new THREE.Shape()
  shape.absarc(0, 0, outerR, 0, Math.PI * 2, false)
  const hole = new THREE.Path()
  hole.absarc(0, 0, innerR, 0, Math.PI * 2, true)
  shape.holes.push(hole)

  const fillet = Math.max(0, Math.min(params.edgeFilletMm, params.baseThicknessMm * 0.35, params.baseWidthMm * 0.35))
  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: params.baseThicknessMm,
    bevelEnabled: fillet > 0.15,
    bevelThickness: fillet * 0.55,
    bevelSize: fillet * 0.55,
    bevelOffset: 0,
    bevelSegments: Math.max(2, Math.round(fillet)),
    curveSegments: 96,
  }

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings)
  geo.computeVertexNormals()
  return geo
}
