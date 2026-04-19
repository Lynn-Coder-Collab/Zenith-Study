import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { dataService } from '../services/dataService';
import { StudyRoom, Quiz } from '../types';
import { motion } from 'motion/react';
import { 
  Zap, 
  Flame, 
  Clock, 
  BarChart2, 
  ArrowUpRight,
  TrendingUp,
  Award,
  BookOpen,
  Trophy,
  BrainCircuit,
  FileText,
  Users,
  Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export function Dashboard() {
  const { user } = useAppStore();
  const navigate = useNavigate();
  const [chartData, setChartData] = useState<{ day: string, hours: number }[]>([]);
  const [rooms, setRooms] = useState<StudyRoom[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    const [sessions, activeRooms, allQuizzes] = await Promise.all([
      dataService.getRecentFocusSessions(user!.uid),
      dataService.getActiveRooms(),
      dataService.getQuizzes()
    ]);
    
    setChartData(sessions.length > 0 ? sessions : [
       { day: 'Mon', hours: 0 },
       { day: 'Tue', hours: 0 },
       { day: 'Wed', hours: 0 },
       { day: 'Thu', hours: 0 },
       { day: 'Fri', hours: 0 },
       { day: 'Sat', hours: 0 },
       { day: 'Sun', hours: 0 },
    ]);
    setRooms(activeRooms.slice(0, 2));
    setQuizzes(allQuizzes.slice(0, 2));
  };

  if (!user) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase">Mission Control</h1>
          <p className="text-muted-foreground italic serif">"The expert in anything was once a beginner."</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 text-orange-600 rounded-full text-sm font-bold border border-orange-500/20 shadow-sm">
            <Flame className="w-4 h-4 fill-current" />
            {user.stats.streak} Day Streak
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full text-sm font-bold border border-blue-500/20 shadow-sm">
            <Zap className="w-4 h-4 fill-current" />
            LVL {user.stats.level}
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Study Time" 
          value={`${Math.floor(user.stats.totalStudyTime / 60)}h ${user.stats.totalStudyTime % 60}m`}
          icon={Clock}
          trend="Real-time buffer"
        />
        <StatCard 
          label="Velocity" 
          value={`${user.stats.velocity.toFixed(1)}`}
          subtext="units/day"
          icon={TrendingUp}
          trend="Cognitive pace"
        />
        <StatCard 
          label="Quizzes" 
          value={`${user.stats.quizCount}`}
          icon={BarChart2}
          trend="Evaluation cycles"
        />
        <StatCard 
          label="XP Progress" 
          value={`${user.stats.xp}`}
          subtext="/ 5000"
          icon={Award}
          trend={`${Math.min(100, (user.stats.xp / 5000) * 100).toFixed(0)}% to expansion`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart area which now also includes quick links */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-3xl overflow-hidden border-2 shadow-sm bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold tracking-tight uppercase">Focus Intensity</CardTitle>
              <CardDescription>Biometric study duration over current cycle</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] pl-2 pb-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '2px solid hsl(var(--border))',
                      borderRadius: '16px',
                      fontWeight: 'bold',
                      fontSize: '12px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="hours" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorHours)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quick Access Hub */}
          <div>
             <h2 className="text-lg font-black uppercase tracking-tight mb-4 mt-6 border-b border-border/50 pb-2">System Modules</h2>
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <QuickLinkCard 
                  title="AI Mentor" 
                  desc="Neural assistance" 
                  icon={BrainCircuit} 
                  path="/mentor" 
                  onClick={() => navigate('/mentor')} 
                  color="text-primary"
                />
                <QuickLinkCard 
                  title="Quizzes" 
                  desc="Knowledge checks" 
                  icon={BookOpen} 
                  path="/quizzes" 
                  onClick={() => navigate('/quizzes')} 
                  color="text-blue-500"
                />
                <QuickLinkCard 
                  title="Study Rooms" 
                  desc="Live sessions" 
                  icon={Users} 
                  path="/rooms" 
                  onClick={() => navigate('/rooms')} 
                  color="text-purple-500"
                />
                <QuickLinkCard 
                  title="Data Archives" 
                  desc="Saved notes" 
                  icon={FileText} 
                  path="/notes" 
                  onClick={() => navigate('/notes')} 
                  color="text-emerald-500"
                />
                <QuickLinkCard 
                  title="Leaderboard" 
                  desc="Global ranking" 
                  icon={Trophy} 
                  path="/leaderboard" 
                  onClick={() => navigate('/leaderboard')} 
                  color="text-amber-500"
                />
                <QuickLinkCard 
                  title="Search Engine" 
                  desc="Ecosystem query" 
                  icon={Search} 
                  path="/search" 
                  onClick={() => navigate('/search')} 
                  color="text-rose-500"
                />
             </div>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-6">
          <Card className="rounded-3xl border-2 bg-primary text-primary-foreground shadow-xl overflow-hidden relative">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <CardContent className="p-8 relative z-10">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2">Initialize Focus</h3>
              <p className="text-primary-foreground/80 text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-6">
                Deploy cognitive lock-on. Archive all distractions. Target acquired.
              </p>
              <Button variant="secondary" className="w-full h-12 rounded-xl font-black uppercase text-xs tracking-widest group shadow-lg" onClick={() => navigate('/focus')}>
                Start Sequence
                <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-2 overflow-hidden shadow-sm bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-4 border-b bg-muted/20">
              <CardTitle className="text-sm font-black uppercase tracking-widest">Active Vectors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-6">
              {rooms.map(room => (
                 <ChallengeItem key={room.id} title={room.name} subtitle={`${room.participants.length} Active`} type="Room" onClick={() => navigate('/rooms')} />
              ))}
              {quizzes.map(quiz => (
                 <ChallengeItem key={quiz.id} title={quiz.title} subtitle={quiz.category} type="Quiz" onClick={() => navigate(`/quiz/${quiz.id}`)} />
              ))}
              {rooms.length === 0 && quizzes.length === 0 && (
                <div className="flex items-center justify-center py-8">
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/50 px-4 py-2 rounded-full border">No vectors detected</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, subtext, icon: Icon, trend }: { label: string, value: string, subtext?: string, icon: any, trend: string }) {
  return (
    <Card className="rounded-3xl border-2 hover:border-primary transition-all group shadow-sm bg-card/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{label}</span>
          <div className="w-8 h-8 rounded-xl bg-muted border flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary transition-colors shadow-inner">
            <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>
        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-3xl font-black tabular-nums tracking-tighter">{value}</span>
          {subtext && <span className="text-xs text-muted-foreground font-black italic">{subtext}</span>}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse" />
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{trend}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickLinkCard({ title, desc, icon: Icon, onClick, color = "text-primary" }: { title: string, desc: string, icon: any, path: string, onClick: () => void, color?: string }) {
  return (
    <div 
      onClick={onClick}
      className="p-4 rounded-3xl border-2 bg-card/80 backdrop-blur-sm hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer group flex flex-col items-center text-center gap-3"
    >
      <div className={`w-12 h-12 rounded-2xl bg-muted border flex items-center justify-center ${color} group-hover:scale-110 transition-transform shadow-inner`}>
         <Icon className="w-6 h-6" />
      </div>
      <div>
         <h4 className="font-black uppercase text-xs tracking-tight mb-1">{title}</h4>
         <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{desc}</p>
      </div>
    </div>
  );
}

function ChallengeItem({ title, subtitle, type, onClick }: { title: string, subtitle: string, type: string, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between p-4 rounded-2xl bg-background border-2 hover:border-primary transition-all cursor-pointer group shadow-sm"
    >
      <div className="min-w-0 flex-1 pr-4">
        <p className="text-xs font-black uppercase tracking-tight truncate group-hover:text-primary transition-colors">{title}</p>
        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">{subtitle}</p>
      </div>
      <Badge variant="secondary" className="text-[8px] font-black uppercase tracking-widest h-6 border">{type}</Badge>
    </div>
  );
}
