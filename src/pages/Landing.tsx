import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, Upload, Wand2, Download, ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">Fashion AI</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How it Works
            </a>
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
          </nav>

          <div className="flex items-center gap-4">
            {!loading && !user && (
              <button 
                onClick={() => navigate('/auth')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Login
              </button>
            )}
            
            <Button 
              onClick={handleStart}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6"
            >
              Try Now
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-background" />
        
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm mb-8">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-foreground">AI-Powered Fashion Photography</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Create <span className="italic text-primary">stunning</span> fashion photos with AI generated models
              </h1>
              
              <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0">
                Perfect for fashion brands that value quality, speed, and flexibility. 
                Bring your products to life at a fraction of the cost.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  onClick={handleStart}
                  size="lg"
                  className="btn-gold animate-glow-pulse text-lg px-8 py-6 rounded-xl"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                <Button 
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6 rounded-xl border-border hover:bg-secondary"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>
            </div>

            {/* Right content - Hero image */}
            <div className="relative">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-secondary to-muted shadow-2xl">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                      <Wand2 className="w-10 h-10 text-primary" />
                    </div>
                    <p className="text-muted-foreground">AI Generated Fashion Model</p>
                  </div>
                </div>
                
                {/* Decorative badge */}
                <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 rounded-full bg-background/90 backdrop-blur-sm text-sm">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-foreground">Created with Fashion AI</span>
                </div>
              </div>
              
              {/* Floating cards */}
              <div className="absolute -left-4 top-1/4 bg-card p-4 rounded-xl shadow-lg border border-border/50 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Upload</p>
                    <p className="text-xs text-muted-foreground">Your clothing</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -right-4 bottom-1/4 bg-card p-4 rounded-xl shadow-lg border border-border/50 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Wand2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Transform</p>
                    <p className="text-xs text-muted-foreground">AI magic</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-foreground">90%</p>
              <p className="text-sm text-muted-foreground mt-1">Cost Reduction</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-foreground">10x</p>
              <p className="text-sm text-muted-foreground mt-1">Faster to Market</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-foreground">30%+</p>
              <p className="text-sm text-muted-foreground mt-1">Conversion Boost</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-foreground">∞</p>
              <p className="text-sm text-muted-foreground mt-1">Model Diversity</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How <span className="italic text-primary">Fashion AI</span> Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              No creative skills required - just a few clicks and you've got realistic stunning photos.
              Experience the magic of AI-powered fashion photography today.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative group">
              <div className="absolute -left-4 -top-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                1
              </div>
              <div className="bg-card border border-border rounded-2xl p-8 pt-12 h-full transition-all duration-300 hover:shadow-lg hover:border-primary/30">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Upload</h3>
                <p className="text-muted-foreground">
                  Upload images of your clothing, accessories, or jewelry from any angle.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="absolute -left-4 -top-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                2
              </div>
              <div className="bg-card border border-border rounded-2xl p-8 pt-12 h-full transition-all duration-300 hover:shadow-lg hover:border-primary/30">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <Wand2 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Transform</h3>
                <p className="text-muted-foreground">
                  Select model characteristics - ethnicity, body type, hair, and more.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="absolute -left-4 -top-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                3
              </div>
              <div className="bg-card border border-border rounded-2xl p-8 pt-12 h-full transition-all duration-300 hover:shadow-lg hover:border-primary/30">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <Download className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Download</h3>
                <p className="text-muted-foreground">
                  Get your professional AI-generated fashion photos ready for any platform.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button 
              onClick={handleStart}
              size="lg"
              className="btn-gold text-lg px-8 py-6 rounded-xl"
            >
              Try Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              AI Solutions to <span className="italic text-primary">Boost</span> Your Brand
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform your fashion photography with powerful AI-driven features.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-card border border-border rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/30">
              <h3 className="text-lg font-semibold text-foreground mb-2">Diverse Model Portfolio</h3>
              <p className="text-sm text-muted-foreground">
                Access a wide selection of AI models with diverse body types, ethnicities, ages, and styles.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card border border-border rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/30">
              <h3 className="text-lg font-semibold text-foreground mb-2">Multi-Angle Support</h3>
              <p className="text-sm text-muted-foreground">
                Upload multiple photos from different angles - outfits, accessories, and jewelry all combined.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card border border-border rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/30">
              <h3 className="text-lg font-semibold text-foreground mb-2">Studio-Quality Results</h3>
              <p className="text-sm text-muted-foreground">
                Get professional, studio-quality photos without the expensive photoshoot.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-card border border-border rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/30">
              <h3 className="text-lg font-semibold text-foreground mb-2">Skip the Shoots</h3>
              <p className="text-sm text-muted-foreground">
                No studios, no crews - cut costs by 90% without sacrificing quality.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-card border border-border rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/30">
              <h3 className="text-lg font-semibold text-foreground mb-2">Full Image Rights</h3>
              <p className="text-sm text-muted-foreground">
                Use your photos anytime, anywhere. No fees, no headaches - just freedom.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-card border border-border rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/30">
              <h3 className="text-lg font-semibold text-foreground mb-2">Instant Generation</h3>
              <p className="text-sm text-muted-foreground">
                Generate stunning, professional photos and launch collections in no time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-background to-secondary/50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to Transform Your Fashion Photography?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of fashion brands creating stunning AI-generated model photos.
          </p>
          <Button 
            onClick={handleStart}
            size="lg"
            className="btn-gold animate-glow-pulse text-lg px-10 py-6 rounded-xl"
          >
            Start Creating Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">Fashion AI</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Powered by AI • Create unlimited unique models
            </p>
            
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
