import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { 
  getTemplatesByCategory, 
  getCategoryById, 
  Template,
  TemplatePose
} from "@/data/templates";
import { templateTranslations } from "@/data/templateTranslations";
import { ArrowLeft, Filter, Store, Camera, Armchair, Footprints, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Custom SVG icons for templates
const BeanieIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    width="20"
    height="20"
  >
    <ellipse cx="12" cy="8" rx="3" ry="2" />
    <path d="M5 14c0-4 3.5-7 7-7s7 3 7 7" />
    <path d="M4 14h16v2c0 1.5-1 3-4 3H8c-3 0-4-1.5-4-3v-2z" />
  </svg>
);

const BeltIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    width="20"
    height="20"
  >
    <rect x="2" y="9" width="20" height="6" rx="1" />
    <rect x="9" y="8" width="6" height="8" rx="1" />
    <circle cx="12" cy="12" r="1.5" />
  </svg>
);

const PantsIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    width="20"
    height="20"
  >
    <path d="M6 2h12v4c0 1-1 2-2 2H8c-1 0-2-1-2-2V2z" />
    <path d="M6 6v16l3-2V8" />
    <path d="M18 6v16l-3-2V8" />
    <path d="M9 8h6" />
  </svg>
);

// Icon mapping for templates
const templateIconMap: Record<string, LucideIcon | React.FC<{ className?: string }>> = {
  Store,       // Classic E-commerce
  Camera,      // Modern Lifestyle
  Armchair,    // Classic Sitting
  Beanie: BeanieIcon,
  Belt: BeltIcon,
  Pants: PantsIcon,
  Footprints,  // Shoes
};

function PoseCard({ pose, isMain = false }: { pose: TemplatePose; isMain?: boolean }) {
  const { language } = useLanguage();
  const t = (key: string) => {
    const translations = templateTranslations[language as 'en' | 'tr'] || templateTranslations.en;
    return translations[key as keyof typeof translations] || key;
  };
  
  const hasImage = pose.imagePath && !pose.imagePath.includes('placeholder');
  
  return (
    <div 
      className={cn(
        "relative rounded-lg bg-muted/30 border border-border/30 overflow-hidden",
        "flex items-center justify-center",
        isMain ? "aspect-[9/16]" : "aspect-[9/16]"
      )}
    >
      {hasImage ? (
        <img 
          src={pose.imagePath} 
          alt={t(pose.nameKey)}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/50 mb-3 flex items-center justify-center">
            <span className="text-2xl text-muted-foreground/40">📷</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {t(pose.nameKey)}
          </span>
        </div>
      )}
    </div>
  );
}

function TemplateCard({ template }: { template: Template }) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (key: string) => {
    const translations = templateTranslations[language as 'en' | 'tr'] || templateTranslations.en;
    return translations[key as keyof typeof translations] || key;
  };
  
  const mainPose = template.poses[0];
  const secondaryPoses = template.poses.slice(1, 4);
  const IconComponent = templateIconMap[template.icon] || Store;
  
  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Template header */}
      <div className="p-4 border-b border-border/30">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            {/* Template Icon */}
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <IconComponent className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">
                {t(template.nameKey)}
              </h3>
              {template.descriptionKey && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t(template.descriptionKey)}
                </p>
              )}
            </div>
          </div>
          <Badge variant="secondary" className="text-xs shrink-0">
            {template.gender === 'male' 
              ? t('templates.filter.male')
              : template.gender === 'female'
              ? t('templates.filter.female')
              : t('templates.filter.all')
            }
          </Badge>
        </div>
        <div className="flex gap-2 mt-2 text-xs text-muted-foreground ml-13">
          <span>📐 {template.framing}</span>
          <span>•</span>
          <span>📱 {template.aspectRatio}</span>
        </div>
      </div>
      
      {/* Poses grid */}
      <div className="p-4">
        <div className="grid grid-cols-4 gap-3">
          {/* Main pose - larger */}
          <div className="col-span-3 row-span-2">
            <PoseCard pose={mainPose} isMain />
          </div>
          
          {/* Secondary poses - stacked */}
          <div className="col-span-1 flex flex-col gap-2">
            {secondaryPoses.map((pose) => (
              <PoseCard key={pose.id} pose={pose} />
            ))}
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground mt-3 text-center">
          {t('templates.poses')}: {template.poses.length}
        </p>
      </div>
      
      {/* Action */}
      <div className="p-4 pt-0">
        <Button 
          className="w-full"
          onClick={() => {
            navigate(`/templates/generate/${template.id}`);
          }}
        >
          {t('templates.useTemplate')}
        </Button>
      </div>
    </div>
  );
}

export default function TemplatesList() {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const { language } = useLanguage();
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  
  const t = (key: string) => {
    const translations = templateTranslations[language as 'en' | 'tr'] || templateTranslations.en;
    return translations[key as keyof typeof translations] || key;
  };
  
  const category = categoryId ? getCategoryById(categoryId) : null;
  const allTemplates = categoryId ? getTemplatesByCategory(categoryId) : [];
  
  // Filter templates by gender
  const templates = genderFilter === 'all' 
    ? allTemplates 
    : allTemplates.filter(t => t.gender === genderFilter || t.gender === 'unisex');
  
  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Category not found</p>
          <Button onClick={() => navigate('/templates')}>
            {t('templates.backToCategories')}
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background overflow-x-hidden max-w-full">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/40 w-full">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-full">
          <button
            onClick={() => navigate("/templates")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">
              {t('templates.backToCategories')}
            </span>
          </button>
          
          <h1 className="text-lg font-semibold text-foreground">
            {t(category.nameKey)}
          </h1>
          
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-foreground">
            {t('templates.availableTemplates')}
          </h2>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="flex gap-1 bg-muted/30 rounded-lg p-1">
              {(['all', 'male', 'female'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setGenderFilter(filter)}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-md transition-all",
                    genderFilter === filter
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t(`templates.filter.${filter}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Templates grid */}
        {templates.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
            {templates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-muted/30 mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl">📋</span>
            </div>
            <p className="text-muted-foreground text-lg mb-2">
              {t('templates.noTemplates')}
            </p>
            <Badge variant="outline" className="text-sm">
              {t('templates.comingSoon')}
            </Badge>
          </div>
        )}
      </main>
    </div>
  );
}
