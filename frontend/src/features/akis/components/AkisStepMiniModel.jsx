import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

function phys(accent, active, overrides = {}) {
  return {
    color: accent,
    metalness: 0.88,
    roughness: 0.22,
    emissive: accent,
    emissiveIntensity: active ? 0.22 : 0.06,
    ...overrides,
  }
}

/** Halka üzerinde küçük prosedürel 3D — CDN / emoji yok */
export function AkisStepMiniModel({ stepId, color, active }) {
  const root = useRef(null)

  useFrame((_, dt) => {
    if (!root.current) return
    const spd = active ? 0.55 : 0.2
    root.current.rotation.y += dt * spd
  })

  const m = phys(color, active)

  switch (stepId) {
    case 'citizen':
      return (
        <group ref={root} position={[0, 0.38, 0]} scale={active ? 1.05 : 0.94}>
          <mesh castShadow position={[0, 0.04, 0]}>
            <boxGeometry args={[0.44, 0.16, 0.32]} />
            <meshPhysicalMaterial {...m} clearcoat={0.9} />
          </mesh>
          <mesh castShadow position={[-0.15, -0.12, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.06, 16]} />
            <meshPhysicalMaterial {...m} />
          </mesh>
          <mesh castShadow position={[0.15, -0.12, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.06, 16]} />
            <meshPhysicalMaterial {...m} />
          </mesh>
          <mesh castShadow position={[0, 0.18, -0.2]}>
            <boxGeometry args={[0.06, 0.22, 0.14]} />
            <meshPhysicalMaterial {...phys(color, active, { metalness: 0.96 })} />
          </mesh>
        </group>
      )

    case 'market':
      return (
        <group ref={root} position={[0, 0.34, 0]} scale={active ? 1.06 : 0.93}>
          <mesh castShadow position={[0, 0.06, 0]}>
            <boxGeometry args={[0.52, 0.2, 0.36]} />
            <meshPhysicalMaterial {...m} />
          </mesh>
          <mesh castShadow position={[0, 0.28, -0.04]} rotation={[0.72, 0, 0]}>
            <boxGeometry args={[0.58, 0.04, 0.52]} />
            <meshPhysicalMaterial {...phys(color, active, { roughness: 0.45 })} />
          </mesh>
          <mesh castShadow position={[0, -0.18, -0.2]}>
            <cylinderGeometry args={[0.22, 0.24, 0.28, 6]} />
            <meshPhysicalMaterial {...m} roughness={0.35} />
          </mesh>
        </group>
      )

    case 'vendor':
      return (
        <group ref={root} position={[0, 0.34, 0]} scale={active ? 1.08 : 0.93}>
          <mesh castShadow position={[0, -0.06, 0]} rotation={[0, Math.PI / 4, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 0.72, 8]} />
            <meshPhysicalMaterial {...m} />
          </mesh>
          <mesh castShadow position={[-0.18, -0.12, -0.1]}>
            <sphereGeometry args={[0.09, 20, 20]} />
            <meshPhysicalMaterial {...m} />
          </mesh>
          <mesh castShadow position={[0.18, -0.12, 0.1]}>
            <sphereGeometry args={[0.09, 20, 20]} />
            <meshPhysicalMaterial {...m} />
          </mesh>
          <mesh castShadow position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.2, 0.22, 0.06, 24]} />
            <meshPhysicalMaterial {...phys(color, active, { metalness: 0.6 })} />
          </mesh>
        </group>
      )

    case 'officer':
      return (
        <group ref={root} position={[0, 0.36, 0]} scale={active ? 1.07 : 0.93}>
          <mesh castShadow rotation={[0, Math.PI / 6, 0]} position={[0, 0.12, -0.04]}>
            <boxGeometry args={[0.32, 0.38, 0.06]} />
            <meshPhysicalMaterial {...m} roughness={0.18} />
          </mesh>
          <mesh castShadow rotation={[Math.PI / 6, 0, 0]} position={[0, 0.4, -0.04]}>
            <coneGeometry args={[0.07, 0.14, 4]} />
            <meshPhysicalMaterial {...phys(color, active, { emissiveIntensity: active ? 0.35 : 0.08 })} />
          </mesh>
        </group>
      )

    case 'chief':
      return (
        <group ref={root} position={[0, 0.34, 0]} scale={active ? 1.05 : 0.92}>
          <mesh castShadow position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.32, 0.34, 0.06, 32]} />
            <meshPhysicalMaterial {...m} />
          </mesh>
          <mesh castShadow position={[0, -0.22, -0.1]}>
            <boxGeometry args={[0.4, 0.16, 0.24]} />
            <meshPhysicalMaterial {...m} roughness={0.28} />
          </mesh>
          {[-0.12, 0, 0.12].map((x, j) => (
            <mesh key={j} castShadow position={[x, 0.06, -0.1]}>
              <cylinderGeometry args={[0.06, 0.06, 0.34, 12]} />
              <meshPhysicalMaterial {...phys(color, active, { emissiveIntensity: active ? 0.18 : 0.05 })} />
            </mesh>
          ))}
        </group>
      )

    case 'admin':
      return (
        <group ref={root} position={[0, 0.36, 0]} scale={active ? 1.08 : 0.94}>
          {[0, 1, 2].map((k) => (
            <mesh key={k} castShadow rotation={[Math.PI / 2, k * ((2 * Math.PI) / 3), 0]}>
              <torusGeometry args={[0.26, 0.05, 12, 32]} />
              <meshPhysicalMaterial {...m} />
            </mesh>
          ))}
          <mesh castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.08, 20]} />
            <meshPhysicalMaterial {...phys(color, active, { emissiveIntensity: active ? 0.4 : 0.09 })} />
          </mesh>
        </group>
      )

    case 'backend':
      return (
        <group ref={root} position={[0, 0.38, 0]} scale={active ? 1.06 : 0.93}>
          {[-1, 0, 1].map((yk) => (
            <mesh key={yk} castShadow position={[yk * 0.16, -0.1, 0]}>
              <boxGeometry args={[0.24, 0.44, 0.22]} />
              <meshPhysicalMaterial {...m} />
            </mesh>
          ))}
          <mesh castShadow position={[0, -0.4, -0.12]}>
            <boxGeometry args={[0.8, 0.08, 0.36]} />
            <meshPhysicalMaterial {...phys(color, active, { metalness: 0.94, roughness: 0.12 })} />
          </mesh>
          <mesh castShadow rotation={[Math.PI / 4, Math.PI / 4, 0]} position={[0, 0.22, -0.1]}>
            <torusGeometry args={[0.2, 0.03, 8, 32]} />
            <meshPhysicalMaterial {...phys(color, active, { emissiveIntensity: active ? 0.28 : 0.06 })} />
          </mesh>
        </group>
      )

    default:
      return (
        <mesh ref={root} castShadow position={[0, 0.38, 0]} scale={0.42}>
          <icosahedronGeometry args={[1, 1]} />
          <meshPhysicalMaterial {...m} clearcoat={1} />
        </mesh>
      )
  }
}
