import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAppStore } from '../store/useAppStore';
import { dataService } from '../services/dataService';
import { Question, Quiz } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Clock, 
  Flame, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

const mockQuestions: Question[] = [
  {
    id: '1',
    quizId: '1',
    text: 'Which data structure follows the Last-In, First-Out (LIFO) principle?',
    type: 'multiple-choice',
    options: ['Queue', 'Stack', 'Linked List', 'Tree'],
    correctAnswer: 'Stack',
    explanation: 'A Stack is a linear data structure that follows the LIFO principle, where the last element added is the first one to be removed.'
  },
  {
    id: '2',
    quizId: '1',
    text: 'What is the time complexity of searching for an element in a balanced Binary Search Tree (BST)?',
    type: 'multiple-choice',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
    correctAnswer: 'O(log n)',
    explanation: 'In a balanced BST, the height is logarithmic to the number of nodes, making search O(log n).'
  }
];

export function QuizRoom() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAppStore();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    async function fetchQuizData() {
      try {
        const quizDoc = await getDoc(doc(db, 'quizzes', id!));
        if (quizDoc.exists()) {
          setQuiz({ id: quizDoc.id, ...quizDoc.data() } as Quiz);
          const qSnap = await getDocs(query(collection(db, 'quizzes', id!, 'questions')));
          const qList = qSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
          setQuestions(qList.length > 0 ? qList : mockQuestions);
        } else {
          // Fallback for demo
          setQuiz({ id: '1', title: 'Demo Quiz', category: 'General' } as Quiz);
          setQuestions(mockQuestions);
        }
      } catch (err) {
        console.error(err);
        setQuestions(mockQuestions);
      } finally {
        setLoading(false);
      }
    }
    fetchQuizData();
  }, [id]);

  useEffect(() => {
    let timer: any;
    if (gameStarted && !isAnswered && !gameOver && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && !isAnswered) {
      handleTimeOut();
    }
    return () => clearInterval(timer);
  }, [gameStarted, isAnswered, gameOver, timeLeft]);

  const handleTimeOut = useCallback(() => {
    setLives(prev => prev - 1);
    setIsAnswered(true);
    setStreak(0);
    toast.error("Time's up!");
    if (lives <= 1) setGameOver(true);
  }, [lives]);

  const handleAnswer = (answer: string) => {
    if (isAnswered || gameOver) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    const isCorrect = answer === questions[currentIdx].correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 100 + (streak * 10));
      setStreak(prev => prev + 1);
      toast.success("Brilliant!");
    } else {
      setLives(prev => prev - 1);
      setStreak(0);
      toast.error("Incorrect.");
      if (lives <= 1) setGameOver(true);
    }
  };

  const nextQuestion = async () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setTimeLeft(30);
    } else {
      setGameOver(true);
      if (user) {
        await dataService.saveQuizResult({
          quizId: id!,
          userId: user.uid,
          score,
          totalQuestions: questions.length,
          timeSpent: 0, // Could track actual time
        });
      }
    }
  };

  useEffect(() => {
    if (gameOver && lives <= 0 && user) {
       // Save result even if failed? 
       // Usually we save if completion, or partial.
       dataService.saveQuizResult({
          quizId: id!,
          userId: user.uid,
          score,
          totalQuestions: questions.length,
          timeSpent: 0,
        });
    }
  }, [gameOver, lives, user, id, score, questions.length]);

  if (loading) return null;

  if (!gameStarted && !gameOver) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-8"
        >
          <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-12 h-12 text-primary" />
          </div>
          <div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-2">{quiz?.title}</h1>
            <p className="text-muted-foreground uppercase text-xs font-bold tracking-widest">3 Hearts • 30s per active cycle • Multiplier active</p>
          </div>
          <Button size="lg" className="h-16 px-12 rounded-2xl text-xl font-black uppercase tracking-widest shadow-xl" onClick={() => setGameStarted(true)}>
            Initialize Sequence
          </Button>
        </motion.div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] p-6">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-md w-full text-center space-y-8 p-8 border-4 rounded-[2rem] bg-background"
        >
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">Session Terminated</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-muted border-2">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Final Score</p>
              <p className="text-3xl font-black tabular-nums">{score}</p>
            </div>
            <div className="p-4 rounded-2xl bg-muted border-2">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Highest Streak</p>
              <p className="text-3xl font-black tabular-nums">{streak}</p>
            </div>
          </div>
          <div className="space-y-3">
            <Button className="w-full h-14 rounded-2xl font-black text-lg uppercase" onClick={() => window.location.reload()}>
              <RotateCcw className="w-5 h-5 mr-2" />
              Retake Sequence
            </Button>
            <Button variant="outline" className="w-full h-14 rounded-2xl font-bold border-2" onClick={() => navigate('/quizzes')}>
              Return to Engine
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="min-h-[calc(100vh-64px)] p-6 max-w-4xl mx-auto flex flex-col">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center -space-x-1">
            {[...Array(3)].map((_, i) => (
              <Heart 
                key={i} 
                className={cn(
                  "w-7 h-7 transition-all", 
                  i < lives ? "text-rose-500 fill-current" : "text-muted-foreground/30"
                )} 
              />
            ))}
          </div>
          <div className="h-10 w-px bg-border mx-2" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Time Remaining</span>
            <div className="flex items-center gap-2">
              <Clock className={cn("w-4 h-4", timeLeft < 10 ? "text-rose-500 animate-pulse" : "text-primary")} />
              <span className={cn("font-black tabular-nums", timeLeft < 10 && "text-rose-500")}>{timeLeft}s</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Multiplier</span>
            <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full text-primary border border-primary/20">
              <Flame className="w-4 h-4 fill-current" />
              <span className="font-black">x{(1 + streak * 0.1).toFixed(1)}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Score</span>
                <span className="text-2xl font-black tabular-nums tracking-tighter">{score}</span>
          </div>
        </div>
      </div>

      <Progress value={progress} className="h-2 mb-12 rounded-full border-2" />

      {/* Question Zone */}
      <div className="flex-1 space-y-10">
        <motion.div
           key={currentIdx}
           initial={{ x: 50, opacity: 0 }}
           animate={{ x: 0, opacity: 1 }}
           className="space-y-2"
        >
          <Badge className="bg-muted text-primary border-primary/20 px-3 py-1">Question {currentIdx + 1} of {questions.length}</Badge>
          <h2 className="text-3xl font-bold tracking-tight leading-tight">{currentQuestion.text}</h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-4">
          {currentQuestion.options.map((option) => {
            const isCorrect = option === currentQuestion.correctAnswer;
            const isSelected = option === selectedAnswer;
            
            return (
              <Button
                key={option}
                variant="outline"
                disabled={isAnswered}
                onClick={() => handleAnswer(option)}
                className={cn(
                  "h-auto py-5 px-6 justify-start text-left text-lg rounded-2xl border-2 transition-all relative overflow-hidden",
                  isAnswered && isCorrect && "border-emerald-500 bg-emerald-500/5 text-emerald-700",
                  isAnswered && isSelected && !isCorrect && "border-rose-500 bg-rose-500/5 text-rose-700",
                  !isAnswered && "hover:border-primary hover:bg-primary/5 active:scale-[0.98]"
                )}
              >
                <div className="flex items-center gap-4 w-full">
                  <span className="w-8 h-8 rounded-lg border-2 flex items-center justify-center font-bold text-sm bg-muted/30">
                    {String.fromCharCode(65 + currentQuestion.options.indexOf(option))}
                  </span>
                  <span className="flex-1">{option}</span>
                  {isAnswered && isCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-rose-500" />}
                </div>
              </Button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {isAnswered && !gameOver && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="mt-8 p-6 rounded-3xl border-2 bg-muted/30 backdrop-blur-sm flex items-center justify-between"
          >
            <div className="flex-1 mr-4">
              <h4 className="text-sm font-bold uppercase tracking-widest mb-1">Knowledge Pulse</h4>
              <p className="text-sm text-muted-foreground italic serif line-clamp-2">{currentQuestion.explanation}</p>
            </div>
            <Button size="lg" className="rounded-2xl h-14 px-8 font-black uppercase text-xs tracking-widest" onClick={nextQuestion}>
              Next Vector
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
