import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { BuildPlatePreview } from '@/components/BuildPlatePreview'
import { useLoomDesigner } from '@/context/LoomDesignerContext'
import { useTheme, type Theme } from '@/context/ThemeContext'
import { createLoomBaseGeometry } from '@/geometry/createLoomBase'
import { createPegGeometry } from '@/geometry/createPeg'
import { calculatePegInstanceMatrices } from '@/geometry/calculatePegPositions'

function CameraRig() {
  const { camera } = useThree()
  const { state } = useLoomDesigner()

  useLayoutEffect(() => {
    const iso = new THREE.Vector3(190, 150, 210)
    const top = new THREE.Vector3(0, 320, 0.0001)
    const front = new THREE.Vector3(0, 90, 280)
    const target = state.cameraPreset === 'top' ? top : state.cameraPreset === 'front' ? front : iso
    camera.position.copy(target)
    camera.near = 0.1
    camera.far = 2500
    camera.updateProjectionMatrix()
    camera.lookAt(0, 40, 0)
  }, [camera, state.cameraPreset])

  return null
}

function LoomMeshes() {
  const { state } = useLoomDesigner()
  const params = state.params

  const baseGeo = useMemo(() => createLoomBaseGeometry(params), [params])
  const pegGeo = useMemo(() => createPegGeometry(params), [params])
  const matrices = useMemo(() => calculatePegInstanceMatrices(params), [params])

  useEffect(() => () => baseGeo.dispose(), [baseGeo])
  useEffect(() => () => pegGeo.dispose(), [pegGeo])

  const imRef = useRef<THREE.InstancedMesh>(null)
  const pegMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#c7d2e3',
        metalness: 0.22,
        roughness: 0.38,
      }),
    [],
  )

  useEffect(
    () => () => {
      pegMat.dispose()
    },
    [pegMat],
  )

  useLayoutEffect(() => {
    const im = imRef.current
    if (!im) return
    matrices.forEach((mat, i) => im.setMatrixAt(i, mat))
    im.instanceMatrix.needsUpdate = true
  }, [matrices])

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <mesh geometry={baseGeo} castShadow receiveShadow>
        <meshStandardMaterial color="#2f3b52" metalness={0.18} roughness={0.45} />
      </mesh>
      <instancedMesh
        key={`${params.shape}-${matrices.length}-${params.pegHeightMm}-${params.pegDiameterMm}-${params.pegTipStyle}-${params.pegCapRadiusMultiple}-${params.baseThicknessMm}`}
        ref={imRef}
        args={[pegGeo, pegMat, matrices.length]}
        castShadow
        receiveShadow
      />
    </group>
  )
}

function Scene({
  orbitRef,
  theme,
}: {
  orbitRef: React.MutableRefObject<unknown>
  theme: Theme
}) {
  const { state, buildPlate, validationMessages } = useLoomDesigner()
  const warn = validationMessages.some((m) => m.id === 'bed_oversize')
  const isLight = theme === 'light'

  return (
    <>
      <color attach="background" args={[isLight ? '#d8e2f0' : '#07090e']} />
      <ambientLight intensity={isLight ? 0.52 : 0.35} />
      <directionalLight castShadow position={[120, 220, 80]} intensity={isLight ? 0.88 : 1.05} />
      <hemisphereLight args={isLight ? ['#f8fafc', '#c5d0e3', 0.48] : ['#dbeafe', '#0b1220', 0.35]} />
      <CameraRig />
      <LoomMeshes />
      {state.showBuildPlate ? (
        <BuildPlatePreview
          widthMm={buildPlate.widthMm}
          depthMm={buildPlate.depthMm}
          warn={warn}
          theme={theme}
        />
      ) : null}
      <OrbitControls
        ref={orbitRef as never}
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={40}
        maxDistance={900}
        target={[0, 40, 0]}
      />
    </>
  )
}

function ContactShadow({ theme }: { theme: Theme }) {
  const mesh = useRef<THREE.Mesh>(null)
  const opacity = theme === 'light' ? 0.11 : 0.22
  useFrame(({ clock }) => {
    const m = mesh.current
    if (!m) return
    m.scale.setScalar(1 + Math.sin(clock.elapsedTime * 0.6) * 0.002)
  })
  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.88, 0]} receiveShadow>
      <circleGeometry args={[420, 64]} />
      <meshStandardMaterial transparent opacity={opacity} color="#000000" />
    </mesh>
  )
}

export function LoomPreview() {
  const orbitRef = useRef<unknown>(null)
  const { theme } = useTheme()
  const { state, dispatch, validationMessages } = useLoomDesigner()
  const plateFits = !validationMessages.some((m) => m.id === 'bed_oversize')

  return (
    <div className="viewport">
      <div className="viewport__canvas">
        <Canvas shadows camera={{ fov: 42, near: 0.1, far: 2500 }}>
          <Scene orbitRef={orbitRef} theme={theme} />
          <ContactShadow theme={theme} />
        </Canvas>
      </div>
      <div className="viewport__hud">
        <div className="hud-row">
          <span className={`hud-pill ${plateFits ? 'hud-pill--ok' : 'hud-pill--bad'}`}>
            {plateFits ? 'Within plate (XY)' : 'Larger than plate'}
          </span>
          <span className="hud-pill hud-pill--ghost mono">
            {state.params.pegCount} pegs - {state.params.baseOuterDiameterMm.toFixed(1)} mm OD
          </span>
        </div>
        <div className="hud-actions">
          <div className="segmented">
            <button
              type="button"
              className={state.cameraPreset === 'iso' ? 'is-active' : ''}
              onClick={() => dispatch({ type: 'set_camera_preset', preset: 'iso' })}
            >
              Iso
            </button>
            <button
              type="button"
              className={state.cameraPreset === 'top' ? 'is-active' : ''}
              onClick={() => dispatch({ type: 'set_camera_preset', preset: 'top' })}
            >
              Top
            </button>
            <button
              type="button"
              className={state.cameraPreset === 'front' ? 'is-active' : ''}
              onClick={() => dispatch({ type: 'set_camera_preset', preset: 'front' })}
            >
              Front
            </button>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn--sm"
            onClick={() => {
              const ctrl = orbitRef.current as { reset?: () => void } | null
              ctrl?.reset?.()
            }}
          >
            Reset orbit
          </button>
        </div>
      </div>
    </div>
  )
}
