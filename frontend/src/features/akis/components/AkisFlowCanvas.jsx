import { useMemo, useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { OrbitControls, Stars, Line, Environment, ContactShadows } from '@react-three/drei'
import { AKIS_NODE_PALETTE } from '../constants/canvasPalette.js'
import { AkisBackdrop } from './AkisBackdrop.jsx'
import { AkisFlowNode } from './AkisFlowNode.jsx'

function interpolateAlongNodes(posVecs, tFloat) {
  const n = posVecs.length
  if (n === 0) return new THREE.Vector3()
  if (n === 1) return posVecs[0].clone()
  const u = THREE.MathUtils.clamp(tFloat, 0, n - 1)
  const fi = Math.floor(u)
  if (fi >= n - 1) return posVecs[n - 1].clone()
  const frac = u - fi
  return posVecs[fi].clone().lerp(posVecs[fi + 1], frac)
}

function EnergyBeam({ from, to, active }) {
  const points = useMemo(() => {
    const v0 = new THREE.Vector3(...from)
    const v1 = new THREE.Vector3(...to)
    const mid = v0.clone().lerp(v1, 0.5).add(new THREE.Vector3(0, 0.18, 0))
    const curve = new THREE.QuadraticBezierCurve3(v0, mid, v1)
    return curve.getPoints(24)
  }, [from, to])

  const opacity = active ? 0.52 : 0.14

  return (
    <Line points={points} color={active ? '#7dd3fc' : '#475569'} lineWidth={active ? 2.35 : 1.15} transparent opacity={opacity} />
  )
}

/** Kamera düğüm yolu üzerinde akıcı kayar — adım sıçraması zamanlayıcıdan bağımsız, animasyon olarak yumuşar */
function CameraRig({ smoothIdxRef, posVecs }) {
  const stash = useRef({
    look: new THREE.Vector3(),
    desiredCam: new THREE.Vector3(),
    curTarget: new THREE.Vector3(),
  })
  const boot = useRef(true)

  useFrame((state, dt) => {
    const s = stash.current
    const idx = smoothIdxRef.current

    s.curTarget.copy(interpolateAlongNodes(posVecs, idx))

    if (boot.current) {
      boot.current = false
      s.look.copy(s.curTarget)
      s.desiredCam.set(s.look.x + 1.25, s.look.y + 5.05, s.look.z + 10.35)
      state.camera.position.copy(s.desiredCam)
      state.camera.lookAt(s.look)
      return
    }

    const lookEase = 1 - Math.exp(-0.55 * dt)
    const camEase = 1 - Math.exp(-0.42 * dt)

    s.look.lerp(s.curTarget, lookEase)
    s.desiredCam.set(s.look.x + 1.25, s.look.y + 5.05, s.look.z + 10.35)
    state.camera.position.lerp(s.desiredCam, camEase)
    state.camera.lookAt(s.look)
  })
  return null
}

/** useFrame sahne içinde olmalı */
function AkisFlowScene({ steps, activeIndex, onSelectStep, positions }) {
  const palette = AKIS_NODE_PALETTE
  const posVecs = useMemo(
    () => positions.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    [positions],
  )

  const smoothIdx = useRef(activeIndex)
  useFrame((_, dt) => {
    smoothIdx.current += (activeIndex - smoothIdx.current) * (1 - Math.exp(-0.58 * dt))
  })

  return (
    <>
      <AkisBackdrop />

      <color attach="background" args={['#030712']} />
      <fog attach="fog" args={['#030712', 24, 60]} />

      <ambientLight intensity={0.3} />
      <hemisphereLight args={['#e0f2fe', '#020617', 0.44]} />
      <directionalLight castShadow position={[12, 20, 10]} intensity={1.02} shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-8, 5, -6]} intensity={0.52} color="#67e8f9" />
      <pointLight position={[6, 2, 8]} intensity={0.32} color="#a78bfa" />
      <Stars radius={90} depth={54} count={1400} factor={2} saturation={0} fade speed={0.1} />

      <Suspense fallback={null}>
        <Environment preset="studio" environmentIntensity={0.48} />
      </Suspense>

      <ContactShadows position={[0, -3.15, 0]} opacity={0.5} scale={72} blur={2.85} far={10} color="#000000" />

      {positions.map((pos, i) => (
        <AkisFlowNode
          key={steps[i].id}
          stepIndex={i}
          smoothIdxRef={smoothIdx}
          position={pos}
          active={i === activeIndex}
          color={palette[i % palette.length]}
          stepId={steps[i].id}
          onClick={() => onSelectStep(i)}
        />
      ))}

      {positions.slice(0, -1).map((_, i) => (
        <EnergyBeam
          key={`beam-${steps[i].id}`}
          from={positions[i]}
          to={positions[i + 1]}
          active={i === activeIndex || i === activeIndex - 1}
        />
      ))}

      <CameraRig smoothIdxRef={smoothIdx} posVecs={posVecs} />
      <OrbitControls
        makeDefault
        enablePan
        enableZoom
        enableRotate
        enableDamping
        dampingFactor={0.028}
        rotateSpeed={0.38}
        zoomSpeed={0.48}
        minPolarAngle={0.42}
        maxPolarAngle={Math.PI / 2.08}
        maxDistance={26}
        minDistance={7}
      />
    </>
  )
}

export default function AkisFlowCanvas({ steps, activeIndex, onSelectStep }) {
  const positions = useMemo(() => {
    const n = steps.length
    if (n === 0) return []
    const radius = 5.35
    const arcDeg = 112
    const arcRad = (arcDeg * Math.PI) / 180
    const start = -arcRad / 2
    return steps.map((_, i) => {
      const u = n === 1 ? 0.5 : i / (n - 1)
      const angle = start + u * arcRad
      const x = Math.sin(angle) * radius
      const z = Math.cos(angle) * radius
      return [x, 0, z]
    })
  }, [steps])

  return (
    <div className="akis-flow-canvas-wrap">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [2, 5.2, 14], fov: 35, near: 0.1, far: 220 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <AkisFlowScene steps={steps} activeIndex={activeIndex} onSelectStep={onSelectStep} positions={positions} />
      </Canvas>
    </div>
  )
}
