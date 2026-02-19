import { useEffect, useState, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  rotation: number;
  rotationSpeed: number;
}

export function CursorAura() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const lastMouseRef = useRef({ x: -100, y: -100, time: 0 });
  const orbitPixelsRef = useRef(
    Array.from({ length: 12 }, (_, i) => ({
      angle: (i * Math.PI * 2) / 12,
      distance: 30 + Math.random() * 10,
      size: 3 + Math.random() * 3,
      speed: 0.02 + Math.random() * 0.03,
      phase: Math.random() * Math.PI * 2,
      flickerSpeed: 2 + Math.random() * 2
    }))
  );

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const time = Date.now() * 0.001;

    // Update and draw trail particles
    particlesRef.current = particlesRef.current
      .map(p => ({
        ...p,
        life: p.life - 0.008,
        x: p.x + p.vx,
        y: p.y + p.vy,
        vx: p.vx * 0.97,
        vy: p.vy * 0.97,
        rotation: p.rotation + p.rotationSpeed
      }))
      .filter(p => p.life > 0);

    // Draw trail particles with glow
    particlesRef.current.forEach(particle => {
      const alpha = Math.pow(particle.life, 0.8); // Smoother fade
      
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      
      // Glow effect
      ctx.shadowBlur = 20 * alpha;
      ctx.shadowColor = `rgba(0, 255, 0, ${alpha})`;
      ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
      
      // Draw square pixel
      const halfSize = particle.size / 2;
      ctx.fillRect(-halfSize, -halfSize, particle.size, particle.size);
      
      // Inner bright core
      ctx.shadowBlur = 5;
      ctx.fillStyle = `rgba(150, 255, 150, ${alpha * 0.8})`;
      ctx.fillRect(-halfSize * 0.5, -halfSize * 0.5, particle.size * 0.5, particle.size * 0.5);
      
      ctx.restore();
    });

    // Draw orbiting pixels
    orbitPixelsRef.current.forEach((pixel, index) => {
      const angle = pixel.angle + time * pixel.speed;
      const wobble = Math.sin(time * 2 + pixel.phase) * 8;
      const x = mousePosition.x + Math.cos(angle) * (pixel.distance + wobble);
      const y = mousePosition.y + Math.sin(angle) * (pixel.distance + wobble);
      
      // Flicker effect
      const flicker = Math.sin(time * pixel.flickerSpeed + index) * 0.3 + 0.7;
      const alpha = 0.6 + flicker * 0.4;
      
      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowColor = `rgba(0, 255, 0, ${alpha})`;
      ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
      
      const halfSize = pixel.size / 2;
      ctx.fillRect(x - halfSize, y - halfSize, pixel.size, pixel.size);
      
      // Bright core
      ctx.shadowBlur = 5;
      ctx.fillStyle = `rgba(200, 255, 200, ${alpha * 0.6})`;
      ctx.fillRect(x - halfSize * 0.4, y - halfSize * 0.4, pixel.size * 0.4, pixel.size * 0.4);
      
      ctx.restore();
    });

    // Draw main glow
    const gradient = ctx.createRadialGradient(
      mousePosition.x, mousePosition.y, 0,
      mousePosition.x, mousePosition.y, 60
    );
    const pulseAlpha = 0.3 + Math.sin(time * 2) * 0.15;
    gradient.addColorStop(0, `rgba(0, 255, 0, ${pulseAlpha * 0.6})`);
    gradient.addColorStop(0.3, `rgba(0, 255, 0, ${pulseAlpha * 0.3})`);
    gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(
      mousePosition.x - 60, mousePosition.y - 60,
      120, 120
    );

    // Draw pulse ring
    const pulseScale = 1 + Math.sin(time * 2.5) * 0.3;
    const ringAlpha = 0.6 - (Math.sin(time * 2.5) * 0.5 + 0.5) * 0.6;
    ctx.strokeStyle = `rgba(0, 255, 0, ${ringAlpha})`;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 15;
    ctx.shadowColor = `rgba(0, 255, 0, ${ringAlpha})`;
    ctx.beginPath();
    ctx.arc(mousePosition.x, mousePosition.y, 25 * pulseScale, 0, Math.PI * 2);
    ctx.stroke();

    animationRef.current = requestAnimationFrame(animate);
  }, [mousePosition]);

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastMouseRef.current.time;
      
      setMousePosition({ x: e.clientX, y: e.clientY });

      // Calculate velocity
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      const speed = Math.sqrt(dx * dx + dy * dy);

      // Create trail particles
      if (deltaTime > 15 && speed > 0.5) {
        const particleCount = Math.min(Math.floor(speed / 8) + 2, 6);

        for (let i = 0; i < particleCount; i++) {
          const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * Math.PI * 0.5;
          const spreadDistance = Math.random() * 20;
          
          particlesRef.current.push({
            x: e.clientX + Math.cos(angle + Math.PI) * spreadDistance,
            y: e.clientY + Math.sin(angle + Math.PI) * spreadDistance,
            vx: -dx * 0.1 + (Math.random() - 0.5) * 1,
            vy: -dy * 0.1 + (Math.random() - 0.5) * 1,
            size: 3 + Math.random() * 4,
            life: 1,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1
          });
        }

        // Limit particle count
        if (particlesRef.current.length > 80) {
          particlesRef.current = particlesRef.current.slice(-80);
        }

        lastMouseRef.current = { x: e.clientX, y: e.clientY, time: currentTime };
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Start animation loop
  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Canvas for all effects */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ imageRendering: 'pixelated' }}
      />

      {/* Custom pixel cursor arrow */}
      <div
        className="absolute"
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
          transform: 'translate(0, 0)',
          transition: 'left 0.05s ease-out, top 0.05s ease-out'
        }}
      >
        <svg 
          width="26" 
          height="26" 
          viewBox="0 0 26 26"
          style={{
            filter: 'drop-shadow(0 0 8px #00ff00) drop-shadow(0 0 16px #00ff00) drop-shadow(0 0 24px rgba(0, 255, 0, 0.5))'
          }}
        >
          {/* Outer glow pixels */}
          <rect x="0" y="0" width="3" height="3" fill="#00ff00" />
          <rect x="0" y="3" width="3" height="3" fill="#00ff00" />
          <rect x="3" y="3" width="3" height="3" fill="#00ff00" />
          <rect x="0" y="6" width="3" height="3" fill="#00ff00" />
          <rect x="3" y="6" width="3" height="3" fill="#00ff00" />
          <rect x="6" y="6" width="3" height="3" fill="#00ff00" />
          <rect x="0" y="9" width="3" height="3" fill="#00ff00" />
          <rect x="3" y="9" width="3" height="3" fill="#00ff00" />
          <rect x="6" y="9" width="3" height="3" fill="#00ff00" />
          <rect x="9" y="9" width="3" height="3" fill="#00ff00" />
          <rect x="0" y="12" width="3" height="3" fill="#00ff00" />
          <rect x="3" y="12" width="3" height="3" fill="#00ff00" />
          <rect x="6" y="12" width="3" height="3" fill="#00ff00" />
          <rect x="9" y="12" width="3" height="3" fill="#00ff00" />
          <rect x="12" y="12" width="3" height="3" fill="#00ff00" />
          <rect x="0" y="15" width="3" height="3" fill="#00ff00" />
          <rect x="3" y="15" width="3" height="3" fill="#00ff00" />
          <rect x="6" y="15" width="3" height="3" fill="#00ff00" />
          <rect x="3" y="18" width="3" height="3" fill="#00ff00" />
          <rect x="6" y="18" width="3" height="3" fill="#00ff00" />
          <rect x="6" y="21" width="3" height="3" fill="#00ff00" />
          
          {/* Bright inner highlights */}
          <rect x="3" y="6" width="3" height="3" fill="#80ff80" opacity="0.8" />
          <rect x="3" y="9" width="3" height="3" fill="#80ff80" opacity="0.8" />
          <rect x="6" y="9" width="3" height="3" fill="#80ff80" opacity="0.8" />
          <rect x="3" y="12" width="3" height="3" fill="#b3ffb3" opacity="0.9" />
          <rect x="6" y="12" width="3" height="3" fill="#b3ffb3" opacity="0.9" />
          <rect x="9" y="12" width="3" height="3" fill="#80ff80" opacity="0.8" />
        </svg>
      </div>
    </div>
  );
}
