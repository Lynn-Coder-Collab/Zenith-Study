import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAppStore } from '../store/useAppStore';
import { Note } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  StickyNote, 
  MoreVertical, 
  Trash2, 
  Edit3,
  Calendar,
  Save,
  ChevronLeft
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

export function Notes() {
  const { user } = useAppStore();
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [search, setSearch] = useState('');
  const [isNew, setIsNew] = useState(false);
  
  // New note form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  async function fetchNotes() {
    const q = query(
      collection(db, 'users', user!.uid, 'notes'),
      orderBy('updatedAt', 'desc')
    );
    const snap = await getDocs(q);
    setNotes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note)));
  }

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) return;
    try {
      await addDoc(collection(db, 'users', user!.uid, 'notes'), {
        userId: user!.uid,
        title,
        content,
        updatedAt: new Date().toISOString()
      });
      setTitle('');
      setContent('');
      setIsNew(false);
      fetchNotes();
      toast.success("Note digitized.");
    } catch (err) {
      toast.error("Memory corruption. Try again.");
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  if (isNew || editingNote) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-8 h-[calc(100vh-64px)] flex flex-col">
        <header className="flex items-center gap-6">
          <Button variant="outline" size="icon" className="rounded-2xl border-2" onClick={() => { setIsNew(false); setEditingNote(null); }}>
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">Drafting Protocol</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Constructing knowledge buffers</p>
          </div>
        </header>

        <Card className="flex-1 rounded-[3rem] border-4 overflow-hidden flex flex-col shadow-2xl">
          <CardHeader className="border-b-4 bg-muted/20">
            <Input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title of Sequence" 
              className="border-0 bg-transparent text-2xl font-black italic uppercase tracking-tight focus-visible:ring-0 px-0"
            />
          </CardHeader>
          <CardContent className="flex-1 p-0 flex flex-col">
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Begin knowledge encoding..."
              className="flex-1 w-full p-8 bg-transparent text-lg font-medium leading-relaxed resize-none focus:outline-none placeholder:text-muted-foreground/30 serif italic"
            />
            <div className="p-8 border-t-2 bg-muted/10 flex justify-end">
               <Button size="lg" className="h-14 px-12 rounded-2xl font-black uppercase text-xs tracking-widest gap-2" onClick={handleCreate}>
                 <Save className="w-5 h-5" />
                 Finalize Entry
               </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Memory Bank</h1>
          <p className="text-muted-foreground font-medium uppercase tracking-[0.25em] text-[10px]">Static knowledge repositories</p>
        </div>
        <Button className="h-14 px-8 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl" onClick={() => setIsNew(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Append Entry
        </Button>
      </header>

      <div className="relative group">
         <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
           <Search className="w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
         </div>
         <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Query your knowledge buffers..." 
            className="h-16 pl-16 rounded-[2rem] border-2 focus-visible:ring-primary shadow-sm text-lg"
         />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {filteredNotes.map((note, idx) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-[320px]"
            >
              <Card className="h-full rounded-[2.5rem] border-2 hover:border-primary transition-all overflow-hidden relative group flex flex-col">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-rose-500/10 hover:text-rose-600">
                     <Trash2 className="w-4 h-4" />
                   </Button>
                </div>
                <CardHeader className="pb-4">
                  <Badge variant="outline" className="w-fit text-[8px] font-black uppercase tracking-widest border-2 mb-2">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </Badge>
                  <CardTitle className="text-2xl font-black italic uppercase tracking-tight line-clamp-2">
                    {note.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                   <p className="text-sm text-muted-foreground serif italic leading-relaxed line-clamp-5">
                     {note.content}
                   </p>
                </CardContent>
                <div className="p-6 pt-0 mt-auto">
                    <Button variant="outline" className="w-full h-10 rounded-xl font-bold border-2">
                      View full entry
                    </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
