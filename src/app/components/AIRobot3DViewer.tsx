"use client";
import { useRef, useState, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { generateRobotConfig } from '../services/ai';

// AI Generated Robot Configuration Interface
interface AIRobotConfig {
  bodyType: string;
  locomotion: string;
  head: {
    shape: string;
    size: number[];
    position: number[];
    features: string[];
  };
  torso: {
    shape: string;
    size: number[];
    position: number[];
    compartments: string[];
  };
  arms: Array<{
    side: string;
    segments: Array<{ shape: string; size: number[]; offset: number[] }>;
    joints: Array<{ type: string; position: number[] }>;
    endEffector: { type: string };
  }>;
  legs: Array<{
    position: string;
    segments: Array<{ shape: string; size: number[]; offset: number[] }>;
    joints: Array<{ type: string; position: number[] }>;
    foot: { shape: string; size: number[] };
  }>;
  wheels: Array<{ position: number[]; radius: number; width: number; tread: boolean }>;
  tracks: Array<{ side: string; length: number; width: number; position: number[] }>;
  dimensions: {
    totalHeight: number;
    totalWidth: number;
    totalDepth: number;
    weight: number;
    centerOfGravity: number[];
  };
  material: {
    primary: string;
    secondary: string;
    accent: string;
    finish: string;
  };
  printability: {
    supports: string;
    orientation: string;
    difficulty: string;
  };
}

// Render 3D shape based on type
function RenderShape({ 
  shape, 
  size, 
  position, 
  material, 
  castShadow = true,
  receiveShadow = true 
}: { 
  shape: string; 
  size: number[]; 
  position: number[]; 
  material: THREE.Material;
  castShadow?: boolean;
  receiveShadow?: boolean;
}) {
  const scale = 0.01; // Convert cm to 3D units
  const pos: [number, number, number] = [
    position[0] * scale,
    position[1] * scale,
    position[2] * scale
  ];

  switch (shape.toLowerCase()) {
    case 'sphere':
      return (
        <mesh position={pos} castShadow={castShadow} receiveShadow={receiveShadow}>
          <sphereGeometry args={[(size[0] / 2) * scale, 32, 32]} />
          <primitive object={material} attach="material" />
        </mesh>
      );
    
    case 'box':
      return (
        <mesh position={pos} castShadow={castShadow} receiveShadow={receiveShadow}>
          <boxGeometry args={[size[0] * scale, size[1] * scale, size[2] * scale]} />
          <primitive object={material} attach="material" />
        </mesh>
      );
    
    case 'cylinder':
      return (
        <mesh position={pos} castShadow={castShadow} receiveShadow={receiveShadow}>
          <cylinderGeometry args={[(size[0] / 2) * scale, (size[0] / 2) * scale, size[1] * scale, 20]} />
          <primitive object={material} attach="material" />
        </mesh>
      );
    
    case 'capsule':
      return (
        <mesh position={pos} castShadow={castShadow} receiveShadow={receiveShadow}>
          <capsuleGeometry args={[(size[0] / 2) * scale, size[1] * scale, 12, 20]} />
          <primitive object={material} attach="material" />
        </mesh>
      );
    
    case 'dome':
      return (
        <mesh position={pos} castShadow={castShadow} receiveShadow={receiveShadow}>
          <sphereGeometry args={[(size[0] / 2) * scale, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <primitive object={material} attach="material" />
        </mesh>
      );
    
    case 'cone':
      return (
        <mesh position={pos} castShadow={castShadow} receiveShadow={receiveShadow}>
          <coneGeometry args={[(size[0] / 2) * scale, size[1] * scale, 20]} />
          <primitive object={material} attach="material" />
        </mesh>
      );
    
    default:
      return (
        <mesh position={pos} castShadow={castShadow} receiveShadow={receiveShadow}>
          <boxGeometry args={[size[0] * scale, size[1] * scale, size[2] * scale]} />
          <primitive object={material} attach="material" />
        </mesh>
      );
  }
}

// Dynamic AI Robot Component
function AIRobot({ 
  description, 
  onLoadingChange 
}: { 
  description: string; 
  onLoadingChange?: (loading: boolean) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [config, setConfig] = useState<AIRobotConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load AI-generated config
  useEffect(() => {
    let isMounted = true;
    
    async function loadConfig() {
      setIsLoading(true);
      setError(null);
      onLoadingChange?.(true);
      
      try {
        console.log('Generating AI robot config for:', description);
        const aiConfig = await generateRobotConfig(description);
        console.log('AI Config received:', aiConfig);
        
        if (isMounted) {
          setConfig(aiConfig as AIRobotConfig);
        }
      } catch (err) {
        console.error('Error loading robot config:', err);
        if (isMounted) {
          setError((err as Error).message || 'Kon robot configuratie niet laden');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          onLoadingChange?.(false);
        }
      }
    }
    
    loadConfig();
    
    return () => {
      isMounted = false;
    };
  }, [description, onLoadingChange]);
  
  useFrame((state, delta) => {
    if (groupRef.current && !hovered) {
      groupRef.current.rotation.y += delta * 0.2;
    }
  });
  
  // Show loading state
  if (isLoading || !config) {
    return (
      <group>
        <mesh>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#444444" wireframe />
        </mesh>
      </group>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <group>
        <mesh>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#ff4444" wireframe />
        </mesh>
      </group>
    );
  }

  // Create materials
  const primaryMaterial = new THREE.MeshStandardMaterial({
    color: config.material.primary,
    metalness: config.material.finish === 'glossy' ? 0.85 : config.material.finish === 'metallic' ? 0.95 : 0.3,
    roughness: config.material.finish === 'glossy' ? 0.15 : config.material.finish === 'matte' ? 0.8 : 0.5,
    envMapIntensity: 2.0,
  });
  
  const secondaryMaterial = new THREE.MeshStandardMaterial({
    color: config.material.secondary,
    metalness: config.material.finish === 'glossy' ? 0.8 : config.material.finish === 'metallic' ? 0.9 : 0.2,
    roughness: config.material.finish === 'glossy' ? 0.2 : config.material.finish === 'matte' ? 0.85 : 0.55,
    envMapIntensity: 1.8,
  });
  
  const accentMaterial = new THREE.MeshStandardMaterial({
    color: config.material.accent,
    metalness: 0.9,
    roughness: 0.1,
    envMapIntensity: 2.2,
  });

  const jointMaterial = new THREE.MeshStandardMaterial({
    color: '#1a1a1a',
    metalness: 0.95,
    roughness: 0.08,
  });

  const scale = 0.01; // Convert cm to 3D units
  
  return (
    <group 
      ref={groupRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      position={[0, 0, 0]}
    >
      {/* Head */}
      <RenderShape
        shape={config.head.shape}
        size={config.head.size}
        position={config.head.position}
        material={primaryMaterial}
      />

      {/* Head Features (eyes/camera) - Minimal dark eyes like Tesla Optimus */}
      {config.head.size && (
        <>
          {/* Left Eye/Camera - Small dark sensor */}
          <mesh 
            position={[
              (-0.22 * config.head.size[0]) * scale, 
              (config.head.position[1] + 0.3) * scale, 
              (config.head.position[2] + config.head.size[2] * 0.48) * scale
            ]} 
            castShadow
          >
            <sphereGeometry args={[0.08 * config.head.size[0] * scale, 16, 16]} />
            <meshStandardMaterial 
              color="#0a0a0a"
              metalness={0.95}
              roughness={0.05}
            />
          </mesh>
          
          {/* Right Eye/Camera - Small dark sensor */}
          <mesh 
            position={[
              (0.22 * config.head.size[0]) * scale, 
              (config.head.position[1] + 0.3) * scale, 
              (config.head.position[2] + config.head.size[2] * 0.48) * scale
            ]} 
            castShadow
          >
            <sphereGeometry args={[0.08 * config.head.size[0] * scale, 16, 16]} />
            <meshStandardMaterial 
              color="#0a0a0a"
              metalness={0.95}
              roughness={0.05}
            />
          </mesh>
        </>
      )}

      {/* Neck Connection */}
      <mesh 
        position={[
          config.head.position[0] * scale,
          (config.head.position[1] - config.head.size[1] * 0.5) * scale,
          config.head.position[2] * scale
        ]}
        castShadow
      >
        <cylinderGeometry args={[
          0.3 * config.head.size[0] * scale,
          0.35 * config.torso.size[0] * scale,
          config.head.size[1] * 0.2 * scale,
          16
        ]} />
        <primitive object={jointMaterial} attach="material" />
      </mesh>
      
      {/* Torso */}
      <RenderShape
        shape={config.torso.shape}
        size={config.torso.size}
        position={config.torso.position}
        material={primaryMaterial}
      />
      
      {/* Torso Details - Chest panel like Tesla Optimus */}
      <mesh 
        position={[
          config.torso.position[0] * scale, 
          config.torso.position[1] * scale, 
          (config.torso.position[2] + config.torso.size[2] * 0.51) * scale
        ]} 
        castShadow
      >
        <boxGeometry args={[
          config.torso.size[0] * 0.65 * scale, 
          config.torso.size[1] * 0.75 * scale, 
          0.15 * scale
        ]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          metalness={0.85} 
          roughness={0.15}
        />
      </mesh>
      
      {/* Torso vertical accent line */}
      <mesh 
        position={[
          config.torso.position[0] * scale, 
          config.torso.position[1] * scale, 
          (config.torso.position[2] + config.torso.size[2] * 0.52) * scale
        ]}
      >
        <boxGeometry args={[
          0.08 * scale,
          config.torso.size[1] * 0.7 * scale,
          0.1 * scale
        ]} />
        <meshStandardMaterial 
          color="#0d0d0d" 
          metalness={0.9} 
          roughness={0.1}
        />
      </mesh>

      {/* Arms */}
      {config.arms && config.arms.map((arm, armIndex) => {
        // Schouder positie: aan de zijkant van de torso, net onder de top
        const shoulderX = arm.side === 'left' ? -config.torso.size[0] * 0.5 : config.torso.size[0] * 0.5;
        const shoulderY = config.torso.position[1] + config.torso.size[1] * 0.4; // Bovenkant torso
        const shoulderZ = config.torso.position[2];

        return (
          <group key={`arm-${armIndex}`}>
            {/* Shoulder Joint (ball joint) */}
            <mesh 
              position={[shoulderX * scale, shoulderY * scale, shoulderZ * scale]}
              castShadow
            >
              <sphereGeometry args={[0.12 * config.torso.size[0] * scale, 20, 20]} />
              <primitive object={jointMaterial} attach="material" />
            </mesh>
            
            {arm.segments.map((segment, segIndex) => {
              // Bereken positie: start bij schouder, dan cumulatief naar beneden
              const segmentX = shoulderX;
              let segmentY = shoulderY;
              const segmentZ = shoulderZ;

              // Voeg offset van vorige segmenten toe
              for (let i = 0; i < segIndex; i++) {
                segmentY += arm.segments[i].offset[1] - arm.segments[i].size[1] * 0.5;
              }

              // Voeg huidige segment offset toe (relatief)
              segmentY += segment.offset[1];

              return (
                <group key={`arm-${armIndex}-seg-${segIndex}`}>
                  <RenderShape
                    shape={segment.shape}
                    size={segment.size}
                    position={[segmentX, segmentY, segmentZ]}
                    material={segIndex === 0 ? secondaryMaterial : accentMaterial}
                  />
                  {/* Elbow Joint (tussen segmenten) */}
                  {segIndex === 0 && arm.segments.length > 1 && (
                    <mesh 
                      position={[
                        segmentX * scale, 
                        (segmentY + segment.offset[1] - segment.size[1] * 0.5) * scale, 
                        segmentZ * scale
                      ]}
                      castShadow
                    >
                      <sphereGeometry args={[segment.size[0] * 0.6 * scale, 18, 18]} />
                      <primitive object={jointMaterial} attach="material" />
                    </mesh>
                  )}
                </group>
              );
            })}

            {/* Hand */}
            {arm.endEffector && arm.endEffector.type !== 'none' && (
              <group>
                {(() => {
                  // Bereken hand positie: aan het einde van onderarm
                  const handX = shoulderX;
                  let handY = shoulderY;
                  const handZ = shoulderZ;
                  
                  // Tel alle segment offsets en sizes op
                  arm.segments.forEach((seg, idx) => {
                    handY += seg.offset[1];
                    if (idx < arm.segments.length - 1) {
                      handY -= seg.size[1] * 0.5;
                    } else {
                      handY -= seg.size[1] * 0.7; // Laatste segment
                    }
                  });

                  return (
                    <>
                      {/* Pols gewricht */}
                      <mesh position={[handX * scale, handY * scale, handZ * scale]} castShadow>
                        <sphereGeometry args={[0.08 * config.torso.size[0] * scale, 16, 16]} />
                        <primitive object={jointMaterial} attach="material" />
                      </mesh>
                      {/* Hand */}
                      <mesh position={[handX * scale, (handY - 1.2) * scale, handZ * scale]} castShadow>
                        <boxGeometry args={[
                          1.6 * scale, 
                          2 * scale, 
                          1 * scale
                        ]} />
                        <primitive object={secondaryMaterial} attach="material" />
                      </mesh>
                    </>
                  );
                })()}
              </group>
            )}
          </group>
        );
      })}

      {/* Legs */}
      {config.legs && config.legs.map((leg, legIndex) => {
        // Heup positie: direct uit config halen
        const hipX = leg.position.includes('left') ? -config.torso.size[0] * 0.28 : config.torso.size[0] * 0.28;
        const hipY = config.torso.position[1] - config.torso.size[1] * 0.45; // Iets onder torso centrum
        const hipZ = config.torso.position[2];

        return (
          <group key={`leg-${legIndex}`}>
            {/* Hip Joint (ball joint) */}
            <mesh 
              position={[hipX * scale, hipY * scale, hipZ * scale]}
              castShadow
            >
              <sphereGeometry args={[0.13 * config.torso.size[0] * scale, 20, 20]} />
              <primitive object={jointMaterial} attach="material" />
            </mesh>
            
            {/* Bovenbeen - eerste segment */}
            {leg.segments[0] && (
              <>
                <RenderShape
                  shape={leg.segments[0].shape}
                  size={leg.segments[0].size}
                  position={[hipX, 10.5, hipZ]}
                  material={secondaryMaterial}
                />
                
                {/* Knie gewricht */}
                <mesh 
                  position={[
                    hipX * scale, 
                    7 * scale,
                    hipZ * scale
                  ]}
                  castShadow
                >
                  <sphereGeometry args={[leg.segments[0].size[0] * 0.65 * scale, 18, 18]} />
                  <primitive object={jointMaterial} attach="material" />
                </mesh>
              </>
            )}
            
            {/* Onderbeen - tweede segment */}
            {leg.segments[1] && (
              <RenderShape
                shape={leg.segments[1].shape}
                size={leg.segments[1].size}
                position={[hipX, 4, hipZ]}
                material={secondaryMaterial}
              />
            )}

            {/* Enkel gewricht en Voet */}
            {leg.foot && (
              <>
                {/* Enkel gewricht - net boven voet */}
                <mesh 
                  position={[
                    hipX * scale, 
                    1 * scale,
                    hipZ * scale
                  ]}
                  castShadow
                >
                  <sphereGeometry args={[0.09 * config.torso.size[0] * scale, 16, 16]} />
                  <primitive object={jointMaterial} attach="material" />
                </mesh>
                
                {/* Voet platform - op de grond (Y=0) */}
                <RenderShape
                  shape={leg.foot.shape}
                  size={leg.foot.size}
                  position={[hipX, 0.5, hipZ + leg.foot.size[2] * 0.2]}
                  material={secondaryMaterial}
                />
                
                {/* Witte accent op voet voorkant */}
                <mesh
                  position={[
                    hipX * scale,
                    0.5 * scale,
                    (hipZ + leg.foot.size[2] * 0.45) * scale
                  ]}
                  castShadow
                >
                  <boxGeometry args={[
                    leg.foot.size[0] * scale,
                    leg.foot.size[1] * 0.5 * scale,
                    leg.foot.size[2] * 0.25 * scale
                  ]} />
                  <meshStandardMaterial 
                    color="#e8e8e8" 
                    metalness={0.3} 
                    roughness={0.4}
                  />
                </mesh>
              </>
            )}
          </group>
        );
      })}

      {/* Wheels */}
      {config.wheels && config.wheels.map((wheel, wheelIndex) => (
        <mesh 
          key={`wheel-${wheelIndex}`}
          position={[wheel.position[0] * scale, wheel.position[1] * scale, wheel.position[2] * scale]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        >
          <cylinderGeometry args={[wheel.radius * scale, wheel.radius * scale, wheel.width * scale, 20]} />
          <primitive object={jointMaterial} attach="material" />
        </mesh>
      ))}

      {/* Tracks */}
      {config.tracks && config.tracks.map((track, trackIndex) => (
        <mesh 
          key={`track-${trackIndex}`}
          position={[track.position[0] * scale, track.position[1] * scale, track.position[2] * scale]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[track.width * scale, 0.2 * scale, track.length * scale]} />
          <primitive object={jointMaterial} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

// Main 3D Viewer Component
export default function AIRobot3DViewer({ description }: { description: string }) {
  const [isGenerating, setIsGenerating] = useState(true);

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg overflow-hidden border-2 border-black shadow-2xl">
      {/* Header Bar */}
      <div className="absolute top-0 left-0 right-0 bg-black text-white px-6 py-3 z-10 border-b-2 border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-4 font-mono text-sm">AI_ROBOT_GENERATOR.exe</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className={`px-2 py-1 rounded ${isGenerating ? 'bg-yellow-500 text-black animate-pulse' : 'bg-green-500 text-black'}`}>
              {isGenerating ? 'GENERATING' : 'READY'}
            </span>
            <span>3D PRINTABLE</span>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="w-full h-full pt-12">
        <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: false }}>
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[3, 2, 4]} fov={50} />
            
            {/* Enhanced Lighting Setup for Black Robot */}
            <ambientLight intensity={0.8} color="#ffffff" />
            
            {/* Main Key Light - Stronger for black materials */}
            <directionalLight 
              position={[8, 12, 8]} 
              intensity={4.5} 
              castShadow
              shadow-mapSize-width={4096}
              shadow-mapSize-height={4096}
              shadow-camera-far={50}
              shadow-camera-left={-15}
              shadow-camera-right={15}
              shadow-camera-top={15}
              shadow-camera-bottom={-15}
              shadow-bias={-0.0001}
            />
            
            {/* Fill Light - Brighter */}
            <directionalLight 
              position={[-6, 6, -6]} 
              intensity={2.0} 
              color="#e0e7ff"
            />
            
            {/* Rim/Back Light - More dramatic */}
            <directionalLight 
              position={[0, 8, -10]} 
              intensity={3.0} 
              color="#7dd3fc"
            />
            
            {/* Accent Point Lights - Stronger */}
            <pointLight position={[3, 4, 3]} intensity={2.0} color="#ffffff" distance={15} />
            <pointLight position={[-3, 3, -3]} intensity={1.5} color="#bfdbfe" distance={12} />
            <pointLight position={[0, 6, 0]} intensity={1.5} color="#ffffff" distance={10} />
            
            {/* Dramatic Top Spot Light - Enhanced */}
            <spotLight 
              position={[0, 15, 0]} 
              angle={0.5} 
              penumbra={0.8} 
              intensity={3.5}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            
            {/* Environment Map for Reflections */}
            <Environment preset="studio" />
            
            <RobotWithLoadingState description={description} onLoadingChange={setIsGenerating} />
            
            {/* Enhanced Ground Plane with Gradient */}
            <mesh 
              rotation={[-Math.PI / 2, 0, 0]} 
              position={[0, -0.01, 0]} 
              receiveShadow
            >
              <planeGeometry args={[25, 25]} />
              <meshStandardMaterial 
                color="#0a0a0a" 
                metalness={0.4}
                roughness={0.6}
                envMapIntensity={0.5}
              />
            </mesh>
            
            {/* Detailed Grid with Multiple Layers */}
            <gridHelper args={[20, 100, '#1a1a1a', '#0d0d0d']} position={[0, 0.001, 0]} />
            <gridHelper args={[20, 20, '#333333', '#222222']} position={[0, 0.002, 0]} />
            
            {/* Circular Platform Under Robot */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]} receiveShadow>
              <ringGeometry args={[0.8, 1.2, 64]} />
              <meshStandardMaterial 
                color="#1e3a8a" 
                metalness={0.8}
                roughness={0.2}
                emissive="#1e3a8a"
                emissiveIntensity={0.3}
              />
            </mesh>
            
            {/* Enhanced OrbitControls */}
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={1.2}
              maxDistance={15}
              minPolarAngle={0}
              maxPolarAngle={Math.PI / 2}
              autoRotate={!isGenerating}
              autoRotateSpeed={0.5}
              dampingFactor={0.05}
              enableDamping={true}
              rotateSpeed={0.8}
              zoomSpeed={1.2}
              panSpeed={0.8}
              target={[0, 1, 0]}
            />
          </Suspense>
        </Canvas>
      </div>
      
      {/* Control Panel */}
      <div className="absolute bottom-4 left-4 right-4 bg-black/90 backdrop-blur-sm px-6 py-4 rounded-lg shadow-xl border-2 border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`}></div>
              <span className="text-xs font-mono font-semibold text-white">
                {isGenerating ? 'AI GENEREREN...' : 'KLAAR VOOR PRINT'}
              </span>
            </div>
            <div className="h-4 w-px bg-gray-600"></div>
            <div className="flex items-center gap-4 text-xs font-mono text-gray-300">
              <span>🖱️ DRAAIEN</span>
              <span>🔍 ZOOMEN</span>
              <span>⚡ VERPLAATSEN</span>
              <span>🔄 AUTO-ROTATE</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-mono rounded shadow-lg">
              GPT-4o
            </div>
            <div className="px-3 py-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-mono rounded shadow-lg">
              3D-PRINT
            </div>
            <div className="px-3 py-1 bg-gradient-to-r from-green-600 to-green-700 text-white text-xs font-mono rounded shadow-lg">
              OPTIMIZED
            </div>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {isGenerating && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-gradient-to-b from-black/40 via-black/30 to-transparent backdrop-blur-sm z-20">
          <div className="text-center bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 p-10 rounded-2xl border-2 border-blue-500/50 shadow-2xl backdrop-blur-md">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-t-4 border-blue-500 mx-auto"></div>
              <div className="animate-ping absolute inset-0 rounded-full h-20 w-20 border-4 border-blue-400 opacity-20 mx-auto"></div>
            </div>
            <p className="font-mono text-2xl mb-3 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent font-bold">
              🤖 AI Robot Generator
            </p>
            <p className="text-gray-300 text-base mb-3 font-medium">Genereren van unieke 3D-printbare robot...</p>
            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Stap 1: Design Planning</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mt-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-75"></div>
              <span>Stap 2: 3D Geometrie</span>
            </div>
            <p className="text-gray-500 text-xs mt-4">Dit kan 15-25 seconden duren</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrapper component to handle loading state
function RobotWithLoadingState({ 
  description, 
  onLoadingChange 
}: { 
  description: string; 
  onLoadingChange: (loading: boolean) => void;
}) {
  useEffect(() => {
    onLoadingChange(true);
  }, [description, onLoadingChange]);

  return <AIRobot description={description} onLoadingChange={onLoadingChange} />;
}
