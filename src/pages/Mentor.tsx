import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { GoogleGenAI } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, User, Brain, Bot, CornerDownLeft, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../components/ui/dropdown-menu';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
}

type Provider = 'gemini' | 'groq';

export function Mentor() {
  const { user } = useAppStore();
  const [provider, setProvider] = useState<Provider>('gemini');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      const q = query(
        collection(db, 'users', user!.uid, 'chats'),
        orderBy('createdAt', 'asc'),
        limit(50)
      );
      const snap = await getDocs(q);
      const history = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      if (history.length === 0) {
        setMessages([{ 
          id: '1', 
          role: 'model', 
          content: `Hello ${user?.name}! I am Zenith, your personalized academic mentor. How can I help you excel in your studies today?` 
        }]);
      } else {
        setMessages(history);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveMessage = async (msg: Omit<Message, 'id'>) => {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'chats'), {
      ...msg,
      createdAt: serverTimestamp()
    });
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const callGroq = async (prompt: string) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY is missing');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { 
            role: 'system', 
            content: `You are Zenith, a world-class academic mentor. 
            Encouraging, concise, approachable.
            Student Name: ${user?.name}.` 
          },
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) throw new Error('Groq API error');
    const data = await response.json();
    return data.choices[0].message.content;
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Omit<Message, 'id'> = { role: 'user', content: input };
    setMessages(prev => [...prev, { ...userMessage, id: Date.now().toString() } as Message]);
    setInput('');
    setIsTyping(true);
    
    // Save user message
    saveMessage(userMessage);

    try {
      let aiResponseText = '';

      if (provider === 'gemini') {
        const chat = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: {
            systemInstruction: `You are Zenith, a world-class academic mentor. 
            Encouraging, concise, approachable.
            Student Name: ${user?.name}.`,
          },
          history: messages.map(m => ({
            role: m.role,
            parts: [{ text: m.content }]
          }))
        });
        const response = await chat.sendMessage({ message: input });
        aiResponseText = response.text || '';
      } else {
        aiResponseText = await callGroq(input);
      }

      const aiMessage: Omit<Message, 'id'> = { 
        role: 'model', 
        content: aiResponseText || "I'm sorry, I couldn't process that. Let's try another topic."
      };
      setMessages(prev => [...prev, { ...aiMessage, id: (Date.now() + 1).toString() } as Message]);
      saveMessage(aiMessage);
    } catch (error) {
      console.error('AI error:', error);
      setMessages(prev => [...prev, { 
        id: 'error', 
        role: 'model', 
        content: "I encountered a minor cognitive glitch. Please ensure your API keys are configured correctly." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Bot className="text-primary-foreground w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight uppercase">Zenith AI Mentor</h1>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest px-1">Active Model:</span>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] font-black uppercase tracking-tighter bg-muted/50 rounded-md">
                    {provider === 'gemini' ? 'Gemini 3 Flash' : 'Groq Llama 3.3'}
                    <Zap className="w-3 h-3 ml-1 fill-current" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="rounded-xl border-2">
                   <DropdownMenuItem onClick={() => setProvider('gemini')} className="font-bold text-xs uppercase tracking-widest">Gemini 3 Flash</DropdownMenuItem>
                   <DropdownMenuItem onClick={() => setProvider('groq')} className="font-bold text-xs uppercase tracking-widest">Groq Llama 3.3</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full animate-pulse", provider === 'gemini' ? "bg-emerald-500" : "bg-orange-500")} />
          <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">{provider === 'gemini' ? 'Google' : 'Groq'} Vector Active</span>
        </div>
      </div>

      <ScrollArea className="flex-1 pr-4 mb-4 border-2 rounded-3xl bg-muted/20 p-6">
        <div className="space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={cn(
                  "flex items-start gap-3 max-w-[85%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-sm",
                  msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-background border"
                )}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Brain className="w-4 h-4 text-primary" />}
                </div>
                <div className={cn(
                  "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                  msg.role === 'user' 
                    ? "bg-primary text-primary-foreground rounded-tr-none font-medium shadow-md shadow-primary/10" 
                    : "bg-background border rounded-tl-none shadow-sm"
                )}>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-muted-foreground ml-1"
              >
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">{provider === 'groq' ? 'Synthesizing' : 'Processing'}</span>
              </motion.div>
            )}
            <div ref={scrollRef} />
          </AnimatePresence>
        </div>
      </ScrollArea>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-500 rounded-[2rem] opacity-20 blur-sm group-focus-within:opacity-40 transition-opacity" />
        <div className="relative flex items-center gap-2 bg-background border-2 rounded-[2rem] p-2 pl-6 pr-2 shadow-xl">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Instruct ${provider === 'groq' ? 'Groq' : 'Zenith'}...`}
            className="border-0 focus-visible:ring-0 text-base h-12 bg-transparent p-0"
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || isTyping}
            size="icon" 
            className="rounded-full w-12 h-12 flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

