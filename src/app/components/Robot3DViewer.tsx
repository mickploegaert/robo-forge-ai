"use client";
import { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Robot configuration interface
interface RobotConfig {
  bodyType: 'humanoid' | 'wheeled' | 'tracked' | 'quadruped' | 'spider' | 'drone';
  headShape: 'round' | 'cubic' | 'dome' | 'cylindrical' | 'angular';
  armCount: number;
  legCount: number;
  hasWheels: boolean;
  hasTracks: boolean;
  size: 'small' | 'medium' | 'large';
  colorScheme: string;
  hasAntenna: boolean;
  hasCamera: boolean;
  compactDesign: boolean;
}

// Premium Humanoid Robot Component - Ultra-realistic hardcoded design
function Robot() {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  // EXACT configuratie naar je FOTO: zilver/grijs met blauwe accenten, slanke elegante humanoid
  const config: RobotConfig = {
    bodyType: 'humanoid',
    headShape: 'round',
    armCount: 2,
    legCount: 2,
    hasWheels: false,
    hasTracks: false,
    size: 'medium',
    colorScheme: '#c0c0c0', // Zilver grijs
    hasAntenna: false,
    hasCamera: true,
    compactDesign: false
  };
  
  // Smooth auto-rotate animation
  useFrame((state, delta) => {
    if (groupRef.current && !hovered) {
      groupRef.current.rotation.y += delta * 0.25;
    }
  });
  
  // Scale factor based on size
  const scale = config.size === 'small' ? 0.7 : config.size === 'large' ? 1.4 : 1.0;
  
  // Ultra-realistic materials - ZILVER/GRIJS met BLAUWE ACCENTEN zoals foto
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: '#d0d0d0', // Zilver-grijs
    metalness: 0.92,
    roughness: 0.10,
    envMapIntensity: 3.0,
  });
  
  const darkAccentMaterial = new THREE.MeshStandardMaterial({
    color: '#4a5568', // Donker grijs-zwart voor accenten
    metalness: 0.90,
    roughness: 0.12,
    envMapIntensity: 2.8,
  });
  
  const jointMaterial = new THREE.MeshStandardMaterial({
    color: '#2d3748', // Zeer donker grijs
    metalness: 0.95,
    roughness: 0.08,
    envMapIntensity: 3.2,
  });
  
  const bluAccentMaterial = new THREE.MeshStandardMaterial({
    color: '#4a90e2', // BLAUWE accenten uit je foto
    metalness: 0.85,
    roughness: 0.15,
    envMapIntensity: 2.5,
  });
  
  const glowMaterial = new THREE.MeshStandardMaterial({
    color: '#6b9bd1', // Licht blauw voor ogen
    emissive: '#4a90e2',
    emissiveIntensity: 1.8,
    metalness: 0.4,
    roughness: 0.2,
  });
  
  // Render ROND hoofd - ZILVER met blauwe detai
  const renderHead = () => {
    const headY = 1.8 * scale;
    
    return (
      <group position={[0, headY, 0]}>
        {/* ROND hoofd - zilver glanzend */}
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.26 * scale, 32, 32]} />
          <primitive object={bodyMaterial} attach="material" />
        </mesh>
        
        {/* Blauwe accent op hoofd */}
        <mesh position={[0, 0.18 * scale, 0]} castShadow>
          <cylinderGeometry args={[0.22 * scale, 0.22 * scale, 0.04 * scale, 32]} />
          <primitive object={bluAccentMaterial} attach="material" />
        </mesh>
        
        {/* Neck connector */}
        <mesh position={[0, -0.28 * scale, 0]} castShadow>
          <cylinderGeometry args={[0.12 * scale, 0.14 * scale, 0.12 * scale, 20]} />
          <primitive object={darkAccentMaterial} attach="material" />
        </mesh>
      </group>
    );
  };
  
  // Render OGEN - blauwe glowing eyes
  const renderEyes = () => (
    <>
      {/* Linker OOG - BLAUW */}
      <mesh position={[-0.10 * scale, 1.78 * scale, 0.24 * scale]} castShadow>
        <sphereGeometry args={[0.04 * scale, 24, 24]} />
        <primitive object={glowMaterial} attach="material" />
      </mesh>
      <pointLight position={[-0.10 * scale, 1.78 * scale, 0.28 * scale]} intensity={0.9} color="#4a90e2" distance={0.7} />
      
      {/* Rechter OOG - BLAUW */}
      <mesh position={[0.10 * scale, 1.78 * scale, 0.24 * scale]} castShadow>
        <sphereGeometry args={[0.04 * scale, 24, 24]} />
        <primitive object={glowMaterial} attach="material" />
      </mesh>
      <pointLight position={[0.10 * scale, 1.78 * scale, 0.28 * scale]} intensity={0.9} color="#4a90e2" distance={0.7} />
    </>
  );
  
  // Render SLANK lichaam - ZILVER met BLAUWE accenten
  const renderTorso = () => (
    <>
      {/* Upper chest - SLANK ZILVER */}
      <mesh position={[0, 1.40 * scale, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.46 * scale, 0.48 * scale, 0.23 * scale]} />
        <primitive object={bodyMaterial} attach="material" />
      </mesh>
      
      {/* BLAUWE accent op borst - grote cirkel */}
      <mesh position={[0, 1.42 * scale, 0.12 * scale]} castShadow>
        <cylinderGeometry args={[0.12 * scale, 0.12 * scale, 0.03 * scale, 32]} />
        <primitive object={bluAccentMaterial} attach="material" />
      </mesh>
      <pointLight position={[0, 1.42 * scale, 0.16 * scale]} intensity={0.6} color="#4a90e2" distance={1.5} />
      
      {/* Mid torso - SLANK taille ZILVER */}
      <mesh position={[0, 1.05 * scale, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.38 * scale, 0.33 * scale, 0.21 * scale]} />
        <primitive object={bodyMaterial} attach="material" />
      </mesh>
      
      {/* BLAUWE accent op zijkanten */}
      <mesh position={[-0.22 * scale, 1.05 * scale, 0]} castShadow>
        <boxGeometry args={[0.04 * scale, 0.30 * scale, 0.21 * scale]} />
        <primitive object={bluAccentMaterial} attach="material" />
      </mesh>
      <mesh position={[0.22 * scale, 1.05 * scale, 0]} castShadow>
        <boxGeometry args={[0.04 * scale, 0.30 * scale, 0.21 * scale]} />
        <primitive object={bluAccentMaterial} attach="material" />
      </mesh>
      
      {/* Lower torso / hips DONKER */}
      <mesh position={[0, 0.83 * scale, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.43 * scale, 0.23 * scale, 0.25 * scale]} />
        <primitive object={darkAccentMaterial} attach="material" />
      </mesh>
      
      {/* Hip joints */}
      <mesh position={[-0.17 * scale, 0.75 * scale, 0]} castShadow>
        <sphereGeometry args={[0.095 * scale, 20, 20]} />
        <primitive object={jointMaterial} attach="material" />
      </mesh>
      <mesh position={[0.17 * scale, 0.75 * scale, 0]} castShadow>
        <sphereGeometry args={[0.095 * scale, 20, 20]} />
        <primitive object={jointMaterial} attach="material" />
      </mesh>
    </>
  );
  
  // Render ARM met HAND met 5 VINGERS
  const renderArm = (side: 'left' | 'right', index: number = 0) => {
    const xPos = side === 'left' ? -0.30 * scale : 0.30 * scale;
    const yOffset = index * -0.15 * scale;
    
    return (
      <group position={[xPos, (1.42 - yOffset) * scale, 0]} key={`${side}-arm-${index}`}>
        {/* Shoulder joint */}
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.11 * scale, 24, 24]} />
          <primitive object={jointMaterial} attach="material" />
        </mesh>
        
        {/* Shoulder pad */}
        <mesh position={[side === 'left' ? -0.08 * scale : 0.08 * scale, 0, 0]} castShadow>
          <sphereGeometry args={[0.13 * scale, 24, 24, 0, Math.PI]} />
          <primitive object={darkAccentMaterial} attach="material" />
        </mesh>
        
        {/* Upper ARM */}
        <mesh position={[0, -0.28 * scale, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.065 * scale, 0.42 * scale, 16, 32]} />
          <primitive object={bodyMaterial} attach="material" />
        </mesh>
        
        {/* Elleboog */}
        <mesh position={[0, -0.52 * scale, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.08 * scale, 20, 20]} />
          <primitive object={jointMaterial} attach="material" />
        </mesh>
        
        {/* Onderarm */}
        <mesh position={[0, -0.76 * scale, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.055 * scale, 0.38 * scale, 16, 32]} />
          <primitive object={darkAccentMaterial} attach="material" />
        </mesh>
        
        {/* Pols */}
        <mesh position={[0, -0.98 * scale, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.065 * scale, 16, 16]} />
          <primitive object={jointMaterial} attach="material" />
        </mesh>
        
        {/* HAND met 5 VINGERS */}
        <group position={[0, -1.12 * scale, 0]}>
          {/* Handpalm */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.11 * scale, 0.16 * scale, 0.07 * scale]} />
            <primitive object={darkAccentMaterial} attach="material" />
          </mesh>
          
          {/* 5 VINGERS */}
          {[-0.05, -0.025, 0, 0.025, 0.05].map((xOffset, i) => (
            <group key={i} position={[xOffset * scale, -0.12 * scale, 0]}>
              {/* Vinger */}
              <mesh castShadow>
                <capsuleGeometry args={[0.009 * scale, 0.13 * scale, 8, 12]} />
                <primitive object={jointMaterial} attach="material" />
              </mesh>
            </group>
          ))}
        </group>
      </group>
    );
  };
  
  // Render BEEN met VOET - ZILVER/GRIJS design
  const renderLeg = (position: [number, number, number], index: number) => (
    <group position={position} key={`leg-${index}`}>
      {/* Heup joint */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.10 * scale, 20, 20]} />
        <primitive object={jointMaterial} attach="material" />
      </mesh>
      
      {/* Bovenbeen - ZILVER */}
      <mesh position={[0, -0.32 * scale, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.085 * scale, 0.52 * scale, 16, 32]} />
        <primitive object={bodyMaterial} attach="material" />
      </mesh>
      
      {/* Knie */}
      <mesh position={[0, -0.62 * scale, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.095 * scale, 20, 20]} />
        <primitive object={darkAccentMaterial} attach="material" />
      </mesh>
      
      {/* Knie cap - BLAUWE accent */}
      <mesh position={[0, -0.62 * scale, 0.08 * scale]} castShadow>
        <boxGeometry args={[0.13 * scale, 0.11 * scale, 0.05 * scale]} />
        <primitive object={bluAccentMaterial} attach="material" />
      </mesh>
      
      {/* Onderbeen - ZILVER */}
      <mesh position={[0, -0.94 * scale, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.07 * scale, 0.52 * scale, 16, 32]} />
        <primitive object={bodyMaterial} attach="material" />
      </mesh>
      
      {/* Shin guards - BLAUWE accenten */}
      <mesh position={[0, -0.94 * scale, 0.06 * scale]} castShadow>
        <boxGeometry args={[0.10 * scale, 0.50 * scale, 0.03 * scale]} />
        <primitive object={bluAccentMaterial} attach="material" />
      </mesh>
      
      {/* Enkel */}
      <mesh position={[0, -1.24 * scale, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.075 * scale, 16, 16]} />
        <primitive object={darkAccentMaterial} attach="material" />
      </mesh>
      
      {/* VOET - DONKER */}
      <mesh position={[0, -1.36 * scale, 0.13 * scale]} castShadow receiveShadow>
        <boxGeometry args={[0.15 * scale, 0.10 * scale, 0.36 * scale]} />
        <primitive object={darkAccentMaterial} attach="material" />
      </mesh>
      
      {/* Voetzool */}
      <mesh position={[0, -1.42 * scale, 0.13 * scale]} castShadow receiveShadow>
        <boxGeometry args={[0.14 * scale, 0.02 * scale, 0.34 * scale]} />
        <primitive object={jointMaterial} attach="material" />
      </mesh>
      
      {/* Tenen */}
      <mesh position={[0, -1.37 * scale, 0.29 * scale]} castShadow receiveShadow>
        <boxGeometry args={[0.13 * scale, 0.06 * scale, 0.09 * scale]} />
        <primitive object={darkAccentMaterial} attach="material" />
      </mesh>
      
      {/* Hiel */}
      <mesh position={[0, -1.38 * scale, -0.04 * scale]} castShadow receiveShadow>
        <boxGeometry args={[0.13 * scale, 0.07 * scale, 0.06 * scale]} />
        <primitive object={jointMaterial} attach="material" />
      </mesh>
    </group>
  );
  
  // Render wheels
  const renderWheels = () => (
    <>
      <mesh position={[-0.3 * scale, -0.2 * scale, 0.25 * scale]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.15 * scale, 0.15 * scale, 0.08 * scale, 20]} />
        <primitive object={jointMaterial} attach="material" />
      </mesh>
      <mesh position={[0.3 * scale, -0.2 * scale, 0.25 * scale]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.15 * scale, 0.15 * scale, 0.08 * scale, 20]} />
        <primitive object={jointMaterial} attach="material" />
      </mesh>
      <mesh position={[-0.3 * scale, -0.2 * scale, -0.25 * scale]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.15 * scale, 0.15 * scale, 0.08 * scale, 20]} />
        <primitive object={jointMaterial} attach="material" />
      </mesh>
      <mesh position={[0.3 * scale, -0.2 * scale, -0.25 * scale]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.15 * scale, 0.15 * scale, 0.08 * scale, 20]} />
        <primitive object={jointMaterial} attach="material" />
      </mesh>
    </>
  );
  
  // Render tracks
  const renderTracks = () => (
    <>
      <mesh position={[-0.35 * scale, -0.1 * scale, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.12 * scale, 0.2 * scale, 0.7 * scale]} />
        <primitive object={jointMaterial} attach="material" />
      </mesh>
      <mesh position={[0.35 * scale, -0.1 * scale, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.12 * scale, 0.2 * scale, 0.7 * scale]} />
        <primitive object={jointMaterial} attach="material" />
      </mesh>
    </>
  );
  
  return (
    <group 
      ref={groupRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      position={[0, 0.2, 0]}
    >
      {renderHead()}
      {renderEyes()}
      {renderTorso()}
      
      {/* Arms - realistic humanoid arms with hands */}
      {config.armCount > 0 && (
        <>
          {Array.from({ length: Math.ceil(config.armCount / 2) }).map((_, i) => renderArm('left', i))}
          {Array.from({ length: Math.floor(config.armCount / 2) }).map((_, i) => renderArm('right', i))}
        </>
      )}
      
      {/* Legs - realistic humanoid legs with feet */}
      {config.legCount > 0 && !config.hasWheels && !config.hasTracks && (
        <>
          {config.legCount === 2 && (
            <>
              {renderLeg([-0.15 * scale, 0.75 * scale, 0], 0)}
              {renderLeg([0.15 * scale, 0.75 * scale, 0], 1)}
            </>
          )}
        </>
      )}
      
      {/* Wheels or Tracks */}
      {config.hasWheels && renderWheels()}
      {config.hasTracks && renderTracks()}
      
      {/* Antenna - removed for sleek black design */}
    </group>
  );
}

// Main 3D Viewer Component
export default function Robot3DViewer({ description }: { description: string }) {
  return (
    <div className="relative w-full h-[600px] bg-gradient-to-b from-gray-700 to-gray-600 rounded-lg overflow-hidden border-2 border-black shadow-2xl">
      {/* Header Bar */}
      <div className="absolute top-0 left-0 right-0 bg-black text-white px-6 py-3 z-10 border-b-2 border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-4 font-mono text-sm">ULTRA_REALISTIC_3D_HUMANOID.exe</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2 py-1 rounded bg-green-500 text-black font-bold">
              LIVE
            </span>
            <span className="text-gray-300">INSTANT RENDERING</span>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="w-full h-full pt-12">
        <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping }}>
          <Suspense fallback={null}>
            {/* Camera - better angle for humanoid */}
            <PerspectiveCamera makeDefault position={[3, 2, 4]} fov={45} />
            
            {/* Ultra-realistic Studio Lighting Setup */}
            <ambientLight intensity={0.4} color="#ffffff" />
            
            {/* Key Light - Main light from front-right */}
            <directionalLight 
              position={[8, 10, 6]} 
              intensity={2.5} 
              castShadow
              shadow-mapSize-width={4096}
              shadow-mapSize-height={4096}
              shadow-camera-far={50}
              shadow-camera-left={-10}
              shadow-camera-right={10}
              shadow-camera-top={10}
              shadow-camera-bottom={-10}
              shadow-bias={-0.0001}
            />
            
            {/* Fill Light - Soft light from left to reduce shadows */}
            <directionalLight 
              position={[-6, 4, -4]} 
              intensity={1.2} 
              color="#b8d4f1"
            />
            
            {/* Rim Light - Highlight edges from behind */}
            <directionalLight 
              position={[0, 6, -10]} 
              intensity={1.8} 
              color="#6b9bd1"
            />
            
            {/* Top Light - Simulates ceiling/sky */}
            <directionalLight 
              position={[0, 12, 0]} 
              intensity={1.0} 
              color="#ffffff"
            />
            
            {/* Point lights for highlights and depth */}
            <pointLight position={[3, 4, 3]} intensity={0.8} color="#ffffff" distance={8} />
            <pointLight position={[-3, 3, -3]} intensity={0.6} color="#a3c4e8" distance={8} />
            <pointLight position={[0, 1, 4]} intensity={0.5} color="#7db3e0" distance={6} />
            
            {/* Accent lights for dramatic effect */}
            <spotLight 
              position={[-4, 8, 2]} 
              angle={0.5} 
              penumbra={0.8} 
              intensity={1.5}
              color="#ffffff"
              castShadow
            />
            <spotLight 
              position={[4, 6, -2]} 
              angle={0.6} 
              penumbra={1} 
              intensity={1.2}
              color="#c8e0f7"
            />

            {/* Environment for ultra-realistic reflections */}
            <Environment preset="studio" environmentIntensity={1.2} />

            {/* Robot - Ultra-realistic hardcoded humanoid */}
            <RobotWithLoadingState description={description} onLoadingChange={() => {}} />

            {/* Ground plane - Dark studio floor like the image */}
            <mesh 
              rotation={[-Math.PI / 2, 0, 0]} 
              position={[0, -1.5, 0]} 
              receiveShadow
            >
              <planeGeometry args={[25, 25]} />
              <meshStandardMaterial 
                color="#3a3a3a" 
                metalness={0.6}
                roughness={0.4}
                envMapIntensity={1.2}
              />
            </mesh>

            {/* Remove grid for clean studio look */}

            {/* Controls - Smoother interaction */}
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={2.5}
              maxDistance={12}
              maxPolarAngle={Math.PI / 1.8}
              minPolarAngle={Math.PI / 8}
              autoRotate={false}
              dampingFactor={0.08}
              enableDamping={true}
              target={[0, 0.5, 0]}
              rotateSpeed={0.8}
              zoomSpeed={0.8}
            />
          </Suspense>
        </Canvas>
      </div>
      
      {/* Control Panel */}
      <div className="absolute bottom-4 left-4 right-4 bg-black/90 backdrop-blur-sm px-6 py-4 rounded-lg shadow-xl border-2 border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-mono font-semibold text-white">
                ULTRA-REALISTIC HUMANOID
              </span>
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
            <div className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-mono rounded">
              HARDCODED
            </div>
            <div className="px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-mono rounded">
              HD QUALITY
            </div>
          </div>
        </div>
      </div>

      {/* Loading overlay - removed since robot is instant */}
    </div>
  );
}

// Wrapper component - simplified since robot is hardcoded
function RobotWithLoadingState({ onLoadingChange }: { description?: string; onLoadingChange: (loading: boolean) => void }) {
  // Immediately signal not loading since robot is hardcoded
  onLoadingChange(false);
  
  return <Robot />;
}
