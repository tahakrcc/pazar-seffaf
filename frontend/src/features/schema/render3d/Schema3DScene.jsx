import { Suspense, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, OrbitControls, Billboard, Text as DreiText, Edges, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { vendorForStall, stallHasFilterProduct } from '../model/layoutSelectors.js'

/* ─── Sabitler ─── */
const SCALE = 0.018
const WALL_H = 1.6
const STALL_H = 0.72
const STALL_COUNTER_H = 0.08
const AWNING_H = 0.03
const TARTI_H = 0.55
const FLOOR_COLOR = '#e8eef5'
const WALL_BASE = '#c2b8a8'
const WALL_CAP = '#8a8278'

/* ─── Malzemeler ─── */
const floorMat = <meshStandardMaterial color={FLOOR_COLOR} roughness={0.9} metalness={0} />
const wallMat = <meshPhysicalMaterial color={WALL_BASE} roughness={0.78} metalness={0.06} clearcoat={0.1} clearcoatRoughness={0.4} />
const wallCapMat = <meshPhysicalMaterial color={WALL_CAP} roughness={0.85} metalness={0.04} />

/* ─── Animasyonlu filtre halesi ─── */
function FilterPulseRing({ radius, color, active }) {
  const meshRef = useRef()
  useFrame(({ clock }) => {
    const m = meshRef.current?.material
    if (!m || !active) return
    m.opacity = 0.35 + Math.sin(clock.elapsedTime * 3) * 0.2
  })
  if (!active) return null
  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
      <ringGeometry args={[radius * 0.78, radius, 40]} />
      <meshBasicMaterial color={color} transparent toneMapped={false} depthWrite={false} opacity={0.5} />
    </mesh>
  )
}

/* ─── Filtre Pin ─── */
function FilterPin({ y, color }) {
  return (
    <Billboard position={[0, y + 0.45, 0]} follow lockX={false} lockY={false} lockZ={false}>
      <mesh>
        <sphereGeometry args={[0.065, 18, 18]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
    </Billboard>
  )
}

/* ─── Duvar ─── */
function Wall({ node }) {
  const dx = node.x2 - node.x1
  const dz = node.y2 - node.y1
  const len = Math.sqrt(dx * dx + dz * dz) * SCALE
  const angle = Math.atan2(dz, dx)
  const cx = ((node.x1 + node.x2) / 2) * SCALE
  const cz = ((node.y1 + node.y2) / 2) * SCALE
  const t = Math.max(0.06, (node.thickness || 4) * SCALE)

  return (
    <group position={[cx, 0, cz]} rotation={[0, -angle, 0]}>
      {/* Gövde */}
      <mesh position={[0, WALL_H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[len, WALL_H, t]} />
        {wallMat}
      </mesh>
      {/* Üst başlık */}
      <mesh position={[0, WALL_H + 0.03, 0]} castShadow>
        <boxGeometry args={[len + 0.04, 0.06, t + 0.04]} />
        {wallCapMat}
      </mesh>
      {/* Alt süpürgelik */}
      <mesh position={[0, 0.04, t * 0.35]} receiveShadow>
        <boxGeometry args={[len + 0.02, 0.08, t * 0.8]} />
        {wallCapMat}
      </mesh>
    </group>
  )
}

/* ─── Giriş / Çıkış ─── */
function Opening({ node, color }) {
  const w = Math.max(node.w * SCALE, 0.3)
  const d = Math.max(node.h * SCALE, 0.3)
  const cx = (node.x + node.w / 2) * SCALE
  const cz = (node.y + node.h / 2) * SCALE
  const rot = ((-Number(node.rotation) || 0) * Math.PI) / 180
  const gapW = w * 0.6
  const postW = (w - gapW) / 2
  const pilH = WALL_H * 0.88

  const stoneMat = <meshPhysicalMaterial color="#c8bfb2" roughness={0.8} metalness={0.05} clearcoat={0.06} />
  const accentMat = <meshPhysicalMaterial color={color} roughness={0.45} metalness={0.12} emissive={color} emissiveIntensity={0.05} />

  return (
    <group position={[cx, 0, cz]} rotation={[0, rot, 0]}>
      {/* Zemin işareti */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color={color} roughness={0.5} transparent opacity={0.15} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, 0]}>
        <ringGeometry args={[gapW * 0.38, gapW * 0.44, 28]} />
        <meshStandardMaterial color={color} transparent opacity={0.4} />
      </mesh>
      {/* Sütunlar */}
      {[-w / 2 + postW / 2, w / 2 - postW / 2].map((px, i) => (
        <mesh key={i} position={[px, pilH / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[postW * 0.85, pilH, Math.min(d * 0.4, 0.2)]} />
          {stoneMat}
        </mesh>
      ))}
      {/* Üst lento */}
      <mesh position={[0, pilH + 0.03, 0]} castShadow>
        <boxGeometry args={[gapW + postW * 1.3, 0.06, Math.min(d * 0.35, 0.18)]} />
        {stoneMat}
      </mesh>
      {/* Tente */}
      <mesh position={[0, pilH + 0.08, d * 0.15]} rotation={[0.12, 0, 0]} castShadow>
        <boxGeometry args={[gapW * 1.05, AWNING_H, d * 0.5]} />
        {accentMat}
      </mesh>
    </group>
  )
}

/* ─── Tartı ─── */
function Tarti({ node }) {
  const w = Math.max(0.2, node.w * SCALE)
  const d = Math.max(0.2, node.h * SCALE)
  const cx = (node.x + node.w / 2) * SCALE
  const cz = (node.y + node.h / 2) * SCALE
  const rot = ((-Number(node.rotation) || 0) * Math.PI) / 180

  return (
    <group position={[cx, 0, cz]} rotation={[0, rot, 0]}>
      {/* Gövde */}
      <mesh position={[0, TARTI_H * 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.88, TARTI_H * 0.55, d * 0.7]} />
        <meshPhysicalMaterial color="#0ea5e9" roughness={0.3} metalness={0.3} clearcoat={0.6} clearcoatRoughness={0.2} />
      </mesh>
      {/* Ekran */}
      <mesh position={[0, TARTI_H * 0.65, d * 0.15]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[w * 0.5, TARTI_H * 0.22, 0.02]} />
        <meshPhysicalMaterial color="#e0f2fe" roughness={0.2} metalness={0.15} emissive="#bfdbfe" emissiveIntensity={0.15} />
      </mesh>
      {/* Tartı tablası */}
      <mesh position={[0, TARTI_H * 0.62, 0]} castShadow>
        <cylinderGeometry args={[w * 0.42, w * 0.42, 0.04, 24]} />
        <meshPhysicalMaterial color="#cbd5e1" roughness={0.25} metalness={0.7} />
      </mesh>
    </group>
  )
}

/* ─── Tezgah ─── */
function Stall({ node, vendors, selectedFilterProducts, selectedStall, onSelectStall }) {
  const w = Math.max(0.2, node.w * SCALE)
  const d = Math.max(0.2, node.h * SCALE)
  const cx = (node.x + node.w / 2) * SCALE
  const cz = (node.y + node.h / 2) * SCALE
  const rot = ((-Number(node.rotation) || 0) * Math.PI) / 180

  const cellVendor = vendorForStall(node, vendors)
  const filterOn = Array.isArray(selectedFilterProducts) && selectedFilterProducts.length > 0
  const filterHit = Boolean(filterOn && stallHasFilterProduct(cellVendor, selectedFilterProducts))
  const stallDimmed = Boolean(filterOn && !filterHit)
  const stallSelected = Boolean(selectedStall && selectedStall.id === node.id)

  const hasVendor = Boolean(cellVendor)

  // Renkler
  const baseColor = useMemo(() => {
    if (stallDimmed) return new THREE.Color('#a0a0a0')
    if (hasVendor) return new THREE.Color('#6b4226')
    return new THREE.Color('#78716c')
  }, [stallDimmed, hasVendor])

  const topColor = stallDimmed ? '#d8d8d8' : '#f5ebe0'
  const awningColor = stallDimmed ? '#e2e8f0' : hasVendor ? '#fcd34d' : '#fecaca'
  const accent = filterHit ? new THREE.Color('#10b981') : stallSelected ? new THREE.Color('#0ea5e9') : null
  const emissive = accent || new THREE.Color('#000000')
  const emissiveInt = stallDimmed ? 0 : filterHit ? 0.15 : stallSelected ? 0.1 : 0

  const scaleBoost = stallDimmed ? 0.9 : filterHit ? 1.06 : stallSelected ? 1.04 : 1
  const showGlow = !!(filterHit || stallSelected) && accent

  return (
    <group
      position={[cx, 0, cz]}
      rotation={[0, rot, 0]}
      scale={scaleBoost}
      onClick={(e) => {
        e.stopPropagation()
        const vid = cellVendor?.id ?? node.vendorId
        const active = Boolean(selectedStall && selectedStall.id === node.id)
        onSelectStall?.(active ? null : { ...node, vendorId: vid })
      }}
      onPointerOver={() => { document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'default' }}
    >
      {/* Filtre halesi */}
      {showGlow && (
        <>
          <FilterPulseRing radius={Math.max(w, d) * 0.65} color={accent} active />
          <FilterPin y={STALL_H} color={accent} />
        </>
      )}

      {/* Alt platform */}
      <mesh position={[0, 0.05, 0]} receiveShadow castShadow={!stallDimmed}>
        <boxGeometry args={[w * 1.02, 0.1, d * 1.02]} />
        <meshPhysicalMaterial color={baseColor.clone().multiplyScalar(0.65)} roughness={stallDimmed ? 0.9 : 0.7} metalness={0.05} />
      </mesh>

      {/* Ana gövde */}
      <mesh position={[0, STALL_H * 0.4, d * 0.15]} castShadow={!stallDimmed} receiveShadow>
        <boxGeometry args={[w * 0.92, STALL_H * 0.62, d * 0.55]} />
        <meshPhysicalMaterial
          color={baseColor}
          roughness={stallDimmed ? 0.85 : 0.55}
          metalness={0.08}
          emissive={emissive}
          emissiveIntensity={emissiveInt * 0.6}
          clearcoat={stallDimmed ? 0 : 0.3}
          clearcoatRoughness={0.3}
        />
      </mesh>

      {/* Tezgah üstü */}
      <mesh position={[0, STALL_H * 0.45, d * 0.15]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.96, STALL_COUNTER_H, d * 0.65]} />
        <meshPhysicalMaterial
          color={topColor}
          roughness={stallDimmed ? 0.8 : 0.3}
          metalness={0.12}
          clearcoat={stallDimmed ? 0 : 0.5}
          emissive={emissive}
          emissiveIntensity={emissiveInt * 0.2}
        />
      </mesh>

      {/* Arka duvar */}
      <mesh position={[0, STALL_H * 0.5, -d * 0.35]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.88, STALL_H * 0.85, 0.05]} />
        <meshPhysicalMaterial color={baseColor.clone().multiplyScalar(0.7)} roughness={0.7} metalness={0.05} />
      </mesh>

      {/* Tente */}
      <mesh position={[0, STALL_H * 0.9, d * 0.02]} rotation={[0.2, 0, 0]} castShadow>
        <boxGeometry args={[w * 1.1, AWNING_H, d * 0.72]} />
        <meshPhysicalMaterial color={awningColor} roughness={0.65} metalness={0} side={THREE.DoubleSide} />
      </mesh>

      {/* Ürün kutuları (esnaf varsa) */}
      {hasVendor && !stallDimmed && (
        <>
          <mesh position={[-w * 0.18, STALL_H * 0.5, d * 0.1]} castShadow>
            <boxGeometry args={[w * 0.22, 0.08, d * 0.18]} />
            <meshStandardMaterial color="#a3e635" roughness={0.6} />
          </mesh>
          <mesh position={[w * 0.15, STALL_H * 0.5, d * 0.05]} castShadow>
            <boxGeometry args={[w * 0.18, 0.07, d * 0.16]} />
            <meshStandardMaterial color="#fb923c" roughness={0.6} />
          </mesh>
          <mesh position={[0, STALL_H * 0.5, d * 0.22]} castShadow>
            <boxGeometry args={[w * 0.2, 0.06, d * 0.12]} />
            <meshStandardMaterial color="#f87171" roughness={0.6} />
          </mesh>
        </>
      )}
    </group>
  )
}

/* ─── Işıklandırma ─── */
function Lights() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <hemisphereLight args={['#f0f4f8', '#64748b', 0.5]} />
      <directionalLight
        castShadow
        position={[12, 16, 10]}
        intensity={1.2}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.0002}
      />
      <directionalLight position={[-8, 5, -4]} intensity={0.3} />
    </>
  )
}

/* ─── Layout → Sahneler ─── */
function LayoutScene({ layout, vendors, selectedFilterProducts, selectedStall, onSelectStall }) {
  const nodes = layout.nodes
  const cx = (layout.width * SCALE) / 2
  const cz = (layout.height * SCALE) / 2

  const entrColor = useMemo(() => new THREE.Color('#10b981'), [])
  const exitColor = useMemo(() => new THREE.Color('#f97316'), [])

  return (
    <group position={[-cx, 0, -cz]}>
      {/* Zemin */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, -0.005, cz]} receiveShadow>
        <planeGeometry args={[layout.width * SCALE + 0.4, layout.height * SCALE + 0.4]} />
        <meshStandardMaterial color={FLOOR_COLOR} roughness={0.92} />
      </mesh>
      {/* Zemin kenar */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, -0.008, cz]}>
        <planeGeometry args={[layout.width * SCALE + 0.6, layout.height * SCALE + 0.6]} />
        <meshStandardMaterial color="#c7d6e8" roughness={0.95} transparent opacity={0.3} />
      </mesh>
      {/* Zemin ızgarası — noktasal */}
      {(() => {
        const gridSize = layout.width * SCALE
        const step = 0.5
        const dots = []
        for (let gx = -gridSize / 2; gx <= gridSize / 2; gx += step) {
          for (let gz = -gridSize / 2; gz <= gridSize / 2; gz += step) {
            dots.push(
              <mesh key={`${gx},${gz}`} position={[cx + gx, -0.003, cz + gz]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.012, 6]} />
                <meshBasicMaterial color="#b0bec5" transparent opacity={0.3} />
              </mesh>,
            )
          }
        }
        return dots
      })()}

      {/* Elemanlar */}
      {nodes.map((node) => {
        if (node.kind === 'wall') return <Wall key={node.id} node={node} />
        if (node.kind === 'entrance') return <Opening key={node.id} node={node} color={entrColor} />
        if (node.kind === 'exit') return <Opening key={node.id} node={node} color={exitColor} />
        if (node.kind === 'tarti') return <Tarti key={node.id} node={node} />
        return (
          <Stall
            key={node.id}
            node={node}
            vendors={vendors}
            selectedFilterProducts={selectedFilterProducts}
            selectedStall={selectedStall}
            onSelectStall={onSelectStall}
          />
        )
      })}
    </group>
  )
}

/* ─── Ana 3D Bileşen ─── */
export default function Schema3DScene({
  layout,
  vendors,
  selectedFilterProducts = [],
  selectedStall,
  onSelectStall,
}) {
  return (
    <div className="schema-3d-scene">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [5, 8, 5], fov: 45 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        onCreated={({ gl }) => {
          gl.shadowMap.type = THREE.PCFSoftShadowMap
        }}
      >
        <color attach="background" args={['#f0f5fa']} />
        <fog attach="fog" args={['#f0f5fa', 18, 45]} />
        <Lights />
        <Suspense fallback={null}>
          <Environment preset="city" environmentIntensity={0.35} />
        </Suspense>
        <Suspense fallback={null}>
          <LayoutScene
            layout={layout}
            vendors={vendors}
            selectedFilterProducts={selectedFilterProducts}
            selectedStall={selectedStall}
            onSelectStall={onSelectStall}
          />
        </Suspense>
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.06}
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI / 2.15}
          minDistance={2}
          maxDistance={22}
          enablePan
          panSpeed={0.8}
        />
      </Canvas>
    </div>
  )
}
