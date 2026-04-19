import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, ArrowUp, ArrowDown, Minus, Crown, Medal } from 'lucide-react';
import { dataService } from '../services/dataService';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';
import { Skeleton } from '../components/ui/skeleton';

export function Leaderboard() {
  const [leaders, setLeaders] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaders() {
      try {
        const topUsers = await dataService.getTopUsers(10);
        setLeaders(topUsers);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaders();
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-12">
        <Skeleton className="h-40 w-full rounded-[3rem]" />
        <div className="grid grid-cols-3 gap-8 h-64">
           <Skeleton className="rounded-[3rem]" />
           <Skeleton className="rounded-[3rem]" />
           <Skeleton className="rounded-[3rem]" />
        </div>
      </div>
    );
  }

  const podium = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  // Reorder podium for display: 2nd, 1st, 3rd
  const displayPodium = [
    podium[1] || null,
    podium[0] || null,
    podium[2] || null
  ].filter(Boolean) as UserProfile[];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-12">
      <header className="flex flex-col items-center text-center space-y-4">
        <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center rotate-3 border-4 border-dashed border-primary/20">
          <Trophy className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Global Velocity Elite</h1>
          <p className="text-muted-foreground font-medium uppercase tracking-[0.25em] text-[10px]">Synchronizing with global learning peaks</p>
        </div>
      </header>

      {/* Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end mb-16">
        {displayPodium.map((user, idx) => (
          <PodiumPlace 
            key={user.uid} 
            user={user} 
            place={user === podium[0] ? 1 : user === podium[1] ? 2 : 3} 
          />
        ))}
      </div>

      {/* Main List */}
      <div className="space-y-4 pb-12">
        {rest.map((user, idx) => (
          <motion.div
            key={user.uid}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center gap-6 p-6 bg-muted/20 border-2 rounded-[2rem] hover:bg-background hover:border-primary transition-all group"
          >
            <span className="text-4xl font-black italic text-muted-foreground/30 group-hover:text-primary transition-colors min-w-[60px]">
              {(idx + 4).toString().padStart(2, '0')}
            </span>
            <div className="flex-1 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold tracking-tight">{user.name}</h3>
                <div className="flex items-center gap-4 mt-1">
                   <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                     <Medal className="w-3 h-3" />
                     {user.stats.xp} XP
                   </div>
                   <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                     <ArrowUp className="w-3 h-3 text-emerald-500" />
                     {user.stats.velocity.toFixed(1)} VEL
                   </div>
                </div>
              </div>
              <Minus className="text-muted-foreground/30" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PodiumPlace({ user, place }: { user: UserProfile, place: number }) {
  const isFirst = place === 1;
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "relative flex flex-col items-center p-8 rounded-[3rem] border-4 transition-transform hover:scale-105",
        isFirst ? "bg-primary text-primary-foreground border-primary shadow-2xl z-10" : "bg-background border-muted h-[80%]"
      )}
    >
      {isFirst && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2">
           <Crown className="w-16 h-16 text-yellow-400 fill-current animate-bounce" />
        </div>
      )}
      <div className={cn(
        "w-20 h-20 rounded-3xl flex items-center justify-center font-black text-3xl mb-6 shadow-xl",
        isFirst ? "bg-background text-primary" : "bg-muted text-muted-foreground border-2"
      )}>
        {place}
      </div>
      <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2 text-center truncate w-full px-2">{user.name}</h3>
      <div className={cn(
        "px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest mb-4",
        isFirst ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"
      )}>
        {user.stats.xp} Accumulated XP
      </div>
      <div className="flex items-center gap-2">
         <span className={cn("text-lg font-black italic", isFirst ? "text-primary-foreground/80" : "text-muted-foreground")}>{user.stats.velocity.toFixed(1)}</span>
         <span className="text-[10px] font-bold uppercase tracking-widest">Velocity</span>
      </div>
    </motion.div>
  );
}
