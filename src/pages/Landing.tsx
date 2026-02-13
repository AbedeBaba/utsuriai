import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Upload, Wand2, Download, ArrowRight, Play, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Footer } from '@/components/Footer';
import { BrandLogo, BrandLogoMark } from '@/components/BrandLogo';
import exampleProduct from '@/assets/example-product.jpeg';
import exampleModel from '@/assets/example-model.jpeg';
import exampleProductPants from '@/assets/example-product-pants.webp';
import exampleModelPants from '@/assets/example-model-pants.jpg';
import exampleProductSweater from '@/assets/example-product-sweater.webp';
import exampleModelSweater from '@/assets/example-model-sweater.png';
import modelRealBg from '@/assets/modelreal.jpg';
import heroBanner from '@/assets/hero-banner.jpeg';
import heroBannerMobile from '@/assets/hero-banner-mobile.jpeg';
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
  return <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 w-full">
        <div className="max-w-7xl mx-auto px-6 h-20 md:h-32 flex items-center justify-between">
          <div className="cursor-pointer" onClick={() => navigate('/')}>
            <div className="hidden md:block">
              <BrandLogo size="xl" withText text="Utsuri" textClassName="font-bold text-2xl md:text-3xl not-italic" />
            </div>
            <div className="md:hidden">
              <BrandLogo size="lg" withText text="Utsuri" textClassName="font-bold text-xl not-italic" />
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate('/templates')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t('nav.templates')}
            </button>
            <button onClick={() => navigate('/jewelry')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t('nav.jewelry')}
            </button>
            <button onClick={() => navigate('/faq')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t('nav.faq')}
            </button>
            <button onClick={() => navigate('/contact')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t('common.contact')}
            </button>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t('nav.howItWorks')}
            </a>
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t('nav.features')}
            </a>
            <button onClick={() => navigate('/pricing')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t('nav.pricing')}
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
                  <button onClick={() => {
                  navigate('/templates');
                  setMobileMenuOpen(false);
                }} className="text-lg font-medium text-foreground hover:text-primary transition-colors text-left">
                    {t('nav.templates')}
                  </button>
                  <button onClick={() => {
                  navigate('/jewelry');
                  setMobileMenuOpen(false);
                }} className="text-lg font-medium text-foreground hover:text-primary transition-colors text-left">
                    {t('nav.jewelry')}
                  </button>
                  <button onClick={() => {
                  navigate('/faq');
                  setMobileMenuOpen(false);
                }} className="text-lg font-medium text-foreground hover:text-primary transition-colors text-left">
                    {t('nav.faq')}
                  </button>
                  <button onClick={() => {
                  navigate('/contact');
                  setMobileMenuOpen(false);
                }} className="text-lg font-medium text-foreground hover:text-primary transition-colors text-left">
                    {t('common.contact')}
                  </button>
                  <a href="#how-it-works" className="text-lg font-medium text-foreground hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    {t('nav.howItWorks')}
                  </a>
                  <a href="#features" className="text-lg font-medium text-foreground hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    {t('nav.features')}
                  </a>
                  <button onClick={() => {
                  navigate('/pricing');
                  setMobileMenuOpen(false);
                }} className="text-lg font-medium text-foreground hover:text-primary transition-colors text-left">
                    {t('nav.pricing')}
                  </button>
                  
                  <div className="h-px bg-border my-2" />
                  
                  {!loading && user && <button onClick={() => {
                  navigate('/dashboard');
                  setMobileMenuOpen(false);
                }} className="text-lg font-medium text-foreground hover:text-primary transition-colors text-left">
                      {t('common.dashboard')}
                    </button>}
                  {!loading && !user && <button onClick={() => {
                  navigate('/auth');
                  setMobileMenuOpen(false);
                }} className="text-lg font-medium text-foreground hover:text-primary transition-colors text-left">
                      {t('common.login')}
                    </button>}
                  
                  <Button onClick={() => {
                  handleStart();
                  setMobileMenuOpen(false);
                }} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full mt-4">
                    {t('common.getStarted')}
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Full-Screen Hero Banner */}
      <section className="relative min-h-screen w-full flex items-center justify-center">
        {/* Desktop background */}
        <div className="absolute inset-0 hidden md:block bg-cover bg-no-repeat" style={{
          backgroundImage: `url(${heroBanner})`,
          backgroundPosition: 'center 25%'
        }} />
        {/* Mobile background - vertical crop showing face */}
        <div className="absolute inset-0 md:hidden bg-cover bg-no-repeat" style={{
          backgroundImage: `url(${heroBannerMobile})`,
          backgroundPosition: 'center top'
        }} />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Text content - customize as needed */}
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {t('landing.hero.mainTitle')}
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            {t('landing.hero.mainSubtitle')}
          </p>
          <Button onClick={handleStart} size="lg" className="btn-gold animate-glow-pulse text-lg px-10 py-6 rounded-xl">
            {t('common.getStarted')}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative pt-32 pb-28 lg:pt-44 lg:pb-36 overflow-hidden bg-gradient-to-br from-[hsl(250,60%,88%)] via-[hsl(260,55%,85%)] to-[hsl(270,50%,88%)]">
        {/* Subtle background accents */}
        <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 w-64 sm:w-96 h-64 sm:h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-64 sm:w-[500px] h-64 sm:h-[500px] bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16">
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-16 items-center">
            {/* Left content - shifted left with refined typography */}
            <div className="text-center lg:text-left">
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm mb-8">
                  <BrandLogoMark size="sm" />
                <span className="text-foreground font-medium">{t('landing.hero.aiPowered')}</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-8 leading-[1.15]">
                {t('landing.hero.createStunning')}
              </h1>
              
              <p className="text-lg lg:text-xl text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {t('landing.hero.perfectFor')}
              </p>

              <Button onClick={handleStart} size="lg" className="btn-gold animate-glow-pulse text-base px-8 py-6 rounded-xl">
                {t('common.getStarted')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Right content - Stacked Transformation Examples */}
            <div className="relative flex flex-col gap-8 sm:gap-14 items-center w-full overflow-hidden pb-6">
              {/* Transformation Example 1 */}
              <div className="flex flex-row gap-2 sm:gap-5 md:gap-8 items-center justify-center w-full max-w-full">
                {/* Product Image */}
                <div className="relative flex-shrink-0">
                  <div className="relative w-[100px] sm:w-[150px] md:w-[200px] lg:w-[240px] aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden bg-white border-2 border-slate-300 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.15)]">
                    <img alt="Product photo" className="w-full h-full object-cover" src="/lovable-uploads/0a8bd301-eb61-4dc4-ae1f-d010546646eb.png" />
                  </div>
                  <div className="absolute -bottom-3 sm:-bottom-4 left-1/2 -translate-x-1/2 px-2 sm:px-5 py-1 sm:py-2 rounded-full bg-white border border-slate-300 text-[10px] sm:text-sm font-medium text-muted-foreground whitespace-nowrap shadow-md">
                    {t('landing.productPhoto')}
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex flex-col items-center gap-1 sm:gap-3 px-1 sm:px-2 flex-shrink-0">
                  <div className="w-8 h-8 sm:w-14 sm:h-14 rounded-full bg-white/80 flex items-center justify-center border border-primary/30 shadow-md">
                    <Wand2 className="w-4 h-4 sm:w-7 sm:h-7 text-primary" />
                  </div>
                  <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
                </div>

                {/* Model Image */}
                <div className="relative flex-shrink-0">
                  <div className="relative w-[100px] sm:w-[150px] md:w-[200px] lg:w-[240px] aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden bg-white border-2 border-primary/50 shadow-[0_8px_30px_-8px_rgba(139,92,246,0.25)]">
                    <img alt="AI generated model" className="w-full h-full object-cover" src="/lovable-uploads/5212774f-8c09-42bf-b019-8f7f544f3c3b.png" />
                  </div>
                  <div className="absolute -bottom-3 sm:-bottom-4 left-1/2 -translate-x-1/2 px-2 sm:px-5 py-1 sm:py-2 rounded-full bg-primary text-[10px] sm:text-sm font-medium text-primary-foreground whitespace-nowrap shadow-md">
                    {t('landing.aiModel')}
                  </div>
                </div>
              </div>

              {/* Transformation Example 2 */}
              <div className="flex flex-row gap-2 sm:gap-5 md:gap-8 items-center justify-center w-full max-w-full">
                {/* Product Image */}
                <div className="relative flex-shrink-0">
                  <div className="relative w-[100px] sm:w-[150px] md:w-[200px] lg:w-[240px] aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden bg-white border-2 border-slate-300 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.15)]">
                    <img alt="Product photo" className="w-full h-full object-cover" src={exampleProductSweater} />
                  </div>
                  <div className="absolute -bottom-3 sm:-bottom-4 left-1/2 -translate-x-1/2 px-2 sm:px-5 py-1 sm:py-2 rounded-full bg-white border border-slate-300 text-[10px] sm:text-sm font-medium text-muted-foreground whitespace-nowrap shadow-md">
                    {t('landing.productPhoto')}
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex flex-col items-center gap-1 sm:gap-3 px-1 sm:px-2 flex-shrink-0">
                  <div className="w-8 h-8 sm:w-14 sm:h-14 rounded-full bg-white/80 flex items-center justify-center border border-primary/30 shadow-md">
                    <Wand2 className="w-4 h-4 sm:w-7 sm:h-7 text-primary" />
                  </div>
                  <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
                </div>

                {/* Model Image */}
                <div className="relative flex-shrink-0">
                  <div className="relative w-[100px] sm:w-[150px] md:w-[200px] lg:w-[240px] aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden bg-white border-2 border-primary/50 shadow-[0_8px_30px_-8px_rgba(139,92,246,0.25)]">
                    <img alt="AI generated model" className="w-full h-full object-cover" src={exampleModelSweater} />
                  </div>
                  <div className="absolute -bottom-3 sm:-bottom-4 left-1/2 -translate-x-1/2 px-2 sm:px-5 py-1 sm:py-2 rounded-full bg-primary text-[10px] sm:text-sm font-medium text-primary-foreground whitespace-nowrap shadow-md">
                    {t('landing.aiModel')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 my-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-foreground">90%</p>
              <p className="text-sm text-muted-foreground mt-1">{t('landing.stats.costReduction')}</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-foreground">10x</p>
              <p className="text-sm text-muted-foreground mt-1">{t('landing.stats.fasterToMarket')}</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-foreground">10%+</p>
              <p className="text-sm text-muted-foreground mt-1">{t('landing.stats.conversionBoost')}</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-foreground">∞</p>
              <p className="text-sm text-muted-foreground mt-1">{t('landing.stats.modelDiversity')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-32 lg:py-40 relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
        backgroundSize: '32px 32px'
      }} />
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
              {t('landing.howItWorks.title')}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">{t('landing.howItWorks.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 - Transform */}
            <div className="relative group">
              <div className="absolute -left-2 -top-2 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-lg font-semibold text-primary-foreground z-10 shadow-md">
                1
              </div>
              <div className="bg-white border-2 border-slate-400/60 rounded-2xl h-full transition-all duration-200 ease-out hover:bg-slate-50 hover:border-slate-600 hover:-translate-y-1 min-h-[320px] flex flex-col shadow-[0_2px_12px_-2px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.18)]">
                <div className="flex-1 flex items-center justify-center p-8 pt-12">
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Wand2 className="w-12 h-12 md:w-14 md:h-14 text-primary" />
                  </div>
                </div>
                <div className="p-6 pt-0 text-center">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{t('landing.howItWorks.transform')}</h3>
                  <p className="text-slate-600 text-sm">{t('landing.howItWorks.transformDesc')}</p>
                </div>
              </div>
            </div>

            {/* Step 2 - Upload */}
            <div className="relative group">
              <div className="absolute -left-2 -top-2 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-lg font-semibold text-primary-foreground z-10 shadow-md">
                2
              </div>
              <div className="bg-white border-2 border-slate-400/60 rounded-2xl h-full transition-all duration-200 ease-out hover:bg-slate-50 hover:border-slate-600 hover:-translate-y-1 min-h-[320px] flex flex-col shadow-[0_2px_12px_-2px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.18)]">
                <div className="flex-1 flex items-center justify-center p-8 pt-12">
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Upload className="w-12 h-12 md:w-14 md:h-14 text-primary" />
                  </div>
                </div>
                <div className="p-6 pt-0 text-center">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{t('landing.howItWorks.upload')}</h3>
                  <p className="text-slate-600 text-sm">{t('landing.howItWorks.uploadProductPhotos')}</p>
                </div>
              </div>
            </div>

            {/* Step 3 - Download */}
            <div className="relative group">
              <div className="absolute -left-2 -top-2 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-lg font-semibold text-primary-foreground z-10 shadow-md">
                3
              </div>
              <div className="bg-white border-2 border-slate-400/60 rounded-2xl h-full transition-all duration-200 ease-out hover:bg-slate-50 hover:border-slate-600 hover:-translate-y-1 min-h-[320px] flex flex-col shadow-[0_2px_12px_-2px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.18)]">
                <div className="flex-1 flex items-center justify-center p-8 pt-12">
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Download className="w-12 h-12 md:w-14 md:h-14 text-primary" />
                  </div>
                </div>
                <div className="p-6 pt-0 text-center">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{t('landing.howItWorks.download')}</h3>
                  <p className="text-slate-600 text-sm">{t('landing.howItWorks.getStudioQuality')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-14 flex flex-col items-center gap-3">
            <Button onClick={handleStart} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold px-10 py-6 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
              <span className="flex items-center gap-2">
                {t('landing.howItWorks.startForFree')}
                <ArrowRight className="h-5 w-5" />
              </span>
            </Button>
            <span className="text-sm text-slate-500">{t('landing.howItWorks.noCreditCard')}</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 lg:py-40 relative">
        {/* Background image container - works on all devices including mobile */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat md:bg-fixed" style={{
        backgroundImage: `url(${aiSolutionsBg})`
      }} />
        <div className="absolute inset-0 bg-black/60" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('landing.features.aiSolutions')}
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              {t('landing.features.aiSolutionsSubtitle')}
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
                <h3 className="text-lg font-semibold text-white mb-2">{t('landing.features.instantGeneration')}</h3>
                <p className="text-sm text-white/80">
                  {t('landing.features.instantGenerationCard')}
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
                <h3 className="text-lg font-semibold text-white mb-2">{t('landing.features.diversePortfolio')}</h3>
                <p className="text-sm text-white/80">
                  {t('landing.features.diversePortfolioDesc')}
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
                <h3 className="text-lg font-semibold text-white mb-2">{t('landing.features.studioQuality')}</h3>
                <p className="text-sm text-white/80">
                  {t('landing.features.studioQualityCard')}
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
                <h3 className="text-lg font-semibold text-white mb-2">{t('landing.features.multiAngle')}</h3>
                <p className="text-sm text-white/80">
                  {t('landing.features.multiAngleCard')}
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
                <h3 className="text-lg font-semibold text-white mb-2">{t('landing.features.fullRights')}</h3>
                <p className="text-sm text-white/80">
                  {t('landing.features.fullRightsCard')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mt-24 py-32 lg:py-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
        backgroundImage: `url(${ctaBackground})`
      }} />
        <div className="absolute inset-0 bg-background/70" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            {t('landing.cta.title')}
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            {t('landing.cta.joinThousands')}
          </p>
          <Button onClick={handleStart} size="lg" className="btn-gold animate-glow-pulse text-lg px-10 py-6 rounded-xl">
            {t('landing.cta.startCreating')}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>;
}