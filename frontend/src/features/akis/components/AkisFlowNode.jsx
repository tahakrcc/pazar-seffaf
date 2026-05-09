import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import { AkisStepMiniModel } from './AkisStepMiniModel.jsx'

/** Yatay disk düzlemi (XZ) */
const LIE_FLAT = -Math.PI / 2

export function AkisFlowNode({ position, active, color, stepId, stepIndex, smoothIdxRef, onClick }) {
  const mainRingMat = useRef(null)
  const outerTorusMat = useRef(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const s = smoothIdxRef?.current ?? stepIndex
    const focusBlend = THREE.MathUtils.clamp(1 - Math.abs(s - stepIndex) * 0.95, 0, 1)

    let main = 0.07 + focusBlend * 0.4
    let outer = 0.05 + focusBlend * 0.28

    if (active) {
      main = Math.max(main, 0.48 + Math.sin(t * 1.12) * 0.08)
      outer = Math.max(outer, 0.36 + Math.sin(t * 1.12 + 0.35) * 0.06)
    }

    if (mainRingMat.current) mainRingMat.current.emissiveIntensity = main
    if (outerTorusMat.current) outerTorusMat.current.emissiveIntensity = outer
  })

  return (
    <group position={position}>
      <Float speed={active ? 0.32 : 0.14} rotationIntensity={0.008} floatIntensity={active ? 0.04 : 0.018}>
        <group
          onClick={(e) => {
            e.stopPropagation()
            onClick?.(e)
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'default'
          }}
        >
          <group rotation={[LIE_FLAT, 0, 0]}>
            <mesh position={[0, 0.006, 0]} receiveShadow castShadow>
              <circleGeometry args={[0.37, 80]} />
              <meshPhysicalMaterial
                color="#0a1228"
                metalness={0.55}
                roughness={0.28}
                clearcoat={1}
                clearcoatRoughness={0.12}
                reflectivity={0.85}
              />
            </mesh>

            <mesh position={[0, 0.011, 0]} castShadow receiveShadow>
              <ringGeometry args={[0.37, 0.51, 80]} />
              <meshPhysicalMaterial
                ref={mainRingMat}
                color={color}
                emissive={color}
                emissiveIntensity={active ? 0.52 : 0.14}
                metalness={0.92}
                roughness={0.18}
                clearcoat={1}
                clearcoatRoughness={0.1}
              />
            </mesh>

            <mesh position={[0, 0.017, 0]}>
              <torusGeometry args={[0.448, 0.012, 12, 96]} />
              <meshStandardMaterial
                ref={outerTorusMat}
                color={color}
                emissive={color}
                emissiveIntensity={active ? 0.38 : 0.09}
                metalness={1}
                roughness={0.12}
              />
            </mesh>

            <mesh position={[0, 0.003, 0]}>
              <ringGeometry args={[0.2, 0.36, 64]} />
              <meshStandardMaterial color="#020617" metalness={0.3} roughness={0.85} transparent opacity={0.45} />
            </mesh>
          </group>

          <AkisStepMiniModel stepId={stepId} color={color} active={active} />
        </group>
      </Float>
    </group>
  )
}
