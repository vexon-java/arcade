import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export function InteractiveBackground({ theme = 'cyan' }: { theme?: 'cyan' | 'green' | 'red' }) {
    const bgRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let w: number, h: number;
        const stars: { x: number; y: number; size: number; opacity: number; velocity: number }[] = [];

        const init = () => {
            w = window.innerWidth;
            h = window.innerHeight;
            canvas.width = w;
            canvas.height = h;
            stars.length = 0;
            for (let i = 0; i < 400; i++) {
                stars.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    size: Math.random() * 1.5,
                    opacity: Math.random(),
                    velocity: Math.random() * 0.05
                });
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, w, h);
            stars.forEach(star => {
                ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();

                // Gentle drift
                star.y -= star.velocity;
                if (star.y < 0) star.y = h;
            });
            animationFrameId = requestAnimationFrame(draw);
        };

        init();
        draw();

        window.addEventListener('resize', init);

        // Parallax movement for the gradient layer
        const xTo = gsap.quickTo(bgRef.current, "x", { duration: 1.2, ease: "power2.out" });
        const yTo = gsap.quickTo(bgRef.current, "y", { duration: 1.2, ease: "power2.out" });

        const handleMouseMove = (e: MouseEvent) => {
            const moveX = (e.clientX / window.innerWidth - 0.5) * -30;
            const moveY = (e.clientY / window.innerHeight - 0.5) * -30;
            xTo(moveX);
            yTo(moveY);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('resize', init);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-[#050505]">
            {/* Deep Cosmic Gradient Layer */}
            <div
                ref={bgRef}
                className="absolute inset-[-50px] w-[calc(100%+100px)] h-[calc(100%+100px)]"
                style={{
                    background: theme === 'green'
                        ? `radial-gradient(circle at 50% 50%, #001a00 0%, #000a00 40%, #050505 100%),
                           radial-gradient(circle at 20% 30%, rgba(0, 255, 0, 0.05) 0%, transparent 50%),
                           radial-gradient(circle at 80% 70%, rgba(0, 255, 0, 0.03) 0%, transparent 50%)`
                        : theme === 'red'
                            ? `radial-gradient(circle at 50% 50%, #1a0000 0%, #0a0000 40%, #050505 100%),
                           radial-gradient(circle at 20% 30%, rgba(255, 0, 0, 0.05) 0%, transparent 50%),
                           radial-gradient(circle at 80% 70%, rgba(255, 0, 0, 0.03) 0%, transparent 50%)`
                            : `radial-gradient(circle at 50% 50%, #001a1a 0%, #000a0a 40%, #050505 100%),
                           radial-gradient(circle at 20% 30%, rgba(0, 243, 255, 0.15) 0%, transparent 50%),
                           radial-gradient(circle at 80% 70%, rgba(0, 243, 255, 0.05) 0%, transparent 50%)`
                }}
            />

            {/* Canvas Starfield */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full opacity-60"
            />

            {/* Subtle Nebula Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-purple-500/5 mix-blend-screen pointer-events-none" />
        </div>
    );
}
