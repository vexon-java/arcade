import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { motion, AnimatePresence } from 'motion/react';
import { GameWrapper } from '@/app/components/GameWrapper';

type CellState = 'empty' | 'ship' | 'hit' | 'miss' | 'preview-valid' | 'preview-invalid';
type Orientation = 'horizontal' | 'vertical';

const GRID_SIZE = 10;
const SHIPS = [
  { name: 'Авианосец', length: 5 },
  { name: 'Линкор', length: 4 },
  { name: 'Эсминец', length: 3 },
  { name: 'Подлодка', length: 3 },
  { name: 'Катер', length: 2 },
];

export function BattleshipGame({ onBack, onGameOver, theme = 'cyan' }: { onBack: () => void, onGameOver?: (score: number, type: 'victory' | 'defeat') => void, theme?: 'cyan' | 'red' | 'green' }) {
  const [playerBoard, setPlayerBoard] = useState<CellState[][]>(() =>
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('empty'))
  );
  const [aiBoard, setAiBoard] = useState<CellState[][]>(() =>
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('empty'))
  );
  const [setupMode, setSetupMode] = useState(true);
  const [currentShipIndex, setCurrentShipIndex] = useState(0);
  const [orientation, setOrientation] = useState<Orientation>('horizontal');
  const [playerShipsPositions, setPlayerShipsPositions] = useState<{ row: number, col: number, length: number, orientation: Orientation }[]>([]);
  const [aiShipsPositions, setAiShipsPositions] = useState<{ row: number, col: number, length: number, orientation: Orientation }[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState('');
  const [playerHits, setPlayerHits] = useState(0);
  const [aiHits, setAiHits] = useState(0);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const boardRef = useRef<HTMLDivElement>(null);
  const radarRef = useRef<HTMLDivElement>(null);
  const [combatLog, setCombatLog] = useState<{ id: number, msg: string, type: 'player' | 'ai' | 'system' }[]>([]);
  const [aiHuntingState, setAiHuntingState] = useState<{ status: 'searching' | 'hunting', hits: { r: number, c: number }[] }>({
    status: 'searching',
    hits: []
  });

  const totalShipCells = SHIPS.reduce((acc, ship) => acc + ship.length, 0);

  const addLog = (msg: string, type: 'player' | 'ai' | 'system') => {
    setCombatLog(prev => [{ id: Date.now(), msg, type }, ...prev].slice(0, 10));
  };

  // Radar Sweep Animation
  useEffect(() => {
    if (!setupMode && radarRef.current) {
      gsap.to(radarRef.current, {
        rotate: 360,
        duration: 4,
        repeat: -1,
        ease: "none"
      });
    }
  }, [setupMode]);

  // Initialize AI ships randomly
  useEffect(() => {
    const newAiBoard = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('empty'));
    const positions: typeof aiShipsPositions = [];

    SHIPS.forEach(ship => {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 100) {
        attempts++;
        const orient: Orientation = Math.random() > 0.5 ? 'horizontal' : 'vertical';
        const row = Math.floor(Math.random() * (orient === 'vertical' ? GRID_SIZE - ship.length + 1 : GRID_SIZE));
        const col = Math.floor(Math.random() * (orient === 'horizontal' ? GRID_SIZE - ship.length + 1 : GRID_SIZE));

        if (canPlaceShip(newAiBoard, row, col, ship.length, orient)) {
          for (let i = 0; i < ship.length; i++) {
            const r = orient === 'vertical' ? row + i : row;
            const c = orient === 'horizontal' ? col + i : col;
            newAiBoard[r][c] = 'ship';
          }
          positions.push({ row, col, length: ship.length, orientation: orient });
          placed = true;
        }
      }
    });
    setAiBoard(newAiBoard);
    setAiShipsPositions(positions);
  }, []);

  function canPlaceShip(board: CellState[][], row: number, col: number, length: number, orient: Orientation) {
    for (let i = 0; i < length; i++) {
      const r = orient === 'vertical' ? row + i : row;
      const c = orient === 'horizontal' ? col + i : col;

      // Check bounds
      if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return false;

      // Check if cell is occupied
      if (board[r][c] !== 'empty') return false;

      // Ship-to-ship distance check (buffer)
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
            if (board[nr][nc] === 'ship') return false;
          }
        }
      }
    }
    return true;
  }

  const handleCellClick = (row: number, col: number) => {
    if (setupMode) {
      const ship = SHIPS[currentShipIndex];
      if (canPlaceShip(playerBoard, row, col, ship.length, orientation)) {
        const newBoard = playerBoard.map(r => [...r]);
        for (let i = 0; i < ship.length; i++) {
          const r = orientation === 'vertical' ? row + i : row;
          const c = orientation === 'horizontal' ? col + i : col;
          newBoard[r][c] = 'ship';
        }
        setPlayerBoard(newBoard);
        setPlayerShipsPositions([...playerShipsPositions, { row, col, length: ship.length, orientation }]);

        if (currentShipIndex + 1 < SHIPS.length) {
          setCurrentShipIndex(currentShipIndex + 1);
        } else {
          setSetupMode(false);
        }
      } else {
        // Shake animation for invalid placement
        if (boardRef.current) {
          gsap.to(boardRef.current, {
            x: 10, duration: 0.1, repeat: 3, yoyo: true, onComplete: () => {
              gsap.set(boardRef.current, { x: 0 });
            }
          });
        }
      }
    }
  };

  const playerAttack = (row: number, col: number) => {
    if (setupMode || gameOver || isAiThinking) return;
    if (aiBoard[row][col] === 'hit' || aiBoard[row][col] === 'miss') return;

    const newBoard = aiBoard.map(r => [...r]);
    // Check if hit
    if (newBoard[row][col] === 'ship') {
      newBoard[row][col] = 'hit';
      const newHits = playerHits + 1;
      setPlayerHits(newHits);
      addLog(`КРИТИЧЕСКОЕ ПОПАДАНИЕ ПО ЦЕЛИ [${row},${col}]`, 'player');

      // Impact animation
      gsap.fromTo(`.ai-cell-${row}-${col}`,
        { scale: 1, filter: 'brightness(1)' },
        { scale: 1.4, filter: 'brightness(2)', duration: 0.2, yoyo: true, repeat: 1, ease: "power2.out" }
      );

      if (newHits === totalShipCells) {
        setGameOver(true);
        setWinner('Игрок');
        onGameOver?.(100, 'victory');
      }
      // Player gets another turn on hit - do NOT set isAiThinking(true)
    } else {
      // Miss - hand over to AI
      newBoard[row][col] = 'miss';
      addLog(`ПРОМАХ В СЕКТОРЕ [${row},${col}]`, 'system');
      setIsAiThinking(true); // Lock player input
      setTimeout(() => aiTurn(), 1000); // Wait 1s then AI moves
    }
    setAiBoard(newBoard);
  };

  const aiTurn = () => {
    if (gameOver) return;

    let row, col;

    // Tactical Hunter AI
    const getTargetCoords = () => {
      // ... (existing AI logic is fine, just re-using it effectively)
      if (aiHuntingState.status === 'hunting' && aiHuntingState.hits.length > 0) {
        const lastHit = aiHuntingState.hits[aiHuntingState.hits.length - 1];
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

        // Try neighbors of last hit
        for (const [dr, dc] of directions) {
          const nr = lastHit.r + dr;
          const nc = lastHit.c + dc;
          if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
            if (playerBoard[nr][nc] !== 'hit' && playerBoard[nr][nc] !== 'miss') {
              return { r: nr, c: nc };
            }
          }
        }
        // If blocked, try neighbors of first hit (in case we went down a line and missed)
        const firstHit = aiHuntingState.hits[0];
        for (const [dr, dc] of directions) {
          const nr = firstHit.r + dr;
          const nc = firstHit.c + dc;
          if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
            if (playerBoard[nr][nc] !== 'hit' && playerBoard[nr][nc] !== 'miss') {
              return { r: nr, c: nc };
            }
          }
        }
      }

      // Random search for valid target
      const available: { r: number, c: number }[] = [];
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (playerBoard[r][c] !== 'hit' && playerBoard[r][c] !== 'miss') {
            available.push({ r, c });
          }
        }
      }
      if (available.length === 0) return null;
      return available[Math.floor(Math.random() * available.length)];
    };

    const target = getTargetCoords();
    if (!target) {
      setIsAiThinking(false); // Should not happen, but safe fallback
      return;
    }

    row = target.r;
    col = target.c;

    // We must update state based on current playerBoard
    setPlayerBoard(prevBoard => {
      const newBoard = prevBoard.map(r => [...r]);
      const cellContent = newBoard[row][col];

      if (cellContent === 'ship') {
        // HIT
        newBoard[row][col] = 'hit';
        addLog(`ОБНАРУЖЕНО ПОПАДАНИЕ ПО НАШЕМУ ФЛОТУ [${row},${col}]`, 'ai');

        // Visuals
        if (boardRef.current) {
          gsap.to(boardRef.current, {
            x: 10, duration: 0.05, repeat: 7, yoyo: true, onComplete: () => {
              gsap.set(boardRef.current, { x: 0 });
            }
          });
        }

        // Update hits count
        setAiHits(prev => {
          const newHits = prev + 1;
          if (newHits === totalShipCells) {
            setGameOver(true);
            setWinner('Компьютер');
            onGameOver?.(playerHits * 5, 'defeat');
            setIsAiThinking(false); // Game over, stop thinking
            return newHits;
          }

          // If not game over, AI gets another turn
          setTimeout(() => aiTurn(), 1000);
          return newHits;
        });

        // Update hunting state
        setAiHuntingState(prev => ({ status: 'hunting', hits: [...prev.hits, { r: row, c: col }] }));

        return newBoard;
      } else {
        // MISS
        newBoard[row][col] = 'miss';
        addLog(`ПРОТИВНИК ПРОМАХНУЛСЯ [${row},${col}]`, 'system');
        setIsAiThinking(false); // Hand turn back to player
        return newBoard;
      }
    });
  };

  const resetGame = () => {
    setPlayerBoard(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('empty')));
    setAiBoard(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('empty')));
    setSetupMode(true);
    setCurrentShipIndex(0);
    setPlayerHits(0);
    setAiHits(0);
    setGameOver(false);
    setIsAiThinking(false);
    setCombatLog([{ id: Date.now(), msg: 'СИСТЕМЫ ПЕРЕЗАГРУЖЕНЫ. ОЖИДАНИЕ РАЗВЕРТЫВАНИЯ.', type: 'system' }]);
    setAiHuntingState({ status: 'searching', hits: [] });
  };

  const getShipHealth = (positions: any[], board: CellState[][]) => {
    return positions.map(ship => {
      let hits = 0;
      for (let i = 0; i < ship.length; i++) {
        const r = ship.orientation === 'vertical' ? ship.row + i : ship.row;
        const c = ship.orientation === 'horizontal' ? ship.col + i : ship.col;
        if (board[r][c] === 'hit') hits++;
      }
      return { name: SHIPS.find(s => s.length === ship.length)?.name, health: ship.length - hits, total: ship.length };
    });
  };

  const playerShipsHealth = getShipHealth(playerShipsPositions, playerBoard);
  const aiShipsHealth = getShipHealth(aiShipsPositions, aiBoard);

  return (
    <GameWrapper title="МОРСКОЙ БОЙ" onBack={onBack}>
      <div className="flex flex-col items-center gap-6 max-w-7xl mx-auto px-4 pb-12">
        <AnimatePresence mode="wait">
          {setupMode && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full flex flex-col items-center gap-4 bg-black/40 border-2 border-[var(--primary)]/30 p-6 rounded-2xl backdrop-blur-md arcade-glow"
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-[var(--primary)]/60 font-mono tracking-widest uppercase">Фаза развертывания</span>
                <h3 className="text-xl font-bold text-[var(--primary)]" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                  УСТАНОВИТЕ: {SHIPS[currentShipIndex]?.name}
                </h3>
              </div>
              <div className="flex gap-4 items-center">
                <div className="flex gap-1">
                  {Array.from({ length: SHIPS[currentShipIndex]?.length || 0 }).map((_, i) => (
                    <div key={i} className="w-6 h-6 border-2 border-[var(--primary)] bg-[var(--primary)]/20" />
                  ))}
                </div>
                <button
                  onClick={() => setOrientation(orientation === 'horizontal' ? 'vertical' : 'horizontal')}
                  className="px-6 py-2 bg-[var(--primary)]/10 border-2 border-[var(--primary)] text-[var(--primary)] text-[10px] font-bold hover:bg-[var(--primary)]/20 transition-all rounded-lg arcade-glow"
                  style={{ fontFamily: "'Press Start 2P', cursive" }}
                >
                  ПОВОРОТ (R)
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!setupMode && (
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 bg-black/40 border-2 border-[var(--primary)]/30 p-4 rounded-xl backdrop-blur-sm arcade-glow">
            <div className="flex flex-col gap-1 pl-4">
              <span className="text-[10px] text-[var(--primary)]/60 font-mono">ТАКТИЧЕСКИЙ СТАТУС</span>
              <span className="text-xs font-bold animate-pulse text-[var(--primary)]" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                {isAiThinking ? 'ПРОТИВНИК АТАКУЕТ...' : 'ЖДЕМ УКАЗАНИЙ...'}
              </span>
            </div>

            <div className="hidden md:flex flex-col items-center justify-center border-x border-[var(--primary)]/10 px-4">
              <div className="text-[8px] text-[var(--primary)]/40 font-mono mb-1 uppercase">Состояние систем</div>
              <div className="flex gap-1">
                {playerShipsHealth.map((s, i) => (
                  <div key={i} className={`w-3 h-1.5 rounded-full ${s.health === 0 ? 'bg-red-500/20' : 'bg-[var(--primary)] arcade-glow shadow-[0_0_5px_var(--primary)]'}`} />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-12 pr-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-[var(--primary)]/60 font-mono">ПОРАЖЕНО ЦЕЛЕЙ</span>
                <span className="text-2xl font-bold text-[var(--primary)] tabular-nums">{playerHits}/{totalShipCells}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-red-500/60 font-mono">КРИТИЧЕСКИЙ УРОН</span>
                <span className="text-2xl font-bold text-red-500 tabular-nums">{aiHits}/{totalShipCells}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-8 flex-wrap justify-center items-start">
          <div className="flex flex-col gap-4">
            <div className="text-[10px] font-bold text-center tracking-widest text-[var(--primary)]/80 uppercase" style={{ fontFamily: "'Press Start 2P', cursive" }}>
              Монитор флота
            </div>
            <div className="player-board p-2 bg-[#030213] border-4 border-[var(--primary)]/50 rounded-lg shadow-[0_0_40px_rgba(0,255,0,0.1)]" ref={boardRef}>
              <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, auto)` }}>
                {playerBoard.map((row, y) =>
                  row.map((cell, x) => (
                    <button
                      key={`player-${x}-${y}`}
                      onClick={() => handleCellClick(y, x)}
                      className={`w-7 h-7 md:w-8 md:h-8 relative overflow-hidden transition-all duration-300
                        ${setupMode ? 'hover:bg-[var(--primary)]/20' : ''}
                        ${cell === 'ship' ? 'bg-[var(--primary)]/25' : cell === 'hit' ? 'bg-red-500/40' : 'bg-transparent'}
                      `}
                    >
                      <div className="absolute inset-0 border border-[var(--primary)]/5" />

                      {cell === 'hit' && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: [1, 1.2, 1], opacity: 1 }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="absolute inset-0 flex items-center justify-center z-10"
                        >
                          <div className="absolute inset-0 bg-red-600/20 blur-sm animate-pulse" />
                          <span className="text-xl font-bold text-red-500 drop-shadow-[0_0_10px_rgba(255,0,0,1)] z-20">✕</span>
                        </motion.div>
                      )}

                      {cell === 'miss' && (
                        <div className="absolute inset-0 flex items-center justify-center text-[var(--primary)]/30 text-xs">●</div>
                      )}

                      {/* Scanline effect for ships */}
                      {cell === 'ship' && (
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--primary)]/15 to-transparent animate-pulse" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {!setupMode && (
            <div className="flex flex-col gap-4">
              <div className="text-[10px] font-bold text-center tracking-widest text-red-500/80 uppercase" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                Радар противника
              </div>
              <div className="ai-board p-2 bg-[#030213] border-4 border-red-500/50 rounded-lg shadow-[0_0_40px_rgba(239,68,68,0.1)]">
                <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, auto)` }}>
                  {aiBoard.map((row, y) =>
                    row.map((cell, x) => (
                      <button
                        key={`ai-${x}-${y}`}
                        onClick={() => playerAttack(y, x)}
                        disabled={gameOver || isAiThinking}
                        className={`ai-cell-${y}-${x} w-7 h-7 md:w-8 md:h-8 relative overflow-hidden transition-all duration-300
                          ${!gameOver && !isAiThinking ? 'hover:bg-red-500/20 cursor-crosshair' : 'cursor-default'}
                          ${cell === 'hit' ? 'bg-red-500/30' : cell === 'miss' ? 'bg-blue-500/10' : 'bg-transparent'}
                        `}
                      >
                        <div className="absolute inset-0 border border-red-500/10" />

                        {cell === 'hit' && (
                          <motion.div
                            initial={{ scale: 2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute inset-0 flex items-center justify-center text-red-500 z-20"
                          >
                            <div className="absolute inset-0 bg-red-500/20 animate-ping rounded-full scale-50" />
                            <span className="text-xl font-bold drop-shadow-[0_0_8px_rgba(239,68,68,1)]">✕</span>
                          </motion.div>
                        )}

                        {/* Radar sweep flash effect for AI cells */}
                        <div className="absolute inset-0 bg-[var(--primary)]/5 opacity-0 hover:opacity-100 transition-opacity" />

                        {cell === 'miss' && (
                          <div className="absolute inset-0 flex items-center justify-center text-blue-400 opacity-40 text-xs">●</div>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {!setupMode && (
          <div className="w-full flex gap-4 h-32">
            <div className="flex-1 bg-black/60 border-2 border-[var(--primary)]/20 rounded-xl p-3 overflow-y-auto font-mono text-[10px]">
              <div className="text-[var(--primary)]/40 mb-2 border-b border-[var(--primary)]/10 pb-1">ЖУРНАЛ БОЕВЫХ ДЕЙСТВИЙ</div>
              {combatLog.map((log) => (
                <div key={log.id} className={`mb-1 ${log.type === 'player' ? 'text-[var(--primary)]' : log.type === 'ai' ? 'text-red-500' : 'text-white/40'}`}>
                  [{new Date(log.id).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}] {log.msg}
                </div>
              ))}
            </div>
            <div className="w-48 bg-black/60 border-2 border-[var(--primary)]/20 rounded-xl p-3 flex flex-col gap-2 relative overflow-hidden">
              <div className="text-[var(--primary)]/40 text-[10px] uppercase font-mono">Радар</div>
              <div className="flex-1 flex items-center justify-center relative">
                <div className="w-16 h-16 border border-[var(--primary)]/30 rounded-full relative">
                  <div className="absolute inset-0 border border-[var(--primary)]/10 rounded-full scale-75" />
                  <div className="absolute inset-0 border border-[var(--primary)]/10 rounded-full scale-50" />
                  <div ref={radarRef} className="absolute top-1/2 left-1/2 w-8 h-[1px] bg-gradient-to-r from-transparent to-[var(--primary)] origin-left -translate-y-1/2" />
                </div>
              </div>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-8 max-w-md w-full bg-black border-4 p-12 rounded-3xl arcade-glow-strong"
              style={{ borderColor: winner === 'Игрок' ? 'var(--primary)' : 'var(--accent)' }}
            >
              <div className="text-6xl mb-4">
                {winner === 'Игрок' ? '🏆' : '💀'}
              </div>
              <div className="text-xl text-center leading-relaxed" style={{ fontFamily: "'Press Start 2P', cursive", color: winner === 'Игрок' ? 'var(--primary)' : 'var(--accent)' }}>
                {winner === 'Игрок' ? 'ЦЕЛЬ УНИЧТОЖЕНА' : 'СИСТЕМНЫЙ СБОЙ'}
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] text-white/40 font-mono tracking-[0.3em] uppercase">Отчет о завершении</span>
                <span className="text-sm font-bold text-white uppercase">{winner} одержал победу</span>
              </div>
              <button
                onClick={resetGame}
                className="w-full mt-4 py-4 border-2 transition-all font-bold rounded-xl arcade-glow uppercase text-[10px] hover:bg-white/10"
                style={{
                  fontFamily: "'Press Start 2P', cursive",
                  borderColor: winner === 'Игрок' ? 'var(--primary)' : 'var(--accent)',
                  color: winner === 'Игрок' ? 'var(--primary)' : 'var(--accent)',
                }}
              >
                Восстановить системы
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </GameWrapper>
  );
}
