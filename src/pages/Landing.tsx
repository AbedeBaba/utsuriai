import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, Upload, Wand2, Download, ArrowRight, Play, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Footer } from '@/components/Footer';
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
import ctaBackground from '@/assets/cta-background.jpg';
export default function Landing() {
  const navigate = useNavigate();
  const {
    user,
    loading
  } = useAuth();
  const {
    t
  } = useLanguage();
  const handleStart = () => {
    if (user) {
      navigate('/filter/gender');
    } else {
      navigate('/auth');
    }
  };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How it Works
            </a>
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <button onClick={() => navigate('/pricing')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </button>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {!loading && user && <button onClick={() => navigate('/dashboard')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('common.dashboard')}
              </button>}
            {!loading && !user && <button onClick={() => navigate('/auth')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('common.login')}
              </button>}
            
            <LanguageSwitcher />
            
            <Button onClick={handleStart} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6">
              {t('common.getStarted')}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <LanguageSwitcher />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <nav className="flex flex-col gap-6 mt-8">
                  <a 
                    href="#how-it-works" 
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    How it Works
                  </a>
                  <a 
                    href="#features" 
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Features
                  </a>
                  <button 
                    onClick={() => { navigate('/pricing'); setMobileMenuOpen(false); }} 
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors text-left"
                  >
                    Pricing
                  </button>
                  
                  <div className="h-px bg-border my-2" />
                  
                  {!loading && user && (
                    <button 
                      onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }} 
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors text-left"
                    >
                      {t('common.dashboard')}
                    </button>
                  )}
                  {!loading && !user && (
                    <button 
                      onClick={() => { navigate('/auth'); setMobileMenuOpen(false); }} 
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors text-left"
                    >
                      {t('common.login')}
                    </button>
                  )}
                  
                  <Button 
                    onClick={() => { handleStart(); setMobileMenuOpen(false); }} 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full mt-4"
                  >
                    {t('common.getStarted')}
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Full-Screen Hero Banner */}
      <section className="relative min-h-screen w-full bg-cover bg-top md:bg-center bg-no-repeat flex items-center justify-center" style={{
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

        <div className="relative max-w-[90rem] mx-auto px-4 sm:px-8 lg:px-16 rounded-3xl py-12 sm:py-16 lg:py-20 overflow-hidden">
          {/* Blurred lavender gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(250,60%,88%)] via-[hsl(260,55%,85%)] to-[hsl(270,50%,88%)] blur-xl" />
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(250,60%,88%)] via-[hsl(260,55%,85%)] to-[hsl(270,50%,88%)] opacity-90" />
          <div className="relative z-10 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
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
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-4 md:gap-6 items-center justify-center">
                {/* Product Image */}
                <div className="relative w-full max-w-[280px] sm:max-w-[200px] md:max-w-[240px] lg:max-w-[300px]">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-primary/30">
                    <img alt="Product photo" className="w-full h-full object-cover" src="/lovable-uploads/1705c0f2-68bc-4333-a1c8-ad01e24a5811.jpg" />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-muted text-sm font-medium text-muted-foreground whitespace-nowrap">
                    Product Photo
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex flex-row sm:flex-col items-center gap-2 px-4 py-4 sm:py-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/20 flex items-center justify-center">
                    <Wand2 className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                  </div>
                  <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7 text-primary rotate-90 sm:rotate-0" />
                </div>

                {/* Model Image */}
                <div className="relative w-full max-w-[280px] sm:max-w-[200px] md:max-w-[240px] lg:max-w-[300px]">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-primary/30">
                    <img alt="AI generated model" className="w-full h-full object-cover" src="/lovable-uploads/5212774f-8c09-42bf-b019-8f7f544f3c3b.png" />
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
      <section className="py-16 my-12 bg-secondary/30">
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
              <p className="text-3xl md:text-4xl font-bold text-foreground">10%+</p>
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
      <section id="how-it-works" className="py-28 relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
              How <span className="italic text-primary">Utsuri</span> Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Create Fashion Models Without a Studio - Upload your product, choose a model, and get realistic AI fashion photos in minutes.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 - Transform */}
            <div className="relative group">
              <div className="absolute -left-2 -top-2 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-lg font-semibold text-primary-foreground z-10">
                1
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1 min-h-[320px] flex flex-col shadow-sm">
                <div className="flex-1 flex items-center justify-center p-8 pt-12">
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Wand2 className="w-12 h-12 md:w-14 md:h-14 text-primary" />
                  </div>
                </div>
                <div className="p-6 pt-0 text-center">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Transform</h3>
                  <p className="text-slate-600 text-sm">Choose model, pose & environment with AI.</p>
                </div>
              </div>
            </div>

            {/* Step 2 - Upload */}
            <div className="relative group">
              <div className="absolute -left-2 -top-2 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-lg font-semibold text-primary-foreground z-10">
                2
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1 min-h-[320px] flex flex-col shadow-sm">
                <div className="flex-1 flex items-center justify-center p-8 pt-12">
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Upload className="w-12 h-12 md:w-14 md:h-14 text-primary" />
                  </div>
                </div>
                <div className="p-6 pt-0 text-center">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Upload</h3>
                  <p className="text-slate-600 text-sm">Upload your product photos in seconds.</p>
                </div>
              </div>
            </div>

            {/* Step 3 - Download */}
            <div className="relative group">
              <div className="absolute -left-2 -top-2 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-lg font-semibold text-primary-foreground z-10">
                3
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1 min-h-[320px] flex flex-col shadow-sm">
                <div className="flex-1 flex items-center justify-center p-8 pt-12">
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Download className="w-12 h-12 md:w-14 md:h-14 text-primary" />
                  </div>
                </div>
                <div className="p-6 pt-0 text-center">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Download</h3>
                  <p className="text-slate-600 text-sm">Get studio-quality images instantly.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-14 flex flex-col items-center gap-3">
            <Button onClick={handleStart} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold px-10 py-6 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
              <span className="flex items-center gap-2">
                Start for Free
                <ArrowRight className="h-5 w-5" />
              </span>
            </Button>
            <span className="text-sm text-slate-500">No credit card required</span>
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
      <Footer />
    </div>;
}