"use client";
import { useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';

// 3D Circuit Board Component
function CircuitBoard({ description }: { description: string }) {
  const lowerDesc = description.toLowerCase();

  // PCB Board material
  const pcbMaterial = new THREE.MeshStandardMaterial({
    color: '#1a472a',
    metalness: 0.2,
    roughness: 0.8,
  });

  // Component materials
  const arduinoMaterial = new THREE.MeshStandardMaterial({
    color: '#0ea5e9',
    metalness: 0.3,
    roughness: 0.6,
  });

  const componentMaterial = new THREE.MeshStandardMaterial({
    color: '#1f2937',
    metalness: 0.5,
    roughness: 0.4,
  });

  const ledMaterial = new THREE.MeshStandardMaterial({
    color: '#ef4444',
    emissive: '#ef4444',
    emissiveIntensity: 0.8,
    metalness: 0.7,
    roughness: 0.2,
  });

  const wireMaterial = new THREE.MeshStandardMaterial({
    color: '#fbbf24',
    metalness: 0.9,
    roughness: 0.1,
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Main PCB Board */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[8, 0.1, 6]} />
        <primitive object={pcbMaterial} attach="material" />
      </mesh>

      {/* Arduino Board */}
      <group position={[-2, 0.15, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.8, 0.15, 1.4]} />
          <primitive object={arduinoMaterial} attach="material" />
        </mesh>
        
        {/* USB Port */}
        <mesh position={[-0.95, 0.1, 0]} castShadow>
          <boxGeometry args={[0.1, 0.15, 0.3]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* IC Chip */}
        <mesh position={[0, 0.15, 0]} castShadow>
          <boxGeometry args={[0.6, 0.1, 0.4]} />
          <primitive object={componentMaterial} attach="material" />
        </mesh>

        {/* Pin Headers */}
        {Array.from({ length: 14 }).map((_, i) => (
          <mesh key={`pin-${i}`} position={[-0.8 + i * 0.12, 0.1, 0.75]} castShadow>
            <boxGeometry args={[0.04, 0.1, 0.04]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
          </mesh>
        ))}

        {/* LED Indicators */}
        <mesh position={[0.7, 0.15, 0.3]} castShadow>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial 
            color="#10b981" 
            emissive="#10b981"
            emissiveIntensity={1.2}
            metalness={0.8}
            roughness={0.1}
          />
        </mesh>
        <mesh position={[0.7, 0.15, 0]} castShadow>
          <sphereGeometry args={[0.04, 16, 16]} />
          <primitive object={ledMaterial} attach="material" />
        </mesh>
      </group>

      {/* LEDs */}
      {(lowerDesc.includes('led') || lowerDesc.includes('light')) && (
        <>
          <group position={[2, 0.2, 1]}>
            {/* LED body */}
            <mesh castShadow>
              <cylinderGeometry args={[0.15, 0.15, 0.3, 16]} />
              <meshStandardMaterial 
                color="#ef4444"
                emissive="#ef4444"
                emissiveIntensity={1}
                metalness={0.7}
                roughness={0.2}
                transparent={true}
                opacity={0.9}
              />
            </mesh>
            {/* LED glow */}
            <mesh position={[0, 0.2, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial 
                color="#ef4444"
                emissive="#ef4444"
                emissiveIntensity={0.5}
                transparent={true}
                opacity={0.3}
              />
            </mesh>
            {/* LED leads */}
            <mesh position={[0, -0.25, 0]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>

          {/* Resistor */}
          <group position={[1.2, 0.15, 1]} rotation={[0, 0, Math.PI / 2]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.08, 0.08, 0.5, 16]} />
              <meshStandardMaterial color="#fde68a" metalness={0.2} roughness={0.7} />
            </mesh>
            {/* Color bands */}
            <mesh position={[0, 0.15, 0]} castShadow>
              <cylinderGeometry args={[0.09, 0.09, 0.04, 16]} />
              <meshStandardMaterial color="#dc2626" />
            </mesh>
            <mesh position={[0, 0.05, 0]} castShadow>
              <cylinderGeometry args={[0.09, 0.09, 0.04, 16]} />
              <meshStandardMaterial color="#ea580c" />
            </mesh>
            <mesh position={[0, -0.05, 0]} castShadow>
              <cylinderGeometry args={[0.09, 0.09, 0.04, 16]} />
              <meshStandardMaterial color="#ca8a04" />
            </mesh>
          </group>
        </>
      )}

      {/* Motors */}
      {(lowerDesc.includes('motor') || lowerDesc.includes('wheel')) && (
        <>
          <group position={[2.5, 0.3, -1]}>
            {/* Motor body */}
            <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.25, 0.25, 0.6, 20]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.6} roughness={0.3} />
            </mesh>
            {/* Motor shaft */}
            <mesh position={[0, 0, 0.4]} castShadow rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.3, 16]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Terminals */}
            <mesh position={[-0.15, 0.15, -0.3]} castShadow>
              <boxGeometry args={[0.08, 0.08, 0.1]} />
              <meshStandardMaterial color="#ef4444" metalness={0.7} roughness={0.2} />
            </mesh>
            <mesh position={[0.15, 0.15, -0.3]} castShadow>
              <boxGeometry args={[0.08, 0.08, 0.1]} />
              <meshStandardMaterial color="#1f2937" metalness={0.7} roughness={0.2} />
            </mesh>
          </group>

          <group position={[2.5, 0.3, -2]}>
            <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.25, 0.25, 0.6, 20]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.6} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0, 0.4]} castShadow rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.3, 16]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        </>
      )}

      {/* Sensors */}
      {(lowerDesc.includes('sensor') || lowerDesc.includes('ultrasonic')) && (
        <group position={[0, 0.2, 2]}>
          {/* Sensor body */}
          <mesh castShadow>
            <boxGeometry args={[0.6, 0.3, 0.4]} />
            <meshStandardMaterial color="#3b82f6" metalness={0.5} roughness={0.4} />
          </mesh>
          {/* Sensor "eyes" */}
          <mesh position={[-0.15, 0, 0.21]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.7} roughness={0.2} />
          </mesh>
          <mesh position={[0.15, 0, 0.21]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.7} roughness={0.2} />
          </mesh>
        </group>
      )}

      {/* Wires/Traces */}
      {/* Power trace (red) */}
      <mesh position={[0, 0.06, 2.5]} castShadow>
        <boxGeometry args={[6, 0.02, 0.1]} />
        <meshStandardMaterial color="#ef4444" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Ground trace (black) */}
      <mesh position={[0, 0.06, -2.5]} castShadow>
        <boxGeometry args={[6, 0.02, 0.1]} />
        <meshStandardMaterial color="#1f2937" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Signal traces (yellow) */}
      <mesh position={[0, 0.06, 0.5]} castShadow>
        <boxGeometry args={[4, 0.02, 0.08]} />
        <primitive object={wireMaterial} attach="material" />
      </mesh>
      <mesh position={[1, 0.06, 0]} castShadow>
        <boxGeometry args={[0.08, 0.02, 2]} />
        <primitive object={wireMaterial} attach="material" />
      </mesh>
    </group>
  );
}

// Loading fallback
function Loader() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-300">Loading 3D Circuit...</p>
      </div>
    </div>
  );
}

// Main 3D Circuit Viewer Component
export default function Circuit3DViewer({ description }: { description: string }) {
  return (
    <div className="relative w-full h-[600px] bg-gradient-to-b from-gray-900 to-black rounded-lg overflow-hidden border-2 border-green-600 shadow-2xl">
      {/* Header Bar */}
      <div className="absolute top-0 left-0 right-0 bg-black text-white px-6 py-3 z-10 border-b-2 border-green-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-4 font-mono text-sm">3D_CIRCUIT_VIEWER.exe</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2 py-1 bg-green-600 text-white rounded">3D</span>
            <span>PCB VIEW</span>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="w-full h-full pt-12">
        <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: false }}>
          <Suspense fallback={null}>
            {/* Camera */}
            <PerspectiveCamera makeDefault position={[6, 5, 6]} fov={50} />
            
            {/* Lighting */}
            <ambientLight intensity={0.4} />
            
            <directionalLight 
              position={[5, 10, 5]} 
              intensity={1.5} 
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            
            <directionalLight 
              position={[-5, 5, -5]} 
              intensity={0.8} 
              color="#ffffff"
            />
            
            <pointLight position={[0, 5, 0]} intensity={0.6} color="#ffffff" />
            
            <spotLight 
              position={[0, 8, 0]} 
              angle={0.6} 
              penumbra={1} 
              intensity={1}
              castShadow
            />

            {/* Environment */}
            <Environment preset="warehouse" />

            {/* Circuit Board */}
            <CircuitBoard description={description} />

            {/* Ground plane */}
            <mesh 
              rotation={[-Math.PI / 2, 0, 0]} 
              position={[0, -0.5, 0]} 
              receiveShadow
            >
              <planeGeometry args={[20, 20]} />
              <meshStandardMaterial 
                color="#1a1a1a" 
                metalness={0.2}
                roughness={0.8}
              />
            </mesh>

            {/* Grid */}
            <gridHelper args={[12, 24, '#10b981', '#064e3b']} position={[0, -0.49, 0]} />

            {/* Controls */}
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={3}
              maxDistance={15}
              maxPolarAngle={Math.PI / 2}
              autoRotate={true}
              autoRotateSpeed={1}
              dampingFactor={0.05}
              enableDamping={true}
              target={[0, 0, 0]}
            />
          </Suspense>
        </Canvas>
      </div>
      
      {/* Control Panel */}
      <div className="absolute bottom-4 left-4 right-4 bg-black/90 backdrop-blur-sm px-6 py-4 rounded-lg shadow-xl border-2 border-green-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-mono font-semibold text-white">RENDERING</span>
            </div>
            <div className="h-4 w-px bg-gray-600"></div>
            <div className="flex items-center gap-4 text-xs font-mono text-gray-300">
              <span className="flex items-center gap-1">
                <span className="font-bold">🖱️</span> ROTATE
              </span>
              <span className="flex items-center gap-1">
                <span className="font-bold">🔍</span> ZOOM
              </span>
              <span className="flex items-center gap-1">
                <span className="font-bold">⚡</span> PAN
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-green-600 text-white text-xs font-mono rounded">
              THREE.JS
            </div>
            <div className="px-3 py-1 bg-emerald-600 text-white text-xs font-mono rounded">
              3D PCB
            </div>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Suspense fallback={<Loader />}>
          <div />
        </Suspense>
      </div>
    </div>
  );
}
