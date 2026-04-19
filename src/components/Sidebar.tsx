import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Target, 
  Trophy, 
  Settings, 
  MessageSquare, 
  Users,
  Search,
  StickyNote,
  User
} from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: BookOpen, label: 'Quizzes', path: '/quizzes' },
  { icon: MessageSquare, label: 'AI Mentor', path: '/mentor' },
  { icon: Target, label: 'Focus Mode', path: '/focus' },
  { icon: Users, label: 'Study Room', path: '/rooms' },
  { icon: Trophy, label: 'Leaderboard', path: '/leaderboard' },
  { icon: StickyNote, label: 'My Notes', path: '/notes' },
  { icon: Search, label: 'Search', path: '/search' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 border-r bg-muted/30 hidden lg:flex flex-col p-4 gap-2">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-4 mb-2">
        Main Menu
      </div>
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )
          }
        >
          <item.icon className="w-5 h-5" />
          {item.label}
        </NavLink>
      ))}
    </aside>
  );
}
