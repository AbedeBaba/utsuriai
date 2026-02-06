import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { jewelryPresets, JewelryPreset } from "@/data/jewelryPresets";
import { ArrowLeft, Gem } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/BrandLogo";

// Import preset images
import handOnlyImg from "@/assets/jewelry/preset-hand-only.jpg";
import handWristImg from "@/assets/jewelry/preset-hand-wrist.jpg";
import neckCloseupImg from "@/assets/jewelry/preset-neck-closeup.jpg";
import neckCollarboneImg from "@/assets/jewelry/preset-neck-collarbone.jpg";
import singleEarImg from "@/assets/jewelry/preset-single-ear.jpg";
import ankletImg from "@/assets/jewelry/preset-anklet.jpg";

const presetImageMap: Record<string, string> = {
  'preset-hand-only': handOnlyImg,
  'preset-hand-wrist': handWristImg,
  'preset-neck-closeup': neckCloseupImg,
  'preset-neck-collarbone': neckCollarboneImg,
  'preset-single-ear': singleEarImg,
  'preset-anklet': ankletImg,
};

function PresetCard({ preset }: { preset: JewelryPreset }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const image = presetImageMap[preset.imagePath];
  
  return (
    <button
      onClick={() => navigate(`/jewelry/generate/${preset.id}`)}
      className={cn(
        "group relative flex flex-col items-center justify-end p-6 rounded-xl",
        "border border-border/50 shadow-sm overflow-hidden",
        "hover:shadow-lg hover:border-primary/40",
        "transition-all duration-300 ease-out",
        "min-h-[280px] w-full"
      )}
    >
      {/* Background image */}
      {image && (
        <div className="absolute inset-0 z-0">
          <img 
            src={image} 
            alt={t(preset.nameKey)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 group-hover:from-black/70 transition-colors" />
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-end h-full pb-2 text-center">
        {/* Icon */}
        <div className="mb-auto mt-4 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
          <Gem className="w-7 h-7 text-white group-hover:text-primary transition-colors" />
        </div>
        
        {/* Name */}
        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors drop-shadow-lg">
          {t(preset.nameKey)}
        </h3>
        
        {/* Use for */}
        <p className="text-xs text-white/70 drop-shadow">
          {t(preset.useForKey)}
        </p>
      </div>
      
      {/* Hover indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <span className="text-sm text-primary font-semibold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
          →
        </span>
      </div>
    </button>
  );
}

export default function JewelryHome() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-background overflow-x-hidden max-w-full">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/40 w-full">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-full">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">
              {t('common.home')}
            </span>
          </button>
          
          <div className="flex items-center gap-2">
            <Gem className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">
              {t('jewelry.pageTitle')}
            </h1>
          </div>
          
          <div className="w-20" />
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-12">
        {/* Page title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Gem className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {t('jewelry.badge')}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('jewelry.title')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('jewelry.subtitle')}
          </p>
        </div>
        
        {/* Preset grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {jewelryPresets.map((preset) => (
            <PresetCard key={preset.id} preset={preset} />
          ))}
        </div>

        {/* Info section */}
        <div className="mt-12 max-w-2xl mx-auto text-center">
          <div className="p-6 rounded-xl bg-card border border-border/50">
            <h3 className="font-semibold text-foreground mb-2">
              {t('jewelry.infoTitle')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('jewelry.infoDesc')}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
