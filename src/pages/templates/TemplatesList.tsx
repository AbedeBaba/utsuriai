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
import { ArrowLeft, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function PoseCard({ pose, isMain = false }: { pose: TemplatePose; isMain?: boolean }) {
  const { language } = useLanguage();
  const t = (key: string) => {
    const translations = templateTranslations[language as 'en' | 'tr'] || templateTranslations.en;
    return translations[key as keyof typeof translations] || key;
  };
  
  return (
    <div 
      className={cn(
        "relative rounded-lg bg-muted/30 border border-border/30 overflow-hidden",
        "flex items-center justify-center",
        isMain ? "aspect-[9/16]" : "aspect-[9/16]"
      )}
    >
      {pose.imagePlaceholder !== '/placeholder.svg' ? (
        <img 
          src={pose.imagePlaceholder} 
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
  
  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Template header */}
      <div className="p-4 border-b border-border/30">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-foreground text-lg">
              {t(template.nameKey)}
            </h3>
            {template.descriptionKey && (
              <p className="text-sm text-muted-foreground mt-1">
                {t(template.descriptionKey)}
              </p>
            )}
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
        <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
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
            // Future: navigate to template usage flow
            console.log('Use template:', template.id);
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
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
