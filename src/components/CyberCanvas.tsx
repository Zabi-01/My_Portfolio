import { useEffect, useRef } from 'react';

interface CyberCanvasProps {
  themeScheme?: string;
  bgStyle?: 'particles-drift' | 'cyber-grid' | 'clean';
}

export default function CyberCanvas({ themeScheme = 'dark-cosmic', bgStyle = 'particles-drift' }: CyberCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Set dimensions
    canvas.width = width;
    canvas.height = height;

    // Determine colors based on active theme scheme
    let primaryColor = '#FF5C00';
    let secondaryColor = '#00FF00';
    let backgroundColor = '#0A0A0A';
    let lineColors = 'rgba(38, 38, 38, 0.25)';
    let glowCharColor = '#ffffff';

    if (themeScheme === 'dark-matrix') {
      primaryColor = '#00FF00';
      secondaryColor = '#FF5C00';
      backgroundColor = '#050B05';
      lineColors = 'rgba(0, 255, 0, 0.12)';
      glowCharColor = '#ffffff';
    } else if (themeScheme === 'dark-cyberpunk') {
      primaryColor = '#FF007F';
      secondaryColor = '#00F0FF';
      backgroundColor = '#0B0516';
      lineColors = 'rgba(255, 0, 127, 0.08)';
      glowCharColor = '#FFEEFF';
    } else if (themeScheme === 'dark-nordic') {
      primaryColor = '#88C0D0';
      secondaryColor = '#A3BE8C';
      backgroundColor = '#1C2028';
      lineColors = 'rgba(136, 192, 208, 0.06)';
      glowCharColor = '#E5E9F0';
    } else if (themeScheme === 'light-protocol') {
      primaryColor = '#0A8491';
      secondaryColor = '#008000';
      backgroundColor = '#F4F7F6';
      lineColors = 'rgba(10, 132, 145, 0.08)';
      glowCharColor = '#111A1C';
    } else if (themeScheme === 'light-retro') {
      primaryColor = '#B14A00';
      secondaryColor = '#115E59';
      backgroundColor = '#FAF6EE';
      lineColors = 'rgba(177, 74, 0, 0.08)';
      glowCharColor = '#2E251B';
    } else if (themeScheme === 'light-ocean') {
      primaryColor = '#005D9E';
      secondaryColor = '#0284C7';
      backgroundColor = '#EAF3F9';
      lineColors = 'rgba(0, 93, 158, 0.07)';
      glowCharColor = '#0D233A';
    }

    // PARTICLES DRIFT CONFIG
    interface DriftParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
    }
    const particleCount = 45;
    const particles: DriftParticle[] = Array(particleCount).fill(0).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4, // ultra-slow drift speed
      vy: (Math.random() - 0.5) * 0.4,
      radius: 1.2 + Math.random() * 1.8,
      color: Math.random() > 0.5 ? primaryColor : secondaryColor,
    }));

    // CYBER GRID CONFIG
    const gridSize = 64;
    interface Ray {
      pos: number;
      speed: number;
      vertical: boolean;
      color: string;
      width: number;
    }

    const rays: Ray[] = [
      { pos: Math.random() * width, speed: 0.8, vertical: true, color: primaryColor + '0f', width: 1.5 },
      { pos: Math.random() * height, speed: 0.5, vertical: false, color: secondaryColor + '0d', width: 1.2 },
      { pos: Math.random() * width, speed: -0.6, vertical: true, color: primaryColor + '0d', width: 2 },
    ];

    interface DataNode {
      x: number;
      y: number;
      size: number;
      alpha: number;
      fadeSpeed: number;
      color: string;
    }

    const nodes: DataNode[] = Array(15).fill(0).map(() => ({
      x: Math.floor(Math.random() * (width / gridSize)) * gridSize,
      y: Math.floor(Math.random() * (height / gridSize)) * gridSize,
      size: 1.5 + Math.random() * 2,
      alpha: Math.random(),
      fadeSpeed: 0.005 + Math.random() * 0.01,
      color: Math.random() > 0.6 ? secondaryColor : primaryColor,
    }));

    const handleResize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    
    resizeObserver.observe(document.body);

    let frameCount = 0;

    const render = () => {
      frameCount++;

      if (bgStyle === 'clean') {
        // Simple plain background canvas
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
        animationId = requestAnimationFrame(render);
        return;
      }

      if (bgStyle === 'particles-drift') {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);

        // Update and draw particles
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;

          // Wrap around boundary bounds
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color + 'aa'; // Alpha translucency
          ctx.fill();
        });

        // Draw connections (thin vector line links)
        ctx.lineWidth = 0.45;
        const maxDist = 90;

        for (let i = 0; i < particles.length; i++) {
          const p1 = particles[i];
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < maxDist) {
              const alpha = (1 - dist / maxDist) * 0.15;
              ctx.strokeStyle = p1.color === p2.color 
                ? p1.color + Math.floor(alpha * 255).toString(16).padStart(2, '0')
                : 'rgba(255,255,255,' + alpha + ')';
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      } else {
        // Default: 'cyber-grid' bento scan alignment
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);

        // Draw alignment grid (graph pattern)
        ctx.strokeStyle = lineColors;
        ctx.lineWidth = 0.5;

        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();

          // Subtle digital coordinate tag markers alongside the grid
          if (x % (gridSize * 4) === 0 && x > 0 && x < width - 50) {
            ctx.fillStyle = secondaryColor + '40';
            ctx.font = '7px monospace';
            ctx.fillText(`LOC_0x${x.toString(16).toUpperCase()}`, x + 4, 12);
          }
        }

        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();

          if (y % (gridSize * 4) === 0 && y > 0 && y < height - 50) {
            ctx.fillStyle = primaryColor + '40';
            ctx.font = '7px monospace';
            ctx.fillText(`CH_${Math.floor(y / 10)}`, 4, y - 4);
          }
        }

        // Draw elegant flowing cyber graph lines (waveforms with movement)
        const time = frameCount * 0.006;
        
        const drawWave = (
          amplitude: number, 
          frequency: number, 
          phaseShift: number, 
          color: string, 
          thickness: number,
          baseYOffsetPercent: number // percentage of height where wave centers
        ) => {
          ctx.beginPath();
          ctx.strokeStyle = color;
          ctx.lineWidth = thickness;
          
          const baseY = height * baseYOffsetPercent;
          
          for (let x = 0; x < width; x += 5) {
            // Advanced moving graph lines math combining multiple sines/cosines for high-fidelity cybersecurity packet wave stream
            const waveY = Math.sin(x * frequency + time + phaseShift) * 
                          Math.cos(x * 0.001 - time * 0.4) * amplitude + 
                          Math.sin(x * 0.006 + time * 1.8) * (amplitude * 0.25);
            
            const y = baseY + waveY;
            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }

            // Draw micro pulsing telemetry ticks on points of the wave
            if (x % 240 === 0 && Math.abs(waveY) > 20) {
              ctx.fillStyle = primaryColor + '66';
              ctx.fillRect(x - 1, y - 1, 3, 3);
              ctx.fillStyle = glowCharColor + '50';
              ctx.font = '6px monospace';
              ctx.fillText(`${Math.floor(y)}v`, x + 5, y - 2);
            }
          }
          ctx.stroke();
        };

        // Graph wave 1: Primary color (cyber pulse wave)
        drawWave(80, 0.0035, 0, primaryColor + '20', 1.5, 0.55);
        // Graph wave 2: Secondary color (high frequency signal line)
        drawWave(40, 0.006, Math.PI / 2, secondaryColor + '28', 1.0, 0.45);
        // Graph wave 3: Dim slow-moving backup line (system baseline)
        drawWave(100, 0.0012, Math.PI, primaryColor + '0d', 2.0, 0.65);

        // Draw dynamic grid crosshair scanning indicator matching mouse or automated motion
        const crosshairX = (width * 0.5) + Math.cos(time * 0.5) * (width * 0.3);
        const crosshairY = (height * 0.5) + Math.sin(time * 0.8) * (height * 0.2);

        // Crosshair focus box
        ctx.strokeStyle = secondaryColor + '22';
        ctx.lineWidth = 1;
        ctx.strokeRect(crosshairX - 15, crosshairY - 15, 30, 30);
        
        ctx.fillStyle = secondaryColor + '1a';
        ctx.fillRect(crosshairX - 2, crosshairY - 2, 4, 4);

        ctx.fillStyle = secondaryColor + '44';
        ctx.font = '7px monospace';
        ctx.fillText(`SYS_SCAN // [${Math.floor(crosshairX)}, ${Math.floor(crosshairY)}]`, crosshairX + 20, crosshairY - 5);

        // Animated laser rays
        rays.forEach((ray) => {
          ctx.beginPath();
          if (ray.vertical) {
            ctx.strokeStyle = ray.color;
            ctx.lineWidth = ray.width;
            ctx.moveTo(ray.pos, 0);
            ctx.lineTo(ray.pos, height);
            ctx.stroke();

            ray.pos += ray.speed;
            if (ray.pos > width + 100) ray.pos = -50;
            if (ray.pos < -100) ray.pos = width + 50;
          } else {
            ctx.strokeStyle = ray.color;
            ctx.lineWidth = ray.width;
            ctx.moveTo(0, ray.pos);
            ctx.lineTo(width, ray.pos);
            ctx.stroke();

            ray.pos += ray.speed;
            if (ray.pos > height + 100) ray.pos = -50;
            if (ray.pos < -100) ray.pos = height + 50;
          }
        });

        // Intersecting nodes
        nodes.forEach((node) => {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.size + (1 - node.alpha) * 2, 0, Math.PI * 2);
          ctx.fillStyle = node.color + Math.floor(node.alpha * 255).toString(16).padStart(2, '0');
          ctx.fill();

          node.alpha -= node.fadeSpeed;
          if (node.alpha <= 0) {
            node.x = Math.floor(Math.random() * (width / gridSize)) * gridSize;
            node.y = Math.floor(Math.random() * (height / gridSize)) * gridSize;
            node.alpha = 1;
          }
        });
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, [themeScheme, bgStyle]);

  return (
    <canvas
      id="cyber-bg"
      className="fixed inset-0 w-full h-full z-[-1] pointer-events-none opacity-70 md:opacity-85"
      ref={canvasRef}
    />
  );
}
