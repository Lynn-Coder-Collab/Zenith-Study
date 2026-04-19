import { Button } from './ui/button';
import { useAppStore } from '../store/useAppStore';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { LogOut, User, Menu, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Navbar() {
  const { user } = useAppStore();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => signOut(auth);

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 border-b bg-background/80 backdrop-blur-md z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="text-primary-foreground w-5 h-5 fill-current" />
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:inline-block">Zenith</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground">LVL {user.stats.level}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        ) : (
          <Button onClick={handleLogin}>Get Started</Button>
        )}
      </div>
    </nav>
  );
}
