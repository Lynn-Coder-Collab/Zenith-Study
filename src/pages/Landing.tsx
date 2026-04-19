import { Button } from '../components/ui/button';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { motion } from 'motion/react';
import { Zap, BookOpen, Users, Brain, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Landing() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-6 py-24 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>Next-Gen Learning Platform</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[0.9]"
        >
          STUDY <br className="hidden md:block" /> WITH ZENITH
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl text-xl text-muted-foreground mb-12"
        >
          Master any subject with AI-powered personalized roadmaps, interactive quizzes, 
          and collaborative real-time study rooms.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button size="lg" className="h-14 px-8 text-lg rounded-2xl" onClick={handleLogin}>
            Join the Community
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-2xl">
            Explore Features
          </Button>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="w-full bg-muted/30 py-24 border-y">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard 
            icon={Brain}
            title="AI Mentor"
            description="24/7 personalized guidance from our advanced Gemini-powered academic mentor."
          />
          <FeatureCard 
            icon={BookOpen}
            title="Smart Quizzes"
            description="Spaced-repetition based testing to ensure maximum knowledge retention."
          />
          <FeatureCard 
            icon={Users}
            title="Study Rooms"
            description="Synchronous collaborative environments for peer-to-peer learning."
          />
          <FeatureCard 
            icon={Shield}
            title="Focus Mode"
            description="Scientific productivity tracking with deep state meditation cues."
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="p-8 bg-background rounded-3xl border shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-xl font-bold mb-3 tracking-tight">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
