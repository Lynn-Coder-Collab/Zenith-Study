import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store/useAppStore';
import { dataService } from '../services/dataService';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Volume2, 
  VolumeX,
  Waves,
  Zap
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { cn } from '../lib/utils';

export function Focus() {
  const { user } = useAppStore();
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isMuted, setIsMuted] = useState(false);
  const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus');

  const handleSessionEnd = useCallback(async () => {
    setIsActive(false);
    if (sessionType === 'focus') {
      if (user) {
        // Log 25 minutes of study time with daily tracking
        await dataService.logFocusSession(user.uid, 25);
      }
      setSessionType('break');
      setTimeLeft(5 * 60);
    } else {
      setSessionType('focus');
      setTimeLeft(25 * 60);
    }
  }, [sessionType, user]);

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      handleSessionEnd();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, handleSessionEnd]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(sessionType === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] p-6 bg-background relative overflow-hidden">
      {/* Immersive Background Gradients */}
      <div className={cn(
        "absolute inset-0 transition-all duration-1000 opacity-20 pointer-events-none",
        isActive ? "bg-primary" : "bg-muted"
      )} />
      <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full relative z-10"
      >
        <Card className="rounded-[3rem] border-4 border-muted overflow-hidden shadow-2xl bg-background/50 backdrop-blur-xl">
          <CardContent className="p-12 flex flex-col items-center text-center">
            
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted border-2 mb-12">
              <Zap className={cn("w-4 h-4", isActive ? "text-primary fill-current" : "text-muted-foreground")} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {sessionType === 'focus' ? 'Deep Work Cycle' : 'Neural Recovery'}
              </span>
            </div>

            {/* Hardware-style Timer Display */}
            <div className="relative mb-12">
               <div className="absolute inset-0 blur-3xl bg-primary/20 animate-pulse" />
               <h1 className="text-[10rem] font-black italic tracking-tighter leading-none tabular-nums text-foreground/90 relative">
                 {formatTime(timeLeft)}
               </h1>
            </div>

            <div className="grid grid-cols-3 gap-6 w-full mb-12">
               <ControlItem icon={Waves} label="Binaural" active={!isMuted} />
               <ControlItem icon={Settings} label="Session" />
               <ControlItem icon={isMuted ? VolumeX : Volume2} label={isMuted ? "Mutted" : "Active"} onClick={() => setIsMuted(!isMuted)} />
            </div>

            <div className="flex items-center gap-6">
               <Button 
                 variant="outline" 
                 size="icon" 
                 className="w-16 h-16 rounded-3xl border-2 hover:bg-muted"
                 onClick={resetTimer}
               >
                 <RotateCcw className="w-6 h-6" />
               </Button>
               
               <Button 
                  size="icon" 
                  className={cn(
                    "w-24 h-24 rounded-[3rem] shadow-xl transition-all active:scale-95",
                    isActive ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20" : "bg-primary hover:bg-primary shadow-primary/20"
                  )}
                  onClick={toggleTimer}
               >
                 {isActive ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current translate-x-1" />}
               </Button>

               <Button 
                variant="outline" 
                size="icon" 
                className="w-16 h-16 rounded-3xl border-2"
               >
                 <Settings className="w-6 h-6" />
               </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status Indicators */}
        <div className="flex justify-between px-8 mt-8">
           <div className="flex flex-col">
             <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Session Data</span>
             <span className="text-xl font-bold italic tracking-tight">4/8 Completed</span>
           </div>
           <div className="flex flex-col items-end">
             <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Focus Intensity</span>
             <div className="flex gap-1">
               {[...Array(5)].map((_, i) => (
                 <div key={i} className={cn("w-1.5 h-6 rounded-full border", i < 3 ? "bg-primary border-primary" : "bg-muted border-muted")} />
               ))}
             </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
}

function ControlItem({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 group">
      <div className={cn(
        "w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all",
        active ? "bg-primary/10 border-primary text-primary" : "bg-muted/50 border-muted group-hover:border-muted-foreground/30"
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
    </button>
  );
}
