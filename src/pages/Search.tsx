import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, Book, FileText, Bot, ArrowRight } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAppStore } from '../store/useAppStore';
import { dataService } from '../services/dataService';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  type: 'quiz' | 'note' | 'mentor';
  title: string;
  excerpt: string;
  tags: string[];
}

export function SearchPage() {
  const { user } = useAppStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.length < 2) {
      setResults([]);
      return;
    }
    
    if (!user) return;
    
    setIsSearching(true);
    try {
      const filtered = await dataService.globalSearch(user.uid, val);
      setResults(filtered as SearchResult[]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const navigateToResult = (result: SearchResult) => {
    if (result.type === 'quiz') navigate(`/quiz/${result.id}`);
    if (result.type === 'note') navigate('/notes');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-12 min-h-[calc(100vh-64px)]">
      <header className="text-center space-y-4 pt-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
          <Search className="w-3 h-3" />
          Neural Vector Search
        </div>
        <h1 className="text-5xl font-black italic uppercase tracking-tighter">Query Everything</h1>
        <p className="text-muted-foreground font-medium serif italic text-lg">Cross-reference your entire knowledge ecosystem instantly.</p>
      </header>

      <div className="relative group">
         <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-blue-500/50 rounded-[2.5rem] opacity-20 blur-md group-focus-within:opacity-40 transition-opacity" />
         <div className="relative flex items-center bg-background border-4 rounded-[2.5rem] p-3 shadow-2xl">
            <Search className="w-8 h-8 ml-4 text-muted-foreground" />
            <Input 
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search concepts, notes, or quiz questions..." 
              className="border-0 focus-visible:ring-0 text-2xl font-bold italic tracking-tight h-16 bg-transparent"
            />
            {isSearching && <Loader2 className="w-6 h-6 mr-6 text-primary animate-spin" />}
         </div>
      </div>

      <div className="space-y-6 pb-24">
        <AnimatePresence>
          {results.map((result, idx) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => navigateToResult(result)}
            >
              <Card className="rounded-[2.5rem] border-2 hover:border-primary transition-all group overflow-hidden cursor-pointer">
                <CardContent className="p-8 flex items-center gap-8">
                   <div className="w-16 h-16 rounded-2xl bg-muted border-2 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 group-hover:border-primary transition-colors">
                     {result.type === 'quiz' && <Book className="w-8 h-8 text-muted-foreground group-hover:text-primary" />}
                     {result.type === 'note' && <FileText className="w-8 h-8 text-muted-foreground group-hover:text-primary" />}
                     {result.type === 'mentor' && <Bot className="w-8 h-8 text-muted-foreground group-hover:text-primary" />}
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{result.type} Record</span>
                        <div className="flex gap-2">
                           {result.tags.map(tag => (
                             <Badge key={tag} variant="secondary" className="text-[8px] font-bold uppercase tracking-tighter h-4">#{tag}</Badge>
                           ))}
                        </div>
                      </div>
                      <h3 className="text-2xl font-black italic uppercase tracking-tight truncate group-hover:text-primary transition-colors">{result.title}</h3>
                      <p className="text-muted-foreground serif italic text-sm line-clamp-1">{result.excerpt}</p>
                   </div>
                   <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <ArrowRight className="w-6 h-6 text-primary" />
                   </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {query && results.length === 0 && !isSearching && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">No vector matches found in the current buffer</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
