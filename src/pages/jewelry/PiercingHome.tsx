import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { piercingPresets, PiercingPreset } from "@/data/piercingPresets";
import { ArrowLeft, Gem, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "@/hooks/use-toast";

// Import preset images
import bellyImg from "@/assets/jewelry/preset-belly-piercing.jpg";
import earImg from "@/assets/jewelry/preset-ear-piercing.jpg";
import eyebrowImg from "@/assets/jewelry/preset-eyebrow-piercing.jpg";
import lipImg from "@/assets/jewelry/preset-lip-piercing.jpg";
import noseImg from "@/assets/jewelry/preset-nose-piercing.jpg";

const presetImageMap: Record<string, string> = {
  'preset-belly-piercing': bellyImg,
  'preset-ear-piercing': earImg,
  'preset-eyebrow-piercing': eyebrowImg,
  'preset-lip-piercing': lipImg,
  'preset-nose-piercing': noseImg,
};

// Pro plan can only access these preset IDs
const PRO_ACCESSIBLE_PRESETS = ['ear-piercing', 'nose-piercing'];

function PiercingPresetCard({ preset, accessLevel }: { preset: PiercingPreset; accessLevel: 'full' | 'locked' }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const image = presetImageMap[preset.imagePath];
  const isLocked = accessLevel === 'locked';
  
  return (
    <button
      onClick={() => {
        if (isLocked) {
          toast({
            title: t('jewelry.lockedTitle'),
            description: t('jewelry.lockedDesc'),
            action: (
              <button
                onClick={() => navigate('/pricing')}
                className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {t('jewelry.viewPlans')}
              </button>
            ),
          });
          return;
        }
        navigate(`/jewelry/generate/${preset.id}`);
      }}
      className={cn(
        "group relative flex flex-col items-center justify-end p-6 rounded-xl",
        "border border-border/50 shadow-sm overflow-hidden",
        "transition-all duration-300 ease-out",
        "min-h-[280px] w-full",
        isLocked
          ? "opacity-60 cursor-not-allowed"
          : "hover:shadow-lg hover:border-primary/40"
      )}
    >
      {/* Background image */}
      {image && (
        <div className="absolute inset-0 z-0">
          <img 
            src={image} 
            alt={t(preset.nameKey)}
            className={cn(
              "w-full h-full object-cover transition-transform duration-500",
              !isLocked && "group-hover:scale-105"
            )}
          />
          <div className={cn(
            "absolute inset-0 bg-gradient-to-t transition-colors",
            isLocked
              ? "from-black/90 via-black/60 to-black/30"
              : "from-black/80 via-black/40 to-black/10 group-hover:from-black/70"
          )} />
        </div>
      )}

      {/* Lock overlay */}
      {isLocked && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10">
            <Lock className="w-8 h-8 text-white/80" />
            <span className="text-xs text-white/70 font-medium text-center max-w-[140px]">
              {t('jewelry.lockedPreset')}
            </span>
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-end h-full pb-2 text-center">
        <div className="mb-auto mt-4 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
          <Gem className={cn(
            "w-7 h-7 transition-colors",
            isLocked ? "text-white/50" : "text-white group-hover:text-primary"
          )} />
        </div>
        
        <h3 className={cn(
          "text-lg font-bold mb-1 drop-shadow-lg transition-colors",
          isLocked ? "text-white/60" : "text-white group-hover:text-primary"
        )}>
          {t(preset.nameKey)}
        </h3>
        
        <p className={cn(
          "text-xs drop-shadow",
          isLocked ? "text-white/40" : "text-white/70"
        )}>
          {t(preset.useForKey)}
        </p>
      </div>
      
      {/* Hover indicator */}
      {!isLocked && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <span className="text-sm text-primary font-semibold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
            →
          </span>
        </div>
      )}
    </button>
  );
}

export default function PiercingHome() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { hasProFeatureAccess, hasCreatorFeatureAccess } = useSubscription();

  const getAccessLevel = (presetId: string): 'full' | 'locked' => {
    if (hasCreatorFeatureAccess) return 'full';
    if (hasProFeatureAccess && PRO_ACCESSIBLE_PRESETS.includes(presetId)) return 'full';
    return 'locked';
  };
  
  return (
    <div className="min-h-screen bg-background overflow-x-hidden max-w-full">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/40 w-full">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-full">
          <button
            onClick={() => navigate("/jewelry")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">
              {t('jewelry.backToPresets')}
            </span>
          </button>
          
          <div className="flex items-center gap-2">
            <Gem className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">
              {t('piercing.pageTitle')}
            </h1>
          </div>
          
          <div className="w-20" />
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Gem className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {t('piercing.badge')}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('piercing.title')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('piercing.subtitle')}
          </p>
        </div>
        
        {/* Preset grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {piercingPresets.map((preset) => (
            <PiercingPresetCard key={preset.id} preset={preset} accessLevel={getAccessLevel(preset.id)} />
          ))}
        </div>

        {/* Info section */}
        <div className="mt-12 max-w-2xl mx-auto text-center">
          <div className="p-6 rounded-xl bg-card border border-border/50">
            <h3 className="font-semibold text-foreground mb-2">
              {t('piercing.infoTitle')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('piercing.infoDesc')}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
