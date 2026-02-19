import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';

interface GameWrapperProps {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}

export function GameWrapper({ title, onBack, children }: GameWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full flex flex-col bg-black text-[#00ff00] p-4 md:p-8"
    >
      {/* Header with title and back button */}
      <div className="flex items-center justify-between mb-6">
        <motion.button
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 border-2 border-[#00ff00] rounded-lg text-[#00ff00] hover:bg-[#00ff00]/10 transition-all duration-300"
          style={{
            fontFamily: "'Press Start 2P', cursive",
            fontSize: '10px',
            boxShadow: '0 0 10px #00ff00'
          }}
          whileHover={{ scale: 1.05, boxShadow: '0 0 20px #00ff00' }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-4 h-4" />
          НАЗАД
        </motion.button>

        <motion.h1
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-xl md:text-2xl lg:text-3xl text-center flex-1"
          style={{
            fontFamily: "'Press Start 2P', cursive",
            textShadow: '0 0 20px #00ff00, 0 0 40px #00ff00'
          }}
        >
          {title}
        </motion.h1>

        <div className="w-24 md:w-32" /> {/* Spacer for centering */}
      </div>

      {/* Game content */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        {children}
      </div>
    </motion.div>
  );
}
