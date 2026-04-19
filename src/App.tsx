import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { useAppStore } from './store/useAppStore';
import { UserProfile } from './types';
import { Navbar } from './components/Navbar';
import { Toaster } from './components/ui/sonner';

// Lazy load pages for performance
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Quizzes } from './pages/Quizzes';
import { QuizRoom } from './pages/QuizRoom';
import { Mentor } from './pages/Mentor';
import { StudyRooms } from './pages/StudyRooms';
import { Focus } from './pages/Focus';
import { Leaderboard } from './pages/Leaderboard';
import { Notes } from './pages/Notes';
import { SearchPage } from './pages/Search';

export default function App() {
  const { setUser, setLoading, user, isLoading } = useAppStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          setUser(userDoc.data() as UserProfile);
        } else {
          // New user setup
          const newUser: UserProfile = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'Learner',
            email: firebaseUser.email || '',
            role: 'student',
            stats: {
              totalStudyTime: 0,
              quizCount: 0,
              streak: 0,
              velocity: 0,
              xp: 0,
              level: 1
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          await setDoc(userRef, newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-xl" />
          <div className="h-4 w-24 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
        <Navbar />
        <main className="pt-16 w-full max-w-screen-2xl mx-auto">
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/" />} />
            <Route path="/settings" element={user ? <Settings /> : <Navigate to="/" />} />
            <Route path="/quizzes" element={user ? <Quizzes /> : <Navigate to="/" />} />
            <Route path="/quiz/:id" element={user ? <QuizRoom /> : <Navigate to="/" />} />
            <Route path="/mentor" element={user ? <Mentor /> : <Navigate to="/" />} />
            <Route path="/rooms" element={user ? <StudyRooms /> : <Navigate to="/" />} />
            <Route path="/focus" element={user ? <Focus /> : <Navigate to="/" />} />
            <Route path="/leaderboard" element={user ? <Leaderboard /> : <Navigate to="/" />} />
            <Route path="/notes" element={user ? <Notes /> : <Navigate to="/" />} />
            <Route path="/search" element={user ? <SearchPage /> : <Navigate to="/" />} />
          </Routes>
        </main>
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}
