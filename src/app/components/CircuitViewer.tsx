"use client";
import { useEffect, useRef, useState } from 'react';

interface Component {
  type: 'arduino' | 'resistor' | 'led' | 'sensor' | 'motor' | 'battery' | 'button' | 'capacitor';
  x: number;
  y: number;
  label: string;
  pins?: { name: string; x: number; y: number }[];
}

interface Wire {
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: string;
  label?: string;
}

export default function CircuitViewer({ description }: { description: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [components, setComponents] = useState<Component[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);
  const [hoveredComponent, setHoveredComponent] = useState<number | null>(null);

  useEffect(() => {
    // Generate circuit based on description
    const generatedComponents = generateCircuitComponents(description);
    const generatedWires = generateWires(generatedComponents);
    
    setComponents(generatedComponents);
    setWires(generatedWires);
  }, [description]);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background with gradient
    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGradient.addColorStop(0, '#0f172a');
    bgGradient.addColorStop(0.5, '#1e293b');
    bgGradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw decorative grid
    drawProfessionalGrid(ctx, canvas.width, canvas.height);

    // Draw connection paths (wires) with glow
    wires.forEach(wire => drawProfessionalWire(ctx, wire));

    // Draw components with shadows and highlights
    components.forEach((component, idx) => {
      drawProfessionalComponent(ctx, component, idx === hoveredComponent);
    });

    // Draw title and info
    drawHeader(ctx, canvas.width);

  }, [components, wires, hoveredComponent]);

  function generateCircuitComponents(desc: string): Component[] {
    const components: Component[] = [];
    const lowerDesc = desc.toLowerCase();

    // Arduino (center piece)
    components.push({
      type: 'arduino',
      x: 400,
      y: 300,
      label: 'Arduino Uno',
      pins: [
        { name: '5V', x: 360, y: 270 },
        { name: 'GND', x: 360, y: 290 },
        { name: 'D2', x: 360, y: 310 },
        { name: 'D3', x: 360, y: 330 },
        { name: 'A0', x: 440, y: 270 },
        { name: 'A1', x: 440, y: 290 },
      ]
    });

    // Power supply
    components.push({
      type: 'battery',
      x: 150,
      y: 150,
      label: '9V Power'
    });

    // LEDs
    if (lowerDesc.includes('led') || lowerDesc.includes('light')) {
      components.push({
        type: 'led',
        x: 650,
        y: 150,
        label: 'Status LED'
      });
      components.push({
        type: 'resistor',
        x: 580,
        y: 150,
        label: '220Ω'
      });
    }

    // Motors
    if (lowerDesc.includes('motor') || lowerDesc.includes('wheel') || lowerDesc.includes('drive')) {
      components.push({
        type: 'motor',
        x: 700,
        y: 300,
        label: 'DC Motor L'
      });
      components.push({
        type: 'motor',
        x: 700,
        y: 400,
        label: 'DC Motor R'
      });
    }

    // Sensors
    if (lowerDesc.includes('sensor') || lowerDesc.includes('ultrasonic') || lowerDesc.includes('distance')) {
      components.push({
        type: 'sensor',
        x: 250,
        y: 450,
        label: 'Ultrasonic'
      });
    }

    if (lowerDesc.includes('line') || lowerDesc.includes('ir')) {
      components.push({
        type: 'sensor',
        x: 400,
        y: 500,
        label: 'IR Sensor'
      });
    }

    // Button
    if (lowerDesc.includes('button') || lowerDesc.includes('switch')) {
      components.push({
        type: 'button',
        x: 150,
        y: 300,
        label: 'Start Button'
      });
    }

    // Capacitor for stability
    components.push({
      type: 'capacitor',
      x: 250,
      y: 150,
      label: '100µF'
    });

    return components;
  }

  function generateWires(components: Component[]): Wire[] {
    const wires: Wire[] = [];
    const arduino = components.find(c => c.type === 'arduino');
    if (!arduino) return wires;

    const wireColors = [
      { color: '#ef4444', label: 'VCC' },
      { color: '#1f2937', label: 'GND' },
      { color: '#3b82f6', label: 'Signal' },
      { color: '#10b981', label: 'Data' },
      { color: '#f59e0b', label: 'PWM' },
      { color: '#8b5cf6', label: 'Analog' },
      { color: '#ec4899', label: 'Digital' }
    ];
    let colorIndex = 0;

    components.forEach(component => {
      if (component.type === 'arduino') return;

      // Power wire (red)
      wires.push({
        from: { x: arduino.x - 40, y: arduino.y - 30 },
        to: { x: component.x, y: component.y - 10 },
        color: '#ef4444',
        label: 'VCC'
      });

      // Ground wire (black)
      wires.push({
        from: { x: arduino.x - 40, y: arduino.y - 10 },
        to: { x: component.x, y: component.y + 10 },
        color: '#1f2937',
        label: 'GND'
      });

      // Signal/Data wire (various colors)
      if (component.type !== 'battery' && component.type !== 'capacitor') {
        const wireColor = wireColors[colorIndex % wireColors.length];
        wires.push({
          from: { x: arduino.x - 40, y: arduino.y + 10 },
          to: { x: component.x, y: component.y },
          color: wireColor.color,
          label: wireColor.label
        });
        colorIndex++;
      }
    });

    return wires;
  }

  function drawProfessionalGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Fine grid
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.2)';
    ctx.lineWidth = 0.5;

    for (let x = 0; x < width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Major grid
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
    ctx.lineWidth = 1;

    for (let x = 0; x < width; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y < height; y += 100) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  function drawProfessionalWire(ctx: CanvasRenderingContext2D, wire: Wire) {
    // Draw glow effect
    ctx.shadowColor = wire.color;
    ctx.shadowBlur = 15;
    ctx.strokeStyle = wire.color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(wire.from.x, wire.from.y);

    // Create smooth curved path
    const dx = wire.to.x - wire.from.x;
    const dy = wire.to.y - wire.from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const curvature = Math.min(distance * 0.3, 100);

    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal dominant
      ctx.bezierCurveTo(
        wire.from.x + curvature, wire.from.y,
        wire.to.x - curvature, wire.to.y,
        wire.to.x, wire.to.y
      );
    } else {
      // Vertical dominant
      ctx.bezierCurveTo(
        wire.from.x, wire.from.y + curvature,
        wire.to.x, wire.to.y - curvature,
        wire.to.x, wire.to.y
      );
    }
    ctx.stroke();

    // Draw inner bright line
    ctx.shadowBlur = 0;
    ctx.strokeStyle = lightenColor(wire.color, 40);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wire.from.x, wire.from.y);
    if (Math.abs(dx) > Math.abs(dy)) {
      ctx.bezierCurveTo(
        wire.from.x + curvature, wire.from.y,
        wire.to.x - curvature, wire.to.y,
        wire.to.x, wire.to.y
      );
    } else {
      ctx.bezierCurveTo(
        wire.from.x, wire.from.y + curvature,
        wire.to.x, wire.to.y - curvature,
        wire.to.x, wire.to.y
      );
    }
    ctx.stroke();

    // Draw connection points with glow
    ctx.shadowColor = wire.color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = wire.color;
    ctx.beginPath();
    ctx.arc(wire.from.x, wire.from.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(wire.to.x, wire.to.y, 5, 0, Math.PI * 2);
    ctx.fill();

    // Inner bright point
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(wire.from.x, wire.from.y, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(wire.to.x, wire.to.y, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
  }

  function drawProfessionalComponent(ctx: CanvasRenderingContext2D, component: Component, isHovered: boolean) {
    ctx.save();

    // Shadow for depth
    if (!isHovered) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
    } else {
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 25;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    switch (component.type) {
      case 'arduino':
        drawProfessionalArduino(ctx, component.x, component.y, isHovered);
        break;
      case 'resistor':
        drawProfessionalResistor(ctx, component.x, component.y, isHovered);
        break;
      case 'led':
        drawProfessionalLED(ctx, component.x, component.y, isHovered);
        break;
      case 'sensor':
        drawProfessionalSensor(ctx, component.x, component.y, isHovered);
        break;
      case 'motor':
        drawProfessionalMotor(ctx, component.x, component.y, isHovered);
        break;
      case 'battery':
        drawProfessionalBattery(ctx, component.x, component.y, isHovered);
        break;
      case 'button':
        drawProfessionalButton(ctx, component.x, component.y, isHovered);
        break;
      case 'capacitor':
        drawProfessionalCapacitor(ctx, component.x, component.y, isHovered);
        break;
    }

    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Draw label with background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = isHovered ? '#3b82f6' : '#475569';
    ctx.lineWidth = 2;
    const labelWidth = ctx.measureText(component.label).width + 20;
    ctx.fillRect(component.x - labelWidth / 2, component.y + 45, labelWidth, 25);
    ctx.strokeRect(component.x - labelWidth / 2, component.y + 45, labelWidth, 25);

    ctx.fillStyle = isHovered ? '#60a5fa' : '#e2e8f0';
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(component.label, component.x, component.y + 62);

    ctx.restore();
  }

  function drawProfessionalArduino(ctx: CanvasRenderingContext2D, x: number, y: number, isHovered: boolean) {
    // Main board with gradient
    const gradient = ctx.createLinearGradient(x - 50, y - 40, x + 50, y + 40);
    gradient.addColorStop(0, '#0ea5e9');
    gradient.addColorStop(1, '#0284c7');
    ctx.fillStyle = gradient;
    roundRect(ctx, x - 50, y - 40, 100, 80, 5);
    ctx.fill();

    // Border
    ctx.strokeStyle = isHovered ? '#38bdf8' : '#0369a1';
    ctx.lineWidth = 3;
    roundRect(ctx, x - 50, y - 40, 100, 80, 5);
    ctx.stroke();

    // USB port
    ctx.fillStyle = '#64748b';
    roundRect(ctx, x - 55, y - 15, 10, 30, 2);
    ctx.fill();

    // Power jack
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.arc(x - 35, y - 32, 6, 0, Math.PI * 2);
    ctx.fill();

    // IC chip
    ctx.fillStyle = '#1f2937';
    roundRect(ctx, x - 20, y - 15, 40, 30, 2);
    ctx.fill();

    // Pins
    ctx.fillStyle = '#fbbf24';
    for (let i = 0; i < 8; i++) {
      ctx.fillRect(x - 45 + i * 12, y + 35, 4, 10);
      ctx.fillRect(x - 45 + i * 12, y - 45, 4, 10);
    }

    // LED indicators
    const ledColors = ['#10b981', '#ef4444', '#f59e0b'];
    ledColors.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(x + 30, y - 25 + i * 15, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ARDUINO', x, y + 5);
    ctx.font = '10px Arial';
    ctx.fillText('UNO R3', x, y + 18);
  }

  function drawProfessionalResistor(ctx: CanvasRenderingContext2D, x: number, y: number, isHovered: boolean) {
    // Body with gradient
    const gradient = ctx.createLinearGradient(x - 25, y - 8, x + 25, y + 8);
    gradient.addColorStop(0, '#fef3c7');
    gradient.addColorStop(0.5, '#fde68a');
    gradient.addColorStop(1, '#fef3c7');
    ctx.fillStyle = gradient;
    roundRect(ctx, x - 25, y - 8, 50, 16, 3);
    ctx.fill();

    ctx.strokeStyle = isHovered ? '#fbbf24' : '#d97706';
    ctx.lineWidth = 2;
    roundRect(ctx, x - 25, y - 8, 50, 16, 3);
    ctx.stroke();

    // Leads
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 30, y);
    ctx.lineTo(x - 25, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 25, y);
    ctx.lineTo(x + 30, y);
    ctx.stroke();

    // Color bands
    const bands = [
      { color: '#dc2626', x: -15 },
      { color: '#ea580c', x: -5 },
      { color: '#ca8a04', x: 5 },
      { color: '#eab308', x: 15 }
    ];
    bands.forEach(band => {
      ctx.fillStyle = band.color;
      ctx.fillRect(x + band.x, y - 8, 4, 16);
    });
  }

  function drawProfessionalLED(ctx: CanvasRenderingContext2D, x: number, y: number, isHovered: boolean) {
    // LED body with radial gradient
    const gradient = ctx.createRadialGradient(x, y - 3, 5, x, y, 18);
    gradient.addColorStop(0, '#fef08a');
    gradient.addColorStop(0.3, '#fde047');
    gradient.addColorStop(0.7, '#ef4444');
    gradient.addColorStop(1, '#dc2626');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fill();

    // Glow effect
    ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(x - 5, y - 5, 5, 0, Math.PI * 2);
    ctx.fill();

    // Border
    ctx.strokeStyle = isHovered ? '#fbbf24' : '#991b1b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.stroke();

    // Leads
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 7, y + 15);
    ctx.lineTo(x - 7, y + 25);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 7, y + 15);
    ctx.lineTo(x + 7, y + 25);
    ctx.stroke();
  }

  function drawProfessionalSensor(ctx: CanvasRenderingContext2D, x: number, y: number, isHovered: boolean) {
    // Sensor body
    const gradient = ctx.createLinearGradient(x - 30, y - 20, x + 30, y + 20);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(1, '#1d4ed8');
    ctx.fillStyle = gradient;
    roundRect(ctx, x - 30, y - 20, 60, 40, 5);
    ctx.fill();

    ctx.strokeStyle = isHovered ? '#60a5fa' : '#1e40af';
    ctx.lineWidth = 3;
    roundRect(ctx, x - 30, y - 20, 60, 40, 5);
    ctx.stroke();

    // Sensor "eyes" (ultrasonic transducers)
    const eyeGradient = ctx.createRadialGradient(x - 12, y, 3, x - 12, y, 10);
    eyeGradient.addColorStop(0, '#94a3b8');
    eyeGradient.addColorStop(1, '#1f2937');
    
    ctx.fillStyle = eyeGradient;
    ctx.beginPath();
    ctx.arc(x - 12, y, 10, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(x + 12, y, 10, 0, Math.PI * 2);
    ctx.fill();

    // Inner mesh pattern
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(x - 12, y, 2 + i * 1.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + 12, y, 2 + i * 1.5, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Pins
    ctx.fillStyle = '#fbbf24';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(x - 22 + i * 15, y + 20, 4, 10);
    }
  }

  function drawProfessionalMotor(ctx: CanvasRenderingContext2D, x: number, y: number, isHovered: boolean) {
    // Motor body
    const gradient = ctx.createRadialGradient(x, y, 10, x, y, 25);
    gradient.addColorStop(0, '#fbbf24');
    gradient.addColorStop(1, '#d97706');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = isHovered ? '#fde047' : '#92400e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.stroke();

    // Motor shaft
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x - 4, y - 35, 8, 15);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 4, y - 35, 8, 15);

    // Motor details (ventilation slots)
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(angle) * 15, y + Math.sin(angle) * 15);
      ctx.lineTo(x + Math.cos(angle) * 20, y + Math.sin(angle) * 20);
      ctx.stroke();
    }

    // Center hub
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();

    // Terminals
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x - 30, y - 5, 10, 4);
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(x - 30, y + 1, 10, 4);
  }

  function drawProfessionalBattery(ctx: CanvasRenderingContext2D, x: number, y: number, isHovered: boolean) {
    // Battery body
    const gradient = ctx.createLinearGradient(x - 20, y - 30, x + 20, y + 30);
    gradient.addColorStop(0, '#374151');
    gradient.addColorStop(0.5, '#1f2937');
    gradient.addColorStop(1, '#111827');
    ctx.fillStyle = gradient;
    roundRect(ctx, x - 20, y - 30, 40, 60, 5);
    ctx.fill();

    ctx.strokeStyle = isHovered ? '#6b7280' : '#4b5563';
    ctx.lineWidth = 3;
    roundRect(ctx, x - 20, y - 30, 40, 60, 5);
    ctx.stroke();

    // Positive terminal
    ctx.fillStyle = '#ef4444';
    roundRect(ctx, x - 8, y - 35, 16, 8, 2);
    ctx.fill();

    // Plus/Minus symbols
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('+', x, y - 10);
    ctx.fillText('-', x, y + 20);

    // Battery level indicator
    const levelGradient = ctx.createLinearGradient(x - 15, y - 20, x - 15, y + 20);
    levelGradient.addColorStop(0, '#10b981');
    levelGradient.addColorStop(0.7, '#22c55e');
    levelGradient.addColorStop(1, '#16a34a');
    ctx.fillStyle = levelGradient;
    roundRect(ctx, x - 15, y - 5, 30, 15, 2);
    ctx.fill();
  }

  function drawProfessionalButton(ctx: CanvasRenderingContext2D, x: number, y: number, isHovered: boolean) {
    // Button base
    ctx.fillStyle = '#1f2937';
    roundRect(ctx, x - 20, y - 20, 40, 40, 5);
    ctx.fill();

    ctx.strokeStyle = isHovered ? '#4b5563' : '#374151';
    ctx.lineWidth = 3;
    roundRect(ctx, x - 20, y - 20, 40, 40, 5);
    ctx.stroke();

    // Button top with gradient
    const gradient = ctx.createRadialGradient(x, y - 2, 5, x, y, 15);
    gradient.addColorStop(0, '#fca5a5');
    gradient.addColorStop(0.5, '#ef4444');
    gradient.addColorStop(1, '#dc2626');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fill();

    // Shine effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(x - 4, y - 4, 5, 0, Math.PI * 2);
    ctx.fill();

    // Border
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.stroke();

    // Pins
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x - 23, y + 20, 4, 10);
    ctx.fillRect(x + 19, y + 20, 4, 10);
  }

  function drawProfessionalCapacitor(ctx: CanvasRenderingContext2D, x: number, y: number, isHovered: boolean) {
    // Capacitor body (cylindrical)
    const gradient = ctx.createLinearGradient(x - 15, y - 25, x + 15, y + 25);
    gradient.addColorStop(0, '#60a5fa');
    gradient.addColorStop(0.5, '#3b82f6');
    gradient.addColorStop(1, '#2563eb');
    ctx.fillStyle = gradient;
    roundRect(ctx, x - 15, y - 25, 30, 50, 5);
    ctx.fill();

    ctx.strokeStyle = isHovered ? '#93c5fd' : '#1e40af';
    ctx.lineWidth = 2;
    roundRect(ctx, x - 15, y - 25, 30, 50, 5);
    ctx.stroke();

    // Stripe
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x - 17, y - 25, 8, 50);

    // Polarity marking
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('-', x - 10, y + 5);

    // Leads
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 7, y + 25);
    ctx.lineTo(x - 7, y + 35);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 7, y + 25);
    ctx.lineTo(x + 7, y + 35);
    ctx.stroke();
  }

  function drawHeader(ctx: CanvasRenderingContext2D, width: number) {
    // Title background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(0, 0, width, 60);

    // Title
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 24px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('⚡ CIRCUIT DIAGRAM', 20, 35);

    // Subtitle
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px "Courier New", monospace';
    ctx.fillText('Professional Electronics Schematic', 20, 50);
  }

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
    const B = Math.min(255, (num & 0x0000ff) + amt);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let foundHover = false;
    components.forEach((comp, idx) => {
      const distance = Math.sqrt(Math.pow(mouseX - comp.x, 2) + Math.pow(mouseY - comp.y, 2));
      if (distance < 40) {
        setHoveredComponent(idx);
        foundHover = true;
      }
    });

    if (!foundHover) {
      setHoveredComponent(null);
    }
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border-2 border-gray-700 rounded-lg shadow-2xl bg-gray-900 cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredComponent(null)}
      />
      <div className="mt-4 p-6 bg-gradient-to-r from-blue-900/50 via-purple-900/50 to-blue-900/50 border-2 border-blue-700 rounded-lg backdrop-blur-sm">
        <h4 className="font-bold text-blue-200 mb-3 text-lg flex items-center gap-2">
          <span className="text-2xl">🔌</span> Circuit Components
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {components.map((comp, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border-2 transition-all ${
                hoveredComponent === idx
                  ? 'bg-blue-500/30 border-blue-400 scale-105'
                  : 'bg-gray-800/50 border-gray-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {comp.type === 'arduino' && '🤖'}
                  {comp.type === 'led' && '💡'}
                  {comp.type === 'motor' && '⚙️'}
                  {comp.type === 'sensor' && '📡'}
                  {comp.type === 'battery' && '🔋'}
                  {comp.type === 'button' && '🔘'}
                  {comp.type === 'resistor' && '⚡'}
                  {comp.type === 'capacitor' && '🔌'}
                </span>
                <span className="text-sm font-mono text-blue-100">{comp.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
