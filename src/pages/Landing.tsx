import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Sparkles } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const handleStart = () => {
    if (user) {
      navigate('/filter/gender');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="font-semibold text-foreground">Fashion AI</span>
        </div>
        
        {!loading && !user && (
          <button 
            onClick={() => navigate('/auth')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign In
          </button>
        )}
        
        {!loading && user && (
          <button 
            onClick={() => navigate('/filter/gender')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Create Model
          </button>
        )}
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-2xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm mb-8">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>AI-Powered Fashion Model Generator</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Create Your Perfect
            <span className="block text-primary">Fashion Model</span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-12 max-w-lg mx-auto">
            Design stunning AI-generated fashion models with customizable features, 
            clothing, and poses for your creative projects.
          </p>

          <button
            onClick={handleStart}
            className="btn-gold animate-glow-pulse"
          >
            Let's Start
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-muted-foreground">
        <p>Powered by AI • Create unlimited unique models</p>
      </footer>
    </div>
  );
}
