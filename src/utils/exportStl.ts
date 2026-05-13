import * as THREE from 'three'
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js'
import type { RoundLoomParamsMm } from '@/types/loom'
import { createRoundLoomMergedGeometry } from '@/geometry/createRoundLoom'

export function exportRoundLoomStlBinary(params: RoundLoomParamsMm): ArrayBuffer {
  const merged = createRoundLoomMergedGeometry(params)
  merged.computeVertexNormals()

  const material = new THREE.MeshBasicMaterial()
  const mesh = new THREE.Mesh(merged, material)
  mesh.updateMatrixWorld(true)
  const exporter = new STLExporter()
  const data: unknown = exporter.parse(mesh, { binary: true })
  material.dispose()
  merged.dispose()

  if (data instanceof DataView) {
    return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
  }
  if (data instanceof ArrayBuffer) return data
  if (typeof data === 'string') {
    const buf = new ArrayBuffer(data.length)
    const view = new Uint8Array(buf)
    for (let i = 0; i < data.length; i++) view[i] = data.charCodeAt(i) & 0xff
    return buf
  }
  throw new Error('Unexpected STL exporter output')
}

export function downloadStl(buffer: ArrayBuffer, filename: string): void {
  const blob = new Blob([buffer], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  /** Revoke after the browser has picked up the navigation; immediate revoke can cancel the download. */
  window.setTimeout(() => URL.revokeObjectURL(url), 4000)
}
