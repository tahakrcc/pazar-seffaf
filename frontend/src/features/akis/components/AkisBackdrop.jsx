import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'

/** Uzak küre vignet + yüzen parçacık — sahne arkası efekt */
export function AkisBackdrop() {
  const meshRef = useRef(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (!meshRef.current) return
    const hue = 0.55 + Math.sin(t * 0.12) * 0.035
    const col = meshRef.current.material.color
    col.setHSL(hue, 0.62, 0.08 + Math.sin(t * 0.18) * 0.025)
    meshRef.current.rotation.y += 0.00035
    meshRef.current.rotation.x += 0.00012
  })

  return (
    <group>
      <mesh ref={meshRef} scale={[-1, 1, 1]} renderOrder={-10}>
        <sphereGeometry args={[120, 32, 32]} />
        <meshBasicMaterial side={THREE.BackSide} toneMapped={false} depthWrite={false} color="#040a14" />
      </mesh>
      <Sparkles count={480} scale={26} size={2.8} speed={0.22} opacity={0.52} color="#93c5fd" />
      <Sparkles count={220} scale={18} position={[6, -2, -8]} size={1.6} speed={0.35} opacity={0.28} color="#c4b5fd" />
      <Sparkles count={220} scale={14} position={[-7, -1, 5]} size={2} speed={0.28} opacity={0.33} color="#5eead4" />
    </group>
  )
}
