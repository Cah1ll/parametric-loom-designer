import { Edges } from '@react-three/drei'
import type { Theme } from '@/context/ThemeContext'

export function BuildPlatePreview({
  widthMm,
  depthMm,
  warn,
  theme,
}: {
  widthMm: number
  depthMm: number
  warn: boolean
  theme: Theme
}) {
  const light = theme === 'light'
  const plateColor = warn ? (light ? '#fff1f2' : '#3a2428') : light ? '#eef2f9' : '#141a24'
  const edgeColor = warn ? (light ? '#e11d48' : '#f97373') : light ? '#0d9f84' : '#6ee7c5'

  return (
    <group position={[0, -0.9, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[widthMm, depthMm]} />
        <meshStandardMaterial
          color={plateColor}
          metalness={0.05}
          roughness={light ? 0.82 : 0.9}
          transparent
          opacity={light ? 0.65 : 0.55}
        />
        <Edges color={edgeColor} />
      </mesh>
    </group>
  )
}
