import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppStore } from '../store/useAppStore';
import { dataService } from '../services/dataService';
import { StudyRoom } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Send, 
  MessageSquare, 
  Video, 
  Mic, 
  Settings,
  Plus,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export function StudyRooms() {
  const { user } = useAppStore();
  const [rooms, setRooms] = useState<StudyRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<StudyRoom | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchRooms() {
      try {
        const activeRooms = await dataService.getActiveRooms();
        setRooms(activeRooms);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, []);

  useEffect(() => {
    const newSocket = io(window.location.origin);
    setSocket(newSocket);

    newSocket.on('receive-message', (data: any) => {
      setMessages(prev => [...prev, data]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const joinRoom = (room: StudyRoom) => {
    if (socket) {
      socket.emit('join-room', room.id);
      setActiveRoom(room);
      setMessages([]);
    }
  };

  const handleCreateRoom = async () => {
    if (!user) return;
    const name = prompt("Enter room name:");
    if (!name) return;

    try {
      const roomId = await dataService.createRoom(user.uid, name);
      const newRoom = { id: roomId, name, creatorId: user.uid, participants: [user.uid], isActive: true, createdAt: new Date().toISOString() };
      setRooms(prev => [newRoom, ...prev]);
      joinRoom(newRoom);
      toast.success("Room initialized.");
    } catch (err) {
      toast.error("Failed to create room.");
    }
  };

  const handleSend = () => {
    if (socket && input.trim() && activeRoom) {
      socket.emit('send-message', {
        roomId: activeRoom.id,
        message: input,
        user: { name: user?.name, id: user?.uid }
      });
      setInput('');
    }
  };

  if (loading) return null;

  if (!activeRoom) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase">Collective Intelligence</h1>
            <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[10px]">Real-time collaborative environments</p>
          </div>
          <Button className="rounded-2xl h-12 shadow-lg shadow-primary/20" onClick={handleCreateRoom}>
            <Plus className="w-5 h-5 mr-2" />
            Initialize Room
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Card key={room.id} className="rounded-3xl border-2 hover:border-primary transition-all group">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-2">Study Group</Badge>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                    <Users className="w-3 h-3" />
                    {room.participants.length}
                  </div>
                </div>
                <CardTitle className="text-xl font-bold tracking-tight leading-tight group-hover:text-primary transition-colors">{room.name}</CardTitle>
                <CardDescription className="italic serif">Synchronous session in progress</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full h-12 rounded-2xl font-black uppercase text-xs tracking-[0.2em]" onClick={() => joinRoom(room)}>
                  Join Sector
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
          {rooms.length === 0 && (
             <div className="col-span-full py-20 text-center opacity-50">
                <p className="text-sm font-black uppercase tracking-widest">No active sectors found. Initialize a new one.</p>
             </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] p-6 gap-6 max-w-7xl mx-auto overflow-hidden">
      {/* Sidebar for Room Meta */}
      <div className="w-64 flex flex-col gap-6 hidden md:flex">
        <Button variant="outline" onClick={() => setActiveRoom(null)} className="rounded-2xl border-2 h-12 justify-start font-bold">
          Exit Room
        </Button>
        <Card className="rounded-3xl border-2">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Participants</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
             <UserItem name={user?.name || 'Me'} active isSelf />
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 flex flex-col border-2 rounded-[2.5rem] bg-muted/20 overflow-hidden relative">
        <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />
        
        <div className="h-16 border-b flex items-center justify-between px-8 bg-background/50 backdrop-blur-sm z-10">
          <h2 className="font-black italic uppercase tracking-tighter text-lg">{activeRoom.name}</h2>
          <Settings className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer" />
        </div>

        <ScrollArea className="flex-1 p-8">
          <div className="space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={cn(
                "flex flex-col gap-1.5",
                msg.user.id === user?.uid ? "items-end" : "items-start"
              )}>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">{msg.user.name}</span>
                <div className={cn(
                  "px-4 py-2 rounded-2xl text-sm max-w-[80%] shadow-sm",
                  msg.user.id === user?.uid 
                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                    : "bg-background border rounded-tl-none"
                )}>
                  {msg.message}
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="p-6 bg-background/50 backdrop-blur-sm border-t z-10">
           <div className="flex gap-2 bg-background border-2 rounded-[2rem] p-2 pr-2 overflow-hidden shadow-lg">
             <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Synchronize with your peers..." 
                className="border-0 focus-visible:ring-0 text-sm h-10 bg-transparent"
             />
             <Button size="icon" className="rounded-full w-10 h-10 flex-shrink-0" onClick={handleSend}>
                <Send className="w-4 h-4" />
             </Button>
           </div>
        </div>
      </div>
    </div>
  );
}

function UserItem({ name, active, isSelf }: { name: string, active?: boolean, isSelf?: boolean }) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
        <span className={cn("text-sm font-medium", isSelf && "text-primary")}>{name}</span>
      </div>
      {active && <Badge className="bg-primary/10 text-primary text-[8px] font-black tracking-tighter hover:bg-primary/20">LIVE</Badge>}
    </div>
  );
}
