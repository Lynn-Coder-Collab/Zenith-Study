import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Quiz } from '../types';
import { motion } from 'motion/react';
import { Search, Filter, Play, Clock, BarChart, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Link } from 'react-router-dom';

export function Quizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const q = query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedQuizzes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz));
        setQuizzes(fetchedQuizzes);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchQuizzes();
  }, []);

  const filteredQuizzes = quizzes.filter(q => 
    q.title.toLowerCase().includes(search.toLowerCase()) ||
    q.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase">Knowledge Engine</h1>
          <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[10px]">
            Master subjects through active recall
          </p>
        </div>
        <Button className="rounded-2xl font-bold h-12 px-6">
          <Plus className="w-5 h-5 mr-2" />
          Create Module
        </Button>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by subject or topic..." 
            className="pl-12 h-14 rounded-2xl border-2 focus-visible:ring-primary shadow-sm"
          />
        </div>
        <Button variant="outline" className="h-14 w-14 rounded-2xl flex-shrink-0 border-2">
          <Filter className="h-6 w-6" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[280px] rounded-3xl" />
          ))
        ) : (
          filteredQuizzes.map((quiz) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full rounded-[2rem] overflow-hidden border-2 hover:border-primary transition-all group flex flex-col">
                <CardHeader className="bg-muted/30 pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="bg-background font-black uppercase text-[10px] tracking-widest px-2 py-0.5 border-2">
                      {quiz.category}
                    </Badge>
                    <DifficultyBadge difficulty={quiz.difficulty} />
                  </div>
                  <CardTitle className="text-2xl font-black leading-tight tracking-tight group-hover:text-primary transition-colors">
                    {quiz.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-6 italic serif">
                    {quiz.description}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      <Clock className="w-4 h-4" />
                      ~ {quiz.questionCount * 1} min
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      <BarChart className="w-4 h-4" />
                      {quiz.questionCount} Questions
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Link to={`/quiz/${quiz.id}`} className="w-full">
                    <Button className="w-full h-12 rounded-2xl font-black uppercase text-xs tracking-[0.2em] group">
                      Initialize Session
                      <Play className="w-4 h-4 ml-2 fill-current group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colors = {
    easy: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
    medium: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
    hard: 'text-rose-600 bg-rose-500/10 border-rose-500/20'
  };
  return (
    <span className={cn(
      "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border-2",
      colors[difficulty as keyof typeof colors]
    )}>
      {difficulty}
    </span>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
