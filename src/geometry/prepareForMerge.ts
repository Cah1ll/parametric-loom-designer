import * as THREE from 'three'

/**
 * Make BufferGeometry compatible with `mergeGeometries`: same attribute set (position + normal)
 * and consistently non-indexed. Extrude vs primitive pegs often differ on `uv` and index layout.
 */
export function prepareGeometryForLoomMerge(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
  const g = geometry.clone()
  for (const name of ['uv', 'uv2', 'color', 'tangent']) {
    if (g.getAttribute(name)) g.deleteAttribute(name)
  }

  let prepared: THREE.BufferGeometry
  if (g.index !== null) {
    prepared = g.toNonIndexed()
    g.dispose()
  } else {
    prepared = g
  }

  if (!prepared.getAttribute('normal')) {
    prepared.computeVertexNormals()
  }

  return prepared
}
