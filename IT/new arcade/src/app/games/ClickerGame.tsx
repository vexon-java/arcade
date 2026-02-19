import { useState, useEffect } from 'react';
import { GameWrapper } from '@/app/components/GameWrapper';
import { MousePointer, Zap, TrendingUp } from 'lucide-react';

export function ClickerGame({ onBack }: { onBack: () => void }) {
  const [clicks, setClicks] = useState(0);
  const [clickPower, setClickPower] = useState(1);
  const [autoClickers, setAutoClickers] = useState(0);
  const [multiplier, setMultiplier] = useState(1);

  const clickPowerCost = Math.floor(10 * Math.pow(1.5, clickPower));
  const autoClickerCost = Math.floor(50 * Math.pow(2, autoClickers));
  const multiplierCost = Math.floor(100 * Math.pow(3, multiplier));

  useEffect(() => {
    if (autoClickers > 0) {
      const interval = setInterval(() => {
        setClicks(prev => prev + autoClickers * multiplier);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [autoClickers, multiplier]);

  const handleClick = () => {
    setClicks(clicks + clickPower * multiplier);
  };

  const buyClickPower = () => {
    if (clicks >= clickPowerCost) {
      setClicks(clicks - clickPowerCost);
      setClickPower(clickPower + 1);
    }
  };

  const buyAutoClicker = () => {
    if (clicks >= autoClickerCost) {
      setClicks(clicks - autoClickerCost);
      setAutoClickers(autoClickers + 1);
    }
  };

  const buyMultiplier = () => {
    if (clicks >= multiplierCost) {
      setClicks(clicks - multiplierCost);
      setMultiplier(multiplier + 1);
    }
  };

  return (
    <GameWrapper title="КЛИКЕР" onBack={onBack}>
      <div className="flex flex-col items-center gap-6 w-full max-w-2xl px-4">
        <div className="text-3xl" style={{ fontFamily: "'Press Start 2P', cursive" }}>
          КЛИКОВ: {clicks}
        </div>

        <button
          onClick={handleClick}
          className="w-48 h-48 border-8 border-[#00ff00] rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
          style={{
            boxShadow: '0 0 30px #00ff00, inset 0 0 30px rgba(0, 255, 0, 0.2)',
            background: 'radial-gradient(circle, rgba(0,255,0,0.2) 0%, rgba(0,255,0,0.05) 100%)'
          }}
        >
          <MousePointer className="w-24 h-24 text-[#00ff00]" />
        </button>

        <div className="text-sm" style={{ fontFamily: "'Press Start 2P', cursive" }}>
          +{clickPower * multiplier} за клик | +{autoClickers * multiplier}/сек
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          <button
            onClick={buyClickPower}
            disabled={clicks < clickPowerCost}
            className="p-4 border-4 border-[#00ff00] hover:bg-[#00ff00] hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              fontFamily: "'Press Start 2P', cursive",
              fontSize: '10px',
              lineHeight: '1.8',
              boxShadow: '0 0 10px #00ff00'
            }}
          >
            <div className="flex flex-col items-center gap-2">
              <MousePointer className="w-8 h-8" />
              <div>СИЛА КЛИКА</div>
              <div>Уровень: {clickPower}</div>
              <div>Цена: {clickPowerCost}</div>
            </div>
          </button>

          <button
            onClick={buyAutoClicker}
            disabled={clicks < autoClickerCost}
            className="p-4 border-4 border-[#00ff00] hover:bg-[#00ff00] hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              fontFamily: "'Press Start 2P', cursive",
              fontSize: '10px',
              lineHeight: '1.8',
              boxShadow: '0 0 10px #00ff00'
            }}
          >
            <div className="flex flex-col items-center gap-2">
              <Zap className="w-8 h-8" />
              <div>АВТО-КЛИКЕР</div>
              <div>Кол-во: {autoClickers}</div>
              <div>Цена: {autoClickerCost}</div>
            </div>
          </button>

          <button
            onClick={buyMultiplier}
            disabled={clicks < multiplierCost}
            className="p-4 border-4 border-[#00ff00] hover:bg-[#00ff00] hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              fontFamily: "'Press Start 2P', cursive",
              fontSize: '10px',
              lineHeight: '1.8',
              boxShadow: '0 0 10px #00ff00'
            }}
          >
            <div className="flex flex-col items-center gap-2">
              <TrendingUp className="w-8 h-8" />
              <div>МНОЖИТЕЛЬ</div>
              <div>x{multiplier}</div>
              <div>Цена: {multiplierCost}</div>
            </div>
          </button>
        </div>
      </div>
    </GameWrapper>
  );
}
