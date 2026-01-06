import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, Upload, Wand2, Download, ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import exampleProduct from '@/assets/example-product.jpeg';
import exampleModel from '@/assets/example-model.jpeg';
import modelRealBg from '@/assets/modelreal.jpg';
import heroBanner from '@/assets/hero-banner.jpeg';
import diverseModelsBg from '@/assets/diverse-models-bg.jpg';
import instantGenerationBg from '@/assets/instant-generation-bg.jpg';
import studioQualityBg from '@/assets/studio-quality-bg.jpg';
import fullImageRightsBg from '@/assets/full-image-rights-bg.jpg';
import multiAngleBg from '@/assets/multi-angle-bg.jpg';
import aiSolutionsBg from '@/assets/ai-solutions-bg.jpg';
import howItWorksLeft from '@/assets/how-it-works-left.jpg';
import howItWorksRight from '@/assets/how-it-works-right.jpg';
import ctaBackground from '@/assets/cta-background.jpg';
export default function Landing() {
  const navigate = useNavigate();
  const {
    user,
    loading
  } = useAuth();
  const handleStart = () => {
    if (user) {
      navigate('/filter/gender');
    } else {
      navigate('/auth');
    }
  };
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">Utsuri</span>
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
            {!loading && user && <button onClick={() => navigate('/dashboard')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </button>}
            {!loading && !user && <button onClick={() => navigate('/auth')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Login
              </button>}
            
            <Button onClick={handleStart} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6">
              Try Now
            </Button>
          </div>
        </div>
      </header>

      {/* Full-Screen Hero Banner */}
      <section className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center" style={{
      backgroundImage: `url(${heroBanner})`
    }}>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Text content - customize as needed */}
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Transform Fashion with AI
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Create stunning AI-generated model photos for your fashion brand
          </p>
          <Button onClick={handleStart} size="lg" className="btn-gold animate-glow-pulse text-lg px-10 py-6 rounded-xl">
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-background" />
        
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-[90rem] mx-auto px-8 lg:px-16 rounded-3xl py-16 lg:py-20 overflow-hidden">
          {/* Blurred lavender gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(250,60%,88%)] via-[hsl(260,55%,85%)] to-[hsl(270,50%,88%)] blur-xl" />
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(250,60%,88%)] via-[hsl(260,55%,85%)] to-[hsl(270,50%,88%)] opacity-90" />
          <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            {/* Left content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm mb-8">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-foreground">AI-Powered Fashion Photography</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-8 leading-tight">
                Create <span className="italic text-primary">stunning</span> fashion photos with AI generated models
              </h1>
              
              <p className="text-lg lg:text-xl text-muted-foreground mb-12 max-w-xl mx-auto lg:mx-0">
                Perfect for fashion brands that value quality, speed, and flexibility. 
                Bring your products to life at a fraction of the cost.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button onClick={handleStart} size="lg" className="btn-gold animate-glow-pulse text-lg px-8 py-6 rounded-xl">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 rounded-xl border-border hover:bg-secondary">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>
            </div>

            {/* Right content - Before/After Example */}
            <div className="relative">
              <div className="flex gap-6 items-center justify-center">
                {/* Product Image */}
                <div className="relative flex-1 max-w-[240px] lg:max-w-[300px]">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-primary/30">
                    <img alt="Product photo" className="w-full h-full object-cover" src="https://tempfile.aiquickdraw.com/workers/nano/image_1767701683790_2obf46_1x1_1024x1024.png" />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-muted text-sm font-medium text-muted-foreground whitespace-nowrap">
                    Product Photo
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex flex-col items-center gap-2 px-4">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                    <Wand2 className="w-7 h-7 text-primary" />
                  </div>
                  <ArrowRight className="w-7 h-7 text-primary" />
                </div>

                {/* Model Image */}
                <div className="relative flex-1 max-w-[240px] lg:max-w-[300px]">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-primary/30">
                    <img alt="AI generated model" className="w-full h-full object-cover" src="/lovable-uploads/8ddcbf82-c9e2-4152-a3d7-c569be0b9c8b.jpg" />
                    {/* Decorative badge */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm text-xs">
                      <Sparkles className="w-3 h-3 text-primary" />
                      <span className="text-foreground">AI Generated</span>
                    </div>
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-primary text-sm font-medium text-primary-foreground whitespace-nowrap">
                    AI Model
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
      <section id="how-it-works" className="py-24 mt-12 relative overflow-hidden" style={{
      backgroundColor: '#c4bfab'
    }}>
        {/* Left decorative image */}
        <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-[280px] xl:w-[360px] h-[500px] xl:h-[600px]">
          <img src={howItWorksLeft} alt="" className="w-full h-full object-cover rounded-r-2xl shadow-xl" />
        </div>
        
        {/* Right decorative image */}
        <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-[280px] xl:w-[360px] h-[500px] xl:h-[600px]">
          <img alt="" className="w-full h-full object-cover rounded-l-2xl shadow-xl" src="/lovable-uploads/e3f5fe17-d0be-4617-bcc0-2d660cd05de9.jpg" />
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How <span className="italic text-primary">Utsuri</span> Works
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
            <Button onClick={handleStart} size="lg" className="btn-gold text-lg px-8 py-6 rounded-xl">
              Try Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        {/* Background image container - works on all devices including mobile */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat md:bg-fixed" style={{
        backgroundImage: `url(${aiSolutionsBg})`
      }} />
        <div className="absolute inset-0 bg-black/60" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              AI Solutions to Boost Your Brand
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Transform your fashion photography with powerful AI-driven features.
            </p>
          </div>

          {/* Top Row - Asymmetric 3-column grid with center empty */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Instant Generation - Left aligned (above Studio-Quality) */}
            <div className="relative rounded-2xl p-6 transition-all duration-300 hover:shadow-xl overflow-hidden min-h-[200px] flex flex-col justify-end group" style={{
            backgroundImage: `url(${instantGenerationBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/70 transition-all duration-300" />
              <div className="relative z-10">
                <h3 className="text-lg font-semibold text-white mb-2">Instant Generation</h3>
                <p className="text-sm text-white/80">
                  Generate stunning, professional photos and launch collections in no time.
                </p>
              </div>
            </div>
            
            {/* Empty center - intentional negative space */}
            <div className="hidden md:block" />
            
            {/* Diverse Model Portfolio - Right aligned */}
            <div className="relative rounded-2xl p-6 transition-all duration-300 hover:shadow-xl overflow-hidden min-h-[200px] flex flex-col justify-end group" style={{
            backgroundImage: `url(${diverseModelsBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/70 transition-all duration-300" />
              <div className="relative z-10">
                <h3 className="text-lg font-semibold text-white mb-2">Diverse Model Portfolio</h3>
                <p className="text-sm text-white/80">
                  Access a wide selection of AI models with diverse body types, ethnicities, ages, and styles.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Row - 3 feature boxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Studio-Quality Results */}
            <div className="relative rounded-2xl p-6 transition-all duration-300 hover:shadow-xl overflow-hidden min-h-[200px] flex flex-col justify-end group" style={{
            backgroundImage: `url(${studioQualityBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/70 transition-all duration-300" />
              <div className="relative z-10">
                <h3 className="text-lg font-semibold text-white mb-2">Studio-Quality Results</h3>
                <p className="text-sm text-white/80">
                  Get professional, studio-quality photos without the expensive photoshoot.
                </p>
              </div>
            </div>

            {/* Multi-Angle Support */}
            <div className="relative rounded-2xl p-6 transition-all duration-300 hover:shadow-xl overflow-hidden min-h-[200px] flex flex-col justify-end group" style={{
            backgroundImage: `url(${multiAngleBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/70 transition-all duration-300" />
              <div className="relative z-10">
                <h3 className="text-lg font-semibold text-white mb-2">Multi-Angle Support</h3>
                <p className="text-sm text-white/80">
                  Upload multiple photos from different angles - outfits, accessories, and jewelry all combined.
                </p>
              </div>
            </div>

            {/* Full Image Rights */}
            <div className="relative rounded-2xl p-6 transition-all duration-300 hover:shadow-xl overflow-hidden min-h-[200px] flex flex-col justify-end group" style={{
            backgroundImage: `url(${fullImageRightsBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/70 transition-all duration-300" />
              <div className="relative z-10">
                <h3 className="text-lg font-semibold text-white mb-2">Full Image Rights</h3>
                <p className="text-sm text-white/80">
                  Use your photos anytime, anywhere. No fees, no headaches - just freedom.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mt-12 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
        backgroundImage: `url(${ctaBackground})`
      }} />
        <div className="absolute inset-0 bg-background/70" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to Transform Your Fashion Photography?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of fashion brands creating stunning AI-generated model photos.
          </p>
          <Button onClick={handleStart} size="lg" className="btn-gold animate-glow-pulse text-lg px-10 py-6 rounded-xl">
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
              <span className="font-bold text-xl text-foreground">Utsuri</span>
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
    </div>;
}