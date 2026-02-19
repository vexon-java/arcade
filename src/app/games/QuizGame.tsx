import { useState, useEffect, useMemo } from 'react';
import { GameWrapper } from '@/app/components/GameWrapper';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Trophy, RotateCcw, ArrowRight, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

interface Question {
  question: string;
  options: string[];
  correct: number;
}

const rawQuestions: Question[] = [
  {
    question: 'Какой язык программирования используется для веб-разработки?',
    options: ['Python', 'JavaScript', 'C++', 'Java'],
    correct: 1
  },
  {
    question: 'Что означает HTML?',
    options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language'],
    correct: 0
  },
  {
    question: 'Какой год считается годом создания первого компьютера?',
    options: ['1936', '1946', '1956', '1966'],
    correct: 1
  },
  {
    question: 'Что такое CSS?',
    options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style System', 'Colorful Style Sheets'],
    correct: 1
  },
  {
    question: 'Кто создал Linux?',
    options: ['Билл Гейтс', 'Стив Джобс', 'Линус Торвальдс', 'Марк Цукерберг'],
    correct: 2
  },
  {
    question: 'Сколько битов в одном байте?',
    options: ['4', '8', '16', '32'],
    correct: 1
  },
  {
    question: 'Что означает API?',
    options: ['Application Programming Interface', 'Advanced Programming Integration', 'Automated Program Interaction', 'Application Process Integration'],
    correct: 0
  },
  {
    question: 'Какой протокол используется для передачи веб-страниц?',
    options: ['FTP', 'SMTP', 'HTTP', 'SSH'],
    correct: 2
  },
  {
    question: 'Что такое GitHub?',
    options: ['Социальная сеть', 'Платформа для хостинга кода', 'Поисковик', 'Браузер'],
    correct: 1
  },
  {
    question: 'Какой язык используется для создания игр Unity?',
    options: ['Python', 'JavaScript', 'C#', 'Ruby'],
    correct: 2
  }
];

export function QuizGame({ onBack, theme = 'cyan' }: { onBack: () => void; theme?: 'cyan' | 'red' | 'green' }) {
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [gameFinished, setGameFinished] = useState(false);
  const [direction, setDirection] = useState(1); // 1 for next, -1 for reset

  // Shuffle questions on mount and reset
  const initializeQuestions = () => {
    const shuffled = [...rawQuestions].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);
  };

  useEffect(() => {
    initializeQuestions();
  }, []);

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(index);

    if (index === shuffledQuestions[currentQuestion].correct) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      if (currentQuestion < shuffledQuestions.length - 1) {
        setDirection(1);
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
      } else {
        setGameFinished(true);
      }
    }, 1200);
  };

  const resetGame = () => {
    setDirection(-1);
    initializeQuestions();
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setGameFinished(false);
  };

  if (shuffledQuestions.length === 0) return null;

  const currentQ = shuffledQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / shuffledQuestions.length) * 100;

  if (gameFinished) {
    return (
      <GameWrapper title="NEON_QUIZ" onBack={onBack}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-8 bg-black/40 backdrop-blur-xl p-12 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
        >
          <div className="relative">
            <Trophy className="w-24 h-24 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 border-2 border-dashed border-yellow-400/20 rounded-full"
            />
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-white uppercase tracking-widest" style={{ fontFamily: "'Press Start 2P', cursive" }}>
              Neural_Link_Complete
            </h2>
            <p className="text-[var(--primary)] font-mono text-sm uppercase tracking-tighter opacity-70">Extraction Accuracy: {Math.round((score / shuffledQuestions.length) * 100)}%</p>
          </div>

          <div className="text-6xl font-black text-white" style={{ fontFamily: "'Press Start 2P', cursive" }}>
            {score}<span className="text-2xl text-white/30">/{shuffledQuestions.length}</span>
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={resetGame}
              className="flex items-center gap-3 px-8 py-4 bg-[var(--primary)]/10 border-2 border-[var(--primary)]/50 text-[var(--primary)] rounded-xl hover:bg-[var(--primary)]/20 transition-all font-mono uppercase tracking-widest text-xs"
            >
              <RotateCcw className="w-4 h-4" /> Reset_Session
            </button>
            <button
              onClick={onBack}
              className="flex items-center gap-3 px-8 py-4 bg-white/5 border-2 border-white/10 text-white/60 rounded-xl hover:bg-white/10 transition-all font-mono uppercase tracking-widest text-xs"
            >
              Log_Out
            </button>
          </div>
        </motion.div>
      </GameWrapper>
    );
  }

  return (
    <GameWrapper title="NEON_QUIZ" onBack={onBack}>
      <div className="flex flex-col items-center gap-8 max-w-4xl w-full px-4 relative">
        {/* HUD INFO */}
        <div className="flex justify-between w-full items-end pb-2 border-b border-white/5">
          <div className="space-y-1">
            <div className="text-[10px] text-[var(--primary)] font-mono tracking-widest uppercase opacity-50">Question_Sequence</div>
            <div className="text-xl font-black text-white font-mono">{currentQuestion + 1}<span className="text-white/20">.0</span></div>
          </div>
          <div className="text-right space-y-1">
            <div className="text-[10px] text-[var(--primary)] font-mono tracking-widest uppercase opacity-50">Extraction_Score</div>
            <div className="text-xl font-black text-white font-mono">{score.toString().padStart(2, '0')}</div>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-[var(--primary)] shadow-[0_0_10px_var(--primary)]"
          />
        </div>

        {/* QUESTION CARD */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQuestion}
            custom={direction}
            initial={{ opacity: 0, x: direction * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12 shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex flex-col items-center gap-8"
          >
            <div className="p-4 bg-[var(--primary)]/10 rounded-2xl border border-[var(--primary)]/20">
              <Brain className="w-12 h-12 text-[var(--primary)]" />
            </div>

            <h3 className="text-center text-lg md:text-xl font-bold leading-relaxed text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
              {currentQ.question}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {currentQ.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQ.correct;
                const showCorrect = selectedAnswer !== null && isCorrect;
                const showWrong = isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={selectedAnswer !== null}
                    className={`group relative p-5 rounded-xl border-2 text-left transition-all duration-300 flex items-center justify-between
                      ${selectedAnswer === null
                        ? 'border-white/10 bg-white/5 hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/5'
                        : isCorrect
                          ? 'border-green-500 bg-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                          : isSelected
                            ? 'border-red-500 bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                            : 'border-white/5 bg-white/5 opacity-40'}
                    `}
                  >
                    <span className={`font-mono text-sm tracking-tight ${isCorrect && selectedAnswer !== null ? 'text-green-400' : isSelected ? 'text-red-400' : 'text-white'}`}>
                      {option}
                    </span>

                    <div className="flex items-center gap-2">
                      {showCorrect && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                      {showWrong && <XCircle className="w-5 h-5 text-red-400" />}
                      {!selectedAnswer && <Sparkles className="w-4 h-4 text-white/0 group-hover:text-[var(--primary)]/50 transition-colors" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* DECORATIVE BACKGROUND ELEMENTS */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[var(--primary)]/5 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/5 blur-[100px] pointer-events-none rounded-full" />
      </div>
    </GameWrapper>
  );
}
