import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Clock, Trash2, Download, Plus, Pencil, Check, X, Crown, Zap, Shield, Save, User, Loader2, Menu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, addHours } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useSavedModels, SavedModel } from '@/hooks/useSavedModels';
import { useModelConfig, ModelConfig } from '@/context/ModelConfigContext';
import { SaveModelDialog } from '@/components/SaveModelDialog';
import { BrandLogo, BrandLogoMark } from '@/components/BrandLogo';
import { downloadImage } from '@/lib/downloadImage';

type Category = 'Bottomwear' | 'Topwear' | 'Shoes' | 'Dresses';

interface GeneratedImage {
  id: string;
  image_url: string | null;
  created_at: string;
  gender: string;
  ethnicity: string;
  status: string;
  category: Category | null;
  custom_name: string | null;
  // Additional fields for saving model
  skin_tone: string;
  hair_color: string;
  hair_type: string;
  eye_color: string;
  body_type: string;
  beard_type: string | null;
  pose: string | null;
  background: string | null;
}

const CATEGORIES: Category[] = ['Topwear', 'Bottomwear', 'Shoes', 'Dresses'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { subscription, loading: subscriptionLoading, refetch: refetchSubscription, hasCreatorFeatureAccess, imageRetentionHours, imageRetentionDays } = useSubscription();
  const { isAdmin } = useAdminCheck();
  const { savedModels, loading: loadingSavedModels, deleteModel, deleting } = useSavedModels();
  const { loadSavedModel } = useModelConfig();
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getPlanDisplayName = (plan: string | undefined) => {
    switch (plan) {
      case 'trial': return 'Deneme';
      case 'starter': return 'Başlangıç';
      case 'pro': return 'Pro';
      case 'creator': return 'Yaratıcı';
      default: return 'Deneme';
    }
  };

  const getPlanBadgeStyles = (plan: string | undefined) => {
    switch (plan) {
      case 'creator':
        return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white';
      case 'pro':
        return 'bg-gradient-to-r from-primary to-purple-500 text-white';
      case 'starter':
        return 'bg-primary/20 text-primary border border-primary/30';
      default:
        return 'bg-muted text-muted-foreground border border-border';
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && !subscriptionLoading) {
      fetchImages();
    }
  }, [user, subscriptionLoading, imageRetentionHours]);

  useEffect(() => {
    if (user) {
      refetchSubscription(); // Always sync credits on mount/navigation
    }
  }, [user, refetchSubscription]);

  const fetchImages = async () => {
    setLoadingImages(true);
    
    // Creator users get 7 days retention, others get 24 hours
    const retentionMs = imageRetentionHours * 60 * 60 * 1000;
    const cutoffTime = new Date(Date.now() - retentionMs).toISOString();
    
    const { data, error } = await supabase
      .from('model_generations')
      .select('id, image_url, created_at, gender, ethnicity, status, category, custom_name, skin_tone, hair_color, hair_type, eye_color, body_type, beard_type, pose, background')
      .eq('user_id', user!.id)
      .gte('created_at', cutoffTime)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Görseller yüklenirken hata oluştu',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setImages((data as GeneratedImage[]) || []);
    }
    setLoadingImages(false);
  };

  const getTimeRemaining = (createdAt: string) => {
    const expiryTime = addHours(new Date(createdAt), imageRetentionHours);
    const now = new Date();
    const msLeft = expiryTime.getTime() - now.getTime();
    
    if (msLeft <= 0) return 'Süresi doldu';
    
    const daysLeft = Math.floor(msLeft / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutesLeft = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    // For Creator users (7 days), show days
    if (imageRetentionHours > 24) {
      if (daysLeft > 0) {
        return `${daysLeft}g ${hoursLeft}s kaldı`;
      }
      if (hoursLeft > 0) {
        return `${hoursLeft}s ${minutesLeft}dk kaldı`;
      }
      return `${minutesLeft}dk kaldı`;
    }
    
    // For 24-hour retention
    if (hoursLeft < 1) return `${minutesLeft}dk kaldı`;
    return `${hoursLeft}s ${minutesLeft}dk kaldı`;
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('model_generations')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Görsel silinirken hata oluştu',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setImages(images.filter(img => img.id !== id));
      toast({
        title: 'Görsel silindi',
        description: 'Görsel galerinizden kaldırıldı.',
      });
    }
  };

  const handleDownload = async (imageUrl: string, customName: string | null, id: string) => {
    const fileName = customName ? customName.replace(/\s+/g, '-').toLowerCase() : `utsuri-model-${id}`;
    const success = await downloadImage(imageUrl, `${fileName}.png`);
    if (success) {
      toast({ title: 'İndirme başladı', description: `${fileName}.png indiriliyor` });
    } else {
      toast({ title: 'Görsel açılıyor', description: 'Görsel yeni sekmede açıldı. İndirmek için sağ tıklayıp "Farklı Kaydet" seçeneğini kullanın.' });
    }
  };

  const handleCategoryChange = async (id: string, category: Category) => {
    const { error } = await supabase
      .from('model_generations')
      .update({ category })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Kategori güncellenirken hata oluştu',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setImages(images.map(img => img.id === id ? { ...img, category } : img));
      toast({ title: 'Kategori güncellendi' });
    }
  };

  const handleNameEdit = (id: string, currentName: string | null) => {
    setEditingId(id);
    setEditName(currentName || '');
  };

  const handleNameSave = async (id: string) => {
    const { error } = await supabase
      .from('model_generations')
      .update({ custom_name: editName || null })
      .eq('id', id);

    if (error) {
      toast({
        title: 'İsim güncellenirken hata oluştu',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setImages(images.map(img => img.id === id ? { ...img, custom_name: editName || null } : img));
      setEditingId(null);
      toast({ title: 'İsim güncellendi' });
    }
  };

  // handleSignOut moved to ProfileDropdown component

  const displayName = profile?.first_name || user?.email?.split('@')[0] || 'there';

  const filteredImages = activeCategory === 'All' 
    ? images 
    : images.filter(img => img.category === activeCategory);

  const getCategoryCount = (category: Category | 'All') => {
    if (category === 'All') return images.length;
    return images.filter(img => img.category === category).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <BrandLogo size="lg" withText={false} />
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Yükleniyor…</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden max-w-full">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 xl:py-6 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="hidden xl:block">
              <BrandLogo size="xl" withText text="Utsuri" />
            </div>
            <div className="xl:hidden">
              <BrandLogo size="lg" withText text="Utsuri" />
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {isAdmin && (
              <Button
                variant="outline"
                onClick={() => navigate('/admin')}
                className="border-primary/50 text-primary hover:bg-primary/10"
              >
                <Shield className="h-4 w-4 mr-2" />
                Admin
              </Button>
            )}
            <Button
              onClick={() => navigate('/filter/gender')}
              className="btn-gold"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('dashboard.newModel')}
            </Button>
            <LanguageSwitcher />
            <ProfileDropdown />
          </div>

          {/* Mobile Hamburger Menu */}
          <div className="md:hidden flex items-center gap-2">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Menüyü aç</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <BrandLogo size="md" withText text="Utsuri" />
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-8">
                  {/* User Info */}
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>

                  {/* Plan Badge */}
                  {!subscriptionLoading && subscription && (
                    <div className="p-3 bg-card border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPlanBadgeStyles(subscription.plan)}`}>
                          {subscription.plan === 'creator' && <Crown className="h-3 w-3 inline mr-1" />}
                          {getPlanDisplayName(subscription.plan)}
                        </span>
                      </div>
                      {subscription.plan === 'trial' ? (
                        <p className="text-xs text-muted-foreground">
                          Standart: {subscription.standard_generations_remaining} | Pro: {subscription.pro_generations_remaining}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Kredi: {subscription.credits_remaining}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Navigation Links */}
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => {
                        navigate('/filter/gender');
                        setMobileMenuOpen(false);
                      }}
                      className="btn-gold w-full justify-start"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t('dashboard.newModel')}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate('/templates');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full justify-start"
                    >
                      Şablonlar
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate('/pricing');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full justify-start"
                    >
                      Fiyatlandırma
                    </Button>

                    {isAdmin && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigate('/admin');
                          setMobileMenuOpen(false);
                        }}
                        className="w-full justify-start border-primary/50 text-primary"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Admin Paneli
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate('/account-settings');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full justify-start"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Hesap Ayarları
                    </Button>
                  </div>

                  {/* Language Switcher */}
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Dil</p>
                    <LanguageSwitcher />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome + Plan Section */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Tekrar hoş geldin, <span className="text-primary">{displayName}</span>!
            </h1>
            <p className="text-muted-foreground">
              Oluşturulan görselleriniz {imageRetentionDays === 7 ? '7 gün' : '24 saat'} saklanır. Süresi dolmadan indirin.
              {hasCreatorFeatureAccess && (
                <span className="ml-2 inline-flex items-center gap-1 text-amber-500 font-medium">
                  <Crown className="h-3.5 w-3.5" />
                  Uzun süreli depolama
                </span>
              )}
            </p>
          </div>

          {/* Plan Card */}
          {!subscriptionLoading && subscription && (
            <div className="flex-shrink-0 bg-card border border-border rounded-xl p-4 min-w-[200px]">
              <div className="flex items-center gap-3 mb-3">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${getPlanBadgeStyles(subscription.plan)}`}>
                  {subscription.plan === 'creator' && <Crown className="h-3.5 w-3.5" />}
                  {subscription.plan === 'pro' && <BrandLogoMark size="sm" className="brightness-0 invert" />}
                  {getPlanDisplayName(subscription.plan)}
                </div>
              </div>
              
              <div className="space-y-2">
                {subscription.plan === 'trial' ? (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Standart Üretim</span>
                      <span className="font-medium text-foreground flex items-center gap-1">
                        <Zap className="h-3.5 w-3.5 text-primary" />
                        {subscription.standard_generations_remaining}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Pro Üretim</span>
                      <span className="font-medium text-foreground">{subscription.pro_generations_remaining}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Kredi</span>
                    <span className="font-medium text-foreground flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5 text-primary" />
                      {subscription.credits_remaining}
                    </span>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/pricing')}
                className="w-full mt-3 text-xs"
              >
                {subscription.plan === 'trial' ? 'Planı Yükselt' : 'Planı Yönet'}
              </Button>
            </div>
          )}
        </div>

        {/* Saved Models Section - Creator Only */}
        {hasCreatorFeatureAccess && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Save className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Kayıtlı Modeller</h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 text-xs font-medium">Yaratıcı</span>
              </div>
            </div>
            
            {loadingSavedModels ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
             ) : savedModels.length === 0 ? (
              <div className="text-center py-8 bg-card border border-border rounded-xl">
                 <BrandLogoMark size="lg" className="mx-auto mb-3 opacity-80" />
                <p className="text-muted-foreground text-sm mb-3">Henüz kayıtlı model yok</p>
                <p className="text-muted-foreground/70 text-xs max-w-md mx-auto">
                  Model yapılandırması oluşturun ve daha sonra tekrar kullanmak için Kıyafet Seçimi sayfasından kaydedin.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {savedModels.map((model) => (
                  <div
                    key={model.id}
                    className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium text-foreground truncate flex-1">{model.name}</h3>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteModel(model.id)}
                        disabled={deleting === model.id}
                        className="h-7 w-7 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 -mr-2 -mt-1"
                      >
                        {deleting === model.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-1 text-xs mb-4">
                      <span className="text-muted-foreground">Cinsiyet:</span>
                      <span className="text-foreground capitalize">{model.gender === 'male' ? 'Erkek' : 'Kadın'}</span>
                      <span className="text-muted-foreground">Etnik Köken:</span>
                      <span className="text-foreground capitalize">{model.ethnicity}</span>
                      <span className="text-muted-foreground">Vücut:</span>
                      <span className="text-foreground capitalize">{model.body_type}</span>
                      {model.hair_color && (
                        <>
                          <span className="text-muted-foreground">Saç:</span>
                          <span className="text-foreground capitalize">{model.hair_color}</span>
                        </>
                      )}
                    </div>
                    
                    <Button
                      size="sm"
                      className="w-full btn-gold"
                      onClick={() => {
                        loadSavedModel({
                          gender: model.gender as 'male' | 'female',
                          ethnicity: model.ethnicity,
                          skinTone: model.skin_tone,
                          bodyType: model.body_type,
                          hairColor: model.hair_color || undefined,
                          hairType: model.hair_type || undefined,
                          eyeColor: model.eye_color,
                          beardType: model.beard_type || undefined,
                          modestOption: model.modest_option as 'standard' | 'hijab' | undefined,
                          pose: model.pose || undefined,
                          background: model.background || undefined,
                          faceType: model.face_type || undefined,
                          facialExpression: model.facial_expression || undefined,
                        });
                        navigate('/clothing');
                      }}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Modeli Kullan
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={activeCategory === 'All' ? 'default' : 'outline'}
            onClick={() => setActiveCategory('All')}
            className={activeCategory === 'All' ? 'btn-gold' : ''}
          >
            Tümü ({getCategoryCount('All')})
          </Button>
          {CATEGORIES.map(cat => {
            const categoryLabels: Record<Category, string> = {
              'Topwear': 'Üst Giyim',
              'Bottomwear': 'Alt Giyim',
              'Shoes': 'Ayakkabı',
              'Dresses': 'Elbise'
            };
            return (
              <Button
                key={cat}
                variant={activeCategory === cat ? 'default' : 'outline'}
                onClick={() => setActiveCategory(cat)}
                className={activeCategory === cat ? 'btn-gold' : ''}
              >
                {categoryLabels[cat]} ({getCategoryCount(cat)})
              </Button>
            );
          })}
        </div>

        {loadingImages ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <BrandLogoMark size="lg" className="opacity-90" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              {activeCategory === 'All' ? 'Henüz görsel yok' : `Henüz ${activeCategory === 'Topwear' ? 'Üst Giyim' : activeCategory === 'Bottomwear' ? 'Alt Giyim' : activeCategory === 'Shoes' ? 'Ayakkabı' : 'Elbise'} görseli yok`}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              {activeCategory === 'All' 
                ? 'Ürünleriniz için yapay zeka destekli moda modelleri oluşturmaya başlayın. Görselleriniz burada görünecek.'
                : `Henüz bu kategoride görsel oluşturmadınız.`}
            </p>
            {activeCategory === 'All' && (
              <Button onClick={() => navigate('/filter/gender')} className="btn-gold">
                İlk Modelinizi Oluşturun
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="group relative rounded-2xl overflow-hidden border border-border bg-card transition-all duration-300 hover:shadow-xl hover:border-primary/30"
              >
                {image.image_url ? (
                  <img
                    src={image.image_url}
                    alt={image.custom_name || `Generated ${image.gender} ${image.ethnicity} model`}
                    className="w-full aspect-[3/4] object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[3/4] bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground capitalize">{image.status}</span>
                  </div>
                )}
                
                {/* Image info overlay - always visible at bottom */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 pt-12">
                  {/* Custom Name */}
                  <div className="mb-3">
                    {editingId === image.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Özel isim girin..."
                          className="h-8 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/50"
                          autoFocus
                        />
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-green-400 hover:text-green-300 hover:bg-green-400/20"
                          onClick={() => handleNameSave(image.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/20"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div 
                        className="flex items-center gap-2 cursor-pointer group/name"
                        onClick={() => handleNameEdit(image.id, image.custom_name)}
                      >
                        <span className="text-white font-medium truncate">
                          {image.custom_name || 'İsimsiz'}
                        </span>
                        <Pencil className="h-3.5 w-3.5 text-white/50 opacity-0 group-hover/name:opacity-100 transition-opacity" />
                      </div>
                    )}
                  </div>

                  {/* Category Select */}
                  <div className="mb-3">
                    <Select
                      value={image.category || ''}
                      onValueChange={(value) => handleCategoryChange(image.id, value as Category)}
                    >
                      <SelectTrigger className="h-8 text-xs bg-white/10 border-white/20 text-white w-full">
                        <SelectValue placeholder="Kategori seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => {
                          const categoryLabels: Record<Category, string> = {
                            'Topwear': 'Üst Giyim',
                            'Bottomwear': 'Alt Giyim',
                            'Shoes': 'Ayakkabı',
                            'Dresses': 'Elbise'
                          };
                          return (
                            <SelectItem key={cat} value={cat}>{categoryLabels[cat]}</SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Time remaining and actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-white/80 text-xs">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{getTimeRemaining(image.created_at)}</span>
                    </div>
                    <div className="flex gap-1.5">
                      {/* Save Model Button - Creator Only */}
                      {hasCreatorFeatureAccess && image.image_url && (
                        <SaveModelDialog
                          config={{
                            gender: image.gender as 'male' | 'female',
                            ethnicity: image.ethnicity,
                            skinTone: image.skin_tone,
                            hairColor: image.hair_color,
                            hairType: image.hair_type,
                            eyeColor: image.eye_color,
                            bodyType: image.body_type,
                            beardType: image.beard_type || undefined,
                            pose: image.pose || undefined,
                            background: image.background || undefined,
                          } as ModelConfig}
                          trigger={
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-amber-400 hover:text-amber-300 hover:bg-amber-400/20"
                              title="Model yapılandırmasını kaydet"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                          }
                        />
                      )}
                      {image.image_url && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDownload(image.image_url!, image.custom_name, image.id)}
                          className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(image.id)}
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Time badge - always visible at top */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm text-xs">
                  <Clock className="h-3 w-3 text-primary" />
                  <span className="text-foreground">{getTimeRemaining(image.created_at)}</span>
                </div>

                {/* Category badge if set */}
                {image.category && (
                  <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-primary/90 backdrop-blur-sm text-xs text-primary-foreground font-medium">
                    {image.category === 'Topwear' ? 'Üst Giyim' : image.category === 'Bottomwear' ? 'Alt Giyim' : image.category === 'Shoes' ? 'Ayakkabı' : 'Elbise'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Legal Links */}
        <div className="mt-12 pt-8 border-t border-border flex flex-wrap items-center justify-center gap-6 text-sm">
          <a href="/legal/privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors">Gizlilik Politikası</a>
          <a href="/legal/terms-of-use" className="text-muted-foreground hover:text-foreground transition-colors">Kullanım Koşulları</a>
          <a href="/legal/membership-agreement" className="text-muted-foreground hover:text-foreground transition-colors">Üyelik Sözleşmesi</a>
        </div>
      </main>
    </div>
  );
}
