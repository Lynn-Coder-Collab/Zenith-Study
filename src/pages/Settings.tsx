import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Bell, Shield, Moon, Monitor, Key, HardDrive } from 'lucide-react';

export function Settings() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-black tracking-tight uppercase">System Settings</h1>
        <p className="text-muted-foreground uppercase tracking-widest text-[10px]">Global Control Interface</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <Card className="rounded-3xl border-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Preferences</CardTitle>
            <CardDescription>Tailor the platform to your cognitive workflow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="flex items-center justify-between p-4 rounded-2xl border bg-muted/10">
                <div className="flex items-center gap-3">
                   <Moon className="w-5 h-5 text-muted-foreground" />
                   <div>
                     <p className="font-bold">Dark Protocol</p>
                     <p className="text-xs text-muted-foreground uppercase font-medium tracking-wider">Optimize for night-time study sessions</p>
                   </div>
                </div>
                <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
             </div>

             <div className="flex items-center justify-between p-4 rounded-2xl border bg-muted/10">
                <div className="flex items-center gap-3">
                   <Bell className="w-5 h-5 text-muted-foreground" />
                   <div>
                     <p className="font-bold">Neural Alerts</p>
                     <p className="text-xs text-muted-foreground uppercase font-medium tracking-wider">Push notifications for room & quiz activity</p>
                   </div>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
             </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Interface & Display</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between p-4 rounded-2xl border bg-muted/10">
                <div className="flex items-center gap-3">
                   <Monitor className="w-5 h-5 text-muted-foreground" />
                   <div>
                     <p className="font-bold">Resolution Scaling</p>
                     <p className="text-xs text-muted-foreground uppercase font-medium tracking-wider">Adaptive UI scaling for 4K displays</p>
                   </div>
                </div>
                <Badge variant="secondary">Auto</Badge>
             </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Security & Infrastructure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pb-8">
             <div className="p-4 rounded-2xl border bg-background flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <Key className="w-5 h-5 text-primary" />
                   <div>
                     <p className="font-bold uppercase text-xs tracking-widest">API Vector Status</p>
                     <p className="text-[10px] text-muted-foreground">Groq & Gemini Synchronization Active</p>
                   </div>
                </div>
                <Button variant="ghost" size="sm" className="font-bold text-[10px] uppercase">Rotate Keys</Button>
             </div>
             
             <div className="p-4 rounded-2xl border bg-background flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <Shield className="w-5 h-5 text-primary" />
                   <div>
                     <p className="font-bold uppercase text-xs tracking-widest">Database Region</p>
                     <p className="text-[10px] text-muted-foreground">Studyfocus-bc08e (Global)</p>
                   </div>
                </div>
                <Badge variant="outline" className="text-[10px] font-bold">STABLE</Badge>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
