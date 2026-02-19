import { useState } from 'react';
import { GameWrapper } from '@/app/components/GameWrapper';

interface Question {
  question: string;
  options: string[];
  correct: number;
}

const questions: Question[] = [
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

export function QuizGame({ onBack }: { onBack: () => void }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(index);
    setShowResult(true);

    if (index === questions[currentQuestion].correct) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setGameFinished(true);
      }
    }, 1500);
  };

  const resetGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameFinished(false);
  };

  if (gameFinished) {
    return (
      <GameWrapper title="ВИКТОРИНА" onBack={onBack}>
        <div className="flex flex-col items-center gap-8">
          <div className="text-2xl" style={{ fontFamily: "'Press Start 2P', cursive" }}>
            ИГРА ОКОНЧЕНА
          </div>
          <div className="text-3xl" style={{ fontFamily: "'Press Start 2P', cursive" }}>
            СЧЁТ: {score}/{questions.length}
          </div>
          <div className="text-lg" style={{ fontFamily: "'Press Start 2P', cursive" }}>
            {score === questions.length ? 'ИДЕАЛЬНО!' : score >= 7 ? 'ОТЛИЧНО!' : score >= 5 ? 'ХОРОШО!' : 'ПОПРОБУЙ ЕЩЁ!'}
          </div>
          <button
            onClick={resetGame}
            className="px-8 py-3 border-2 border-[#00ff00] hover:bg-[#00ff00] hover:text-black transition-all"
            style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '12px', boxShadow: '0 0 10px #00ff00' }}
          >
            ЗАНОВО
          </button>
        </div>
      </GameWrapper>
    );
  }

  return (
    <GameWrapper title="ВИКТОРИНА" onBack={onBack}>
      <div className="flex flex-col items-center gap-6 max-w-3xl w-full px-4">
        <div className="flex justify-between w-full text-lg" style={{ fontFamily: "'Press Start 2P', cursive" }}>
          <div>ВОПРОС {currentQuestion + 1}/{questions.length}</div>
          <div>СЧЁТ: {score}</div>
        </div>

        <div 
          className="text-center text-lg p-6 border-4 border-[#00ff00] w-full"
          style={{ 
            fontFamily: "'Press Start 2P', cursive",
            lineHeight: '1.8',
            boxShadow: '0 0 20px #00ff00'
          }}
        >
          {questions[currentQuestion].question}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={selectedAnswer !== null}
              className="p-4 border-4 border-[#00ff00] hover:bg-[#00ff00] hover:text-black transition-all text-left"
              style={{
                fontFamily: "'Press Start 2P', cursive",
                fontSize: '12px',
                lineHeight: '1.6',
                boxShadow: '0 0 10px #00ff00',
                backgroundColor: showResult
                  ? index === questions[currentQuestion].correct
                    ? 'rgba(0, 255, 0, 0.3)'
                    : index === selectedAnswer
                    ? 'rgba(255, 0, 0, 0.3)'
                    : 'transparent'
                  : 'transparent'
              }}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </GameWrapper>
  );
}
