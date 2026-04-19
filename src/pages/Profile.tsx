import { useAppStore } from '../store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { User, Mail, Shield, Calendar, Award, Zap, Flame } from 'lucide-react';

export function Profile() {
  const { user } = useAppStore();

  if (!user) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-black tracking-tight uppercase">User Profile</h1>
        <p className="text-muted-foreground uppercase tracking-widest text-[10px]">Academic Identity Core</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1 rounded-[2rem] border-2 shadow-xl overflow-hidden">
          <div className="h-32 bg-primary" />
          <CardContent className="pt-0 flex flex-col items-center -mt-16 pb-8">
            <div className="w-32 h-32 rounded-[2rem] bg-background border-4 border-background flex items-center justify-center shadow-xl mb-4 overflow-hidden">
               {user.avatar ? (
                 <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
               ) : (
                 <User className="w-16 h-16 text-muted-foreground" />
               )}
            </div>
            <h2 className="text-2xl font-black italic uppercase tracking-tight">{user.name}</h2>
            <Badge className="mt-2 font-bold tracking-widest uppercase text-[10px]">{user.role}</Badge>
            
            <div className="grid grid-cols-2 w-full gap-4 mt-8 px-4">
              <div className="flex flex-col items-center p-3 rounded-2xl bg-muted border">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Level</span>
                <span className="text-xl font-black">{user.stats.level}</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-2xl bg-muted border">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Streak</span>
                <span className="text-xl font-black flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-500 fill-current" />
                  {user.stats.streak}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card className="rounded-3xl border-2">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <InfoItem icon={Mail} label="Email Address" value={user.email} />
               <InfoItem icon={Shield} label="Account Type" value={user.role === 'admin' ? 'Administrative Access' : 'Standard Student'} />
               <InfoItem icon={Calendar} label="Member Since" value={new Date(user.createdAt).toLocaleDateString()} />
               <InfoItem icon={Award} label="Accumulated Experience" value={`${user.stats.xp} XP`} />
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-2 bg-muted/20">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Learning Metrics</CardTitle>
              <CardDescription>Real-time synchronization with cognitive performance</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-6 pb-8">
               <MetricItem label="Study Velocity" value={user.stats.velocity.toFixed(2)} unit="pts/h" />
               <MetricItem label="Quizzes Completed" value={user.stats.quizCount.toString()} unit="sessions" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border bg-muted/10 group hover:border-primary transition-colors">
      <div className="w-10 h-10 rounded-xl bg-background border flex items-center justify-center">
        <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
        <p className="font-bold">{value}</p>
      </div>
    </div>
  );
}

function MetricItem({ label, value, unit }: { label: string, value: string, unit: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black tabular-nums tracking-tighter">{value}</span>
        <span className="text-xs font-bold text-muted-foreground italic">{unit}</span>
      </div>
    </div>
  );
}
