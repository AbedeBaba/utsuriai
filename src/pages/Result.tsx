import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useModelConfig } from '@/context/ModelConfigContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Download, RefreshCw, Loader2, ImageIcon, LayoutDashboard, Crown, ShoppingCart, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { BrandLogo, BrandLogoMark } from '@/components/BrandLogo';
import { AIDisclaimer } from '@/components/AIDisclaimer';
import { downloadImage } from '@/lib/downloadImage';

interface GenerationData {
  id: string;
  status: string;
  image_url: string | null;
  gender: string;
  ethnicity: string;
  skin_tone: string;
  hair_color: string;
  eye_color: string;
  body_type: string;
  hair_type: string;
  beard_type: string | null;
  clothing_top: string | null;
  clothing_bottom: string | null;
  shoes: string | null;
  pose: string | null;
  background: string | null;
  reference_image: string | null;
  face_type: string | null;
  facial_expression: string | null;
  modest_option: string | null;
}


export default function Result() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isProMode = searchParams.get('pro') === 'true';
  const navigate = useNavigate();
  const { user } = useAuth();
  const { resetConfig } = useModelConfig();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  
  const [generation, setGeneration] = useState<GenerationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [customName, setCustomName] = useState('');
  const [nameSaved, setNameSaved] = useState(false);
  const generationInProgressRef = useRef(false); // Prevent duplicate API calls

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchGeneration();
  }, [id, user]);

  const fetchGeneration = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('model_generations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setGeneration(data);

      // If pending, trigger generation (only once)
      if (data.status === 'pending' && !generationInProgressRef.current) {
        generationInProgressRef.current = true;
        generateImage(data, isProMode);
      }
    } catch (error) {
      console.error('Error fetching generation:', error);
      toast({
        title: 'Hata',
        description: 'Oluşturma verileri yüklenemedi.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const pollForResult = async (taskId: string, generationId: string, usePro: boolean) => {
    const maxPolls = 60; // 60 polls * 5s = 5 minutes max
    for (let i = 0; i < maxPolls; i++) {
      await new Promise(r => setTimeout(r, 5000));
      try {
        const { data: checkResult, error: checkError } = await supabase.functions.invoke('check-generation', {
          body: { taskId, generationId },
        });
        if (checkError) continue;
        
        if (checkResult?.status === 'completed' && checkResult?.imageUrl) {
          return checkResult.imageUrl;
        }
        if (checkResult?.status === 'failed') {
          throw new Error(checkResult?.error || 'Generation failed');
        }
        // Still processing, continue polling
      } catch (err) {
        if (i === maxPolls - 1) throw err;
      }
    }
    throw new Error('Generation timed out');
  };

  const generateImage = async (data: GenerationData, usePro: boolean = false) => {
    // Prevent duplicate calls
    if (generating) {
      console.log('Generation already in progress, blocking duplicate call');
      return;
    }
    
    setGenerating(true);

    try {
      // Call edge function to generate image
      const { data: result, error } = await supabase.functions.invoke('generate-model', {
        body: {
          generationId: data.id,
          userId: user?.id,
          config: {
            gender: data.gender,
            ethnicity: data.ethnicity,
            skinTone: data.skin_tone,
            hairColor: data.hair_color,
            eyeColor: data.eye_color,
            bodyType: data.body_type,
            hairType: data.hair_type,
            beardType: data.beard_type,
            clothingTop: data.clothing_top,
            clothingBottom: data.clothing_bottom,
            shoes: data.shoes,
            pose: data.pose,
            background: data.background,
            faceType: data.face_type,
            facialExpression: data.facial_expression,
            modestOption: data.modest_option,
          },
          referenceImage: data.reference_image,
          usePro: usePro,
        },
      });

      if (error) throw error;

      let imageUrl = result.imageUrl;

      // If still processing (Pro mode), poll for result
      if (result.status === 'processing' && result.taskId) {
        console.log('Pro generation still processing, polling for result...');
        imageUrl = await pollForResult(result.taskId, data.id, usePro);
      }

      // Update local state
      setGeneration(prev => prev ? { ...prev, status: 'completed', image_url: imageUrl } : null);
      
      // Auto-assign default name if none set
      const defaultName = `${t('naming.default')} ${new Date().toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}`;
      setCustomName(defaultName);
      await supabase
        .from('model_generations')
        .update({ custom_name: defaultName })
        .eq('id', data.id);

      toast({
        title: 'Başarılı!',
        description: usePro 
          ? 'Utsuri Pro moda modeliniz oluşturuldu.' 
          : 'Moda modeliniz oluşturuldu.',
      });
    } catch (error) {
      console.error('Error generating image:', error);
      setGeneration(prev => prev ? { ...prev, status: 'failed' } : null);
      toast({
        title: 'Oluşturma başarısız',
        description: error instanceof Error ? error.message : 'AI görsel oluşturma başarısız oldu. Lütfen tekrar deneyin.',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
      generationInProgressRef.current = false;
    }
  };

  const handleRegenerate = () => {
    if (generation && !generating && !generationInProgressRef.current) {
      generationInProgressRef.current = true;
      generateImage(generation, isProMode);
    }
  };

  const handleDownload = async () => {
    if (!generation?.image_url) return;
    const fileName = `fashion-model-${generation.id}.png`;
    const success = await downloadImage(generation.image_url, fileName);
    if (success) {
      toast({ title: 'İndirme başladı', description: 'Görseliniz indiriliyor.' });
    } else {
      toast({ title: 'Görsel açılıyor', description: 'Görsel yeni sekmede açıldı. Kaydetmek için sağ tıklayın.' });
    }
  };

  const handleCreateNew = () => {
    resetConfig();
    navigate('/filter/gender');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden max-w-full">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 w-full">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 xl:py-6">
          <Button 
            variant="ghost" 
            onClick={handleCreateNew}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            {t('result.newModel')}
          </Button>
          
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="hidden xl:block">
              <BrandLogo size="xl" withText text="Utsuri" />
            </div>
            <div className="xl:hidden">
              <BrandLogo size="lg" withText text="Utsuri" />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="hidden sm:flex items-center gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              {t('common.dashboard')}
            </Button>
            <LanguageSwitcher />
            <ProfileDropdown />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="w-full max-w-2xl animate-fade-in">
          {/* Image Display */}
          <div className="relative aspect-[9/16] bg-card rounded-2xl border overflow-hidden mb-8 shadow-lg">
            {/* Pro Badge */}
            {isProMode && (
              <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold shadow-lg">
                <Crown className="h-4 w-4" />
                Utsuri Pro
              </div>
            )}
            {generating ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">
                  {isProMode ? 'Utsuri Pro ile oluşturuluyor...' : t('result.generating')}
                </p>
              </div>
            ) : generation?.image_url ? (
              <img 
                src={generation.image_url} 
                alt="Oluşturulan moda modeli" 
                className="w-full h-full object-contain bg-muted/10"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-muted-foreground">
                <ImageIcon className="h-16 w-16" />
                <p>{t('result.pending')}</p>
                <p className="text-sm text-center px-8">
                  AI entegrasyonu hazır ancak henüz aktif değil. 
                  Yapılandırmanız kaydedildi.
                </p>
              </div>
            )}
          </div>

          {/* Selected Filters - Matching ClothingSelection design */}
          {generation && (
            <div className="bg-card border border-border rounded-xl p-4 mb-8">
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <BrandLogoMark size="sm" />
                Seçilen Filtreler
                {isProMode && (
                  <span className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-500 text-xs font-medium border border-amber-500/30">
                    <Crown className="h-3 w-3" />
                    Pro Kalite
                  </span>
                )}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {generation.gender && (
                  <div className="flex justify-between text-sm py-1.5 px-2 rounded-lg bg-secondary/50">
                    <span className="text-muted-foreground">Cinsiyet</span>
                    <span className="font-medium text-foreground">{generation.gender}</span>
                  </div>
                )}
                {generation.ethnicity && (
                  <div className="flex justify-between text-sm py-1.5 px-2 rounded-lg bg-secondary/50">
                    <span className="text-muted-foreground">Etnik Köken</span>
                    <span className="font-medium text-foreground">{generation.ethnicity}</span>
                  </div>
                )}
                {generation.skin_tone && (
                  <div className="flex justify-between text-sm py-1.5 px-2 rounded-lg bg-secondary/50">
                    <span className="text-muted-foreground">Ten Rengi</span>
                    <span className="font-medium text-foreground">{generation.skin_tone}</span>
                  </div>
                )}
                {generation.hair_color && (
                  <div className="flex justify-between text-sm py-1.5 px-2 rounded-lg bg-secondary/50">
                    <span className="text-muted-foreground">Saç Rengi</span>
                    <span className="font-medium text-foreground">{generation.hair_color}</span>
                  </div>
                )}
                {generation.eye_color && (
                  <div className="flex justify-between text-sm py-1.5 px-2 rounded-lg bg-secondary/50">
                    <span className="text-muted-foreground">Göz Rengi</span>
                    <span className="font-medium text-foreground">{generation.eye_color}</span>
                  </div>
                )}
                {generation.body_type && (
                  <div className="flex justify-between text-sm py-1.5 px-2 rounded-lg bg-secondary/50">
                    <span className="text-muted-foreground">Vücut Tipi</span>
                    <span className="font-medium text-foreground">{generation.body_type}</span>
                  </div>
                )}
                {generation.hair_type && (
                  <div className="flex justify-between text-sm py-1.5 px-2 rounded-lg bg-secondary/50">
                    <span className="text-muted-foreground">Saç Tipi</span>
                    <span className="font-medium text-foreground">{generation.hair_type}</span>
                  </div>
                )}
                {generation.beard_type && (
                  <div className="flex justify-between text-sm py-1.5 px-2 rounded-lg bg-secondary/50">
                    <span className="text-muted-foreground">Sakal Tipi</span>
                    <span className="font-medium text-foreground">{generation.beard_type}</span>
                  </div>
                )}
                {generation.pose && (
                  <div className="flex justify-between text-sm py-1.5 px-2 rounded-lg bg-secondary/50">
                    <span className="text-muted-foreground">Poz</span>
                    <span className="font-medium text-foreground">{generation.pose}</span>
                  </div>
                )}
                {generation.background && (
                  <div className="flex justify-between text-sm py-1.5 px-2 rounded-lg bg-secondary/50">
                    <span className="text-muted-foreground">Arka Plan</span>
                    <span className="font-medium text-foreground">{generation.background}</span>
                  </div>
                )}
                {generation.face_type && (
                  <div className="flex justify-between text-sm py-1.5 px-2 rounded-lg bg-secondary/50">
                    <span className="text-muted-foreground">Yüz Tipi</span>
                    <span className="font-medium text-foreground">{generation.face_type}</span>
                  </div>
                )}
                {generation.facial_expression && (
                  <div className="flex justify-between text-sm py-1.5 px-2 rounded-lg bg-secondary/50">
                    <span className="text-muted-foreground">İfade</span>
                    <span className="font-medium text-foreground">{generation.facial_expression}</span>
                  </div>
                )}
                {generation.modest_option && (
                  <div className="flex justify-between text-sm py-1.5 px-2 rounded-lg bg-secondary/50">
                    <span className="text-muted-foreground">Örtünme</span>
                    <span className="font-medium text-foreground">{generation.modest_option}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Image Naming */}
          {generation?.image_url && !generating && (
            <div className="mb-6 p-4 bg-card border border-border rounded-xl">
              <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
                <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                {t('naming.title')}
              </label>
              <div className="flex gap-2">
                <Input
                  value={customName}
                  onChange={(e) => {
                    setCustomName(e.target.value);
                    setNameSaved(false);
                  }}
                  placeholder={t('naming.placeholder')}
                  maxLength={100}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  variant={nameSaved ? "outline" : "default"}
                  disabled={nameSaved}
                  onClick={async () => {
                    if (!generation?.id) return;
                    const nameToSave = customName.trim() || `${t('naming.default')} ${new Date().toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}`;
                    await supabase
                      .from('model_generations')
                      .update({ custom_name: nameToSave })
                      .eq('id', generation.id);
                    setCustomName(nameToSave);
                    setNameSaved(true);
                    toast({ title: t('naming.saved') });
                  }}
                >
                  {nameSaved ? '✓' : language === 'tr' ? 'Değiştir' : 'Change'}
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <AIDisclaimer className="mb-4" />

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={handleRegenerate}
              disabled={generating}
              className="flex-1"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('result.regenerate')}
            </Button>
            
            <Button
              onClick={handleDownload}
              disabled={!generation?.image_url || generating}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Download className="mr-2 h-4 w-4" />
              {t('result.download')}
            </Button>
          </div>

          <Button
            variant="ghost"
            onClick={handleCreateNew}
            className="w-full mt-4 text-muted-foreground"
          >
            {t('result.createAnother')}
          </Button>

          {/* Browse Packages Button */}
          <div className="mt-6 pt-6 border-t border-border">
            <Button
              onClick={() => navigate('/pricing')}
              className="w-full py-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-500/90 hover:to-orange-500/90 text-white font-semibold shadow-lg"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Paketlerimize Göz Atın
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Tüm özelliklere erişmek için planlarımızı inceleyin
            </p>
          </div>
        </div>
      </main>

    </div>
  );
}
