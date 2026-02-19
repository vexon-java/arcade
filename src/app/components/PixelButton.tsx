import { motion } from 'motion/react';
import { useState } from 'react';
import { PixelAura } from '@/app/components/PixelAura';

interface PixelButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  delay?: number;
  size?: 'large' | 'normal' | 'small';
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export function PixelButton({
  onClick,
  children,
  delay = 0,
  size = 'normal',
  variant = 'primary',
  className = '',
  type = 'button',
  disabled = false
}: PixelButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClass = size === 'large' ? 'w-56 h-56 text-2xl' : (size === 'small' ? 'px-4 py-2 text-sm' : 'w-64 h-20 text-xl');

  const variantStyles = {
    primary: 'border-primary text-primary hover:bg-primary hover:text-black shadow-[0_0_20px_var(--primary),inset_0_0_20px_var(--secondary)]',
    secondary: 'border-primary/40 text-primary/70 hover:border-primary hover:bg-primary/10 shadow-[0_0_10px_var(--secondary)]',
    danger: 'border-red-500 text-red-500 hover:bg-red-500 hover:text-black shadow-[0_0_20px_rgba(239,68,68,0.3)]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, type: 'spring' }}
      className={`relative ${size === 'small' ? 'inline-block' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && <PixelAura />}

      <motion.button
        onClick={!disabled ? onClick : undefined}
        type={type}
        disabled={disabled}
        className={`relative z-10 ${sizeClass} bg-black border-4 rounded-xl transition-all duration-300 flex items-center justify-center ${variantStyles[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
        style={{
          fontFamily: "'Press Start 2P', cursive",
        }}
        whileHover={!disabled ? {
          scale: 1.05,
          boxShadow: variant === 'primary' ? '0 0 40px #00ff00, inset 0 0 30px rgba(0, 255, 0, 0.3)' : undefined
        } : {}}
        whileTap={!disabled ? { scale: 0.95 } : {}}
      >
        <span className="text-center px-4 leading-tight">{children}</span>
      </motion.button>
    </motion.div>
  );
}