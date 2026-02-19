import { useState, useEffect } from 'react';
import { GameWrapper } from '@/app/components/GameWrapper';

interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const symbols = ['♔', '♕', '♖', '♗', '♘', '♙', '★', '◆'];

export function MemoryGame({ onBack }: { onBack: () => void }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);

  const initializeGame = () => {
    const gameSymbols = [...symbols, ...symbols];
    const shuffled = gameSymbols
      .sort(() => Math.random() - 0.5)
      .map((value, index) => ({
        id: index,
        value,
        isFlipped: false,
        isMatched: false
      }));
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2) return;
    if (cards[id].isFlipped || cards[id].isMatched) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      const [first, second] = newFlipped;

      if (cards[first].value === cards[second].value) {
        setTimeout(() => {
          const matched = [...cards];
          matched[first].isMatched = true;
          matched[second].isMatched = true;
          setCards(matched);
          setFlippedCards([]);
          setMatches(matches + 1);
        }, 500);
      } else {
        setTimeout(() => {
          const unflipped = [...cards];
          unflipped[first].isFlipped = false;
          unflipped[second].isFlipped = false;
          setCards(unflipped);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const isGameWon = matches === symbols.length;

  return (
    <GameWrapper title="ПАМЯТЬ" onBack={onBack}>
      <div className="flex flex-col items-center gap-6">
        <div className="flex gap-8 text-lg" style={{ fontFamily: "'Press Start 2P', cursive" }}>
          <div>ХОДОВ: {moves}</div>
          <div>ПАРЫ: {matches}/{symbols.length}</div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {cards.map(card => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className="w-20 h-20 border-4 border-[#00ff00] flex items-center justify-center text-4xl transition-all duration-300"
              style={{
                backgroundColor: card.isFlipped || card.isMatched 
                  ? 'rgba(0, 255, 0, 0.2)' 
                  : 'rgba(0, 255, 0, 0.05)',
                boxShadow: card.isFlipped || card.isMatched 
                  ? '0 0 20px #00ff00' 
                  : '0 0 10px rgba(0, 255, 0, 0.3)',
                cursor: card.isMatched ? 'default' : 'pointer',
                opacity: card.isMatched ? 0.5 : 1
              }}
            >
              {(card.isFlipped || card.isMatched) && (
                <span className="text-[#00ff00]">{card.value}</span>
              )}
            </button>
          ))}
        </div>

        {isGameWon && (
          <div className="text-xl animate-pulse" style={{ fontFamily: "'Press Start 2P', cursive" }}>
            ПОБЕДА! ХОДОВ: {moves}
          </div>
        )}

        <button
          onClick={initializeGame}
          className="px-8 py-3 border-2 border-[#00ff00] hover:bg-[#00ff00] hover:text-black transition-all"
          style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '12px', boxShadow: '0 0 10px #00ff00' }}
        >
          НОВАЯ ИГРА
        </button>
      </div>
    </GameWrapper>
  );
}
