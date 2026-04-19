import { Button } from './ui/button';
import { useAppStore } from '../store/useAppStore';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { LogOut, User, Settings as SettingsIcon, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function Navbar() {
  const { user } = useAppStore();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => signOut(auth);

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 border-b bg-background/80 backdrop-blur-md z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
            <Zap className="text-primary-foreground w-5 h-5 fill-current" />
          </div>
          <span className="font-black text-xl tracking-tight hidden sm:inline-block group-hover:text-primary transition-colors">Zenith</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden sm:flex flex-col items-end mr-3">
              <span className="text-sm font-bold uppercase tracking-tight">{user.name}</span>
              <span className="text-[10px] uppercase font-black tracking-widest text-primary">LVL {user.stats.level}</span>
            </div>
            
            <Link to="/profile">
              <Button variant="ghost" size="icon" title="Profile" className="rounded-full hover:bg-primary/20 hover:text-primary transition-colors">
                <User className="w-4 h-4" />
              </Button>
            </Link>

            <Link to="/settings">
              <Button variant="ghost" size="icon" title="Settings" className="rounded-full hover:bg-primary/20 hover:text-primary transition-colors">
                <SettingsIcon className="w-4 h-4" />
              </Button>
            </Link>

            <Button variant="ghost" size="icon" title="Logout" onClick={handleLogout} className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors ml-1">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button onClick={handleLogin} className="font-bold rounded-xl uppercase tracking-wider text-xs">Get Started</Button>
        )}
      </div>
    </nav>
  );
}
