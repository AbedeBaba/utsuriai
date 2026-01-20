import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { getSortedCategories, ProductCategory } from "@/data/templates";
import { templateTranslations } from "@/data/templateTranslations";
import { 
  Crown, 
  Shirt, 
  Minus, 
  RectangleVertical, 
  Footprints,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

// Icon mapping for categories
const iconMap: Record<string, React.ElementType> = {
  Crown,
  Shirt,
  Minus,
  RectangleVertical,
  Footprints,
};

function CategoryCard({ category }: { category: ProductCategory }) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (key: string) => {
    const translations = templateTranslations[language as 'en' | 'tr'] || templateTranslations.en;
    return translations[key as keyof typeof translations] || key;
  };
  
  const IconComponent = iconMap[category.icon] || Shirt;
  
  return (
    <button
      onClick={() => navigate(`/templates/${category.id}`)}
      className={cn(
        "group relative flex flex-col items-center justify-center p-8 rounded-xl",
        "bg-card border border-border/50 shadow-sm",
        "hover:shadow-md hover:border-primary/30 hover:bg-accent/30",
        "transition-all duration-300 ease-out",
        "min-h-[220px] w-full"
      )}
    >
      {/* Image placeholder area */}
      <div className="relative w-24 h-24 mb-4 rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden">
        {category.imagePlaceholder !== '/placeholder.svg' ? (
          <img 
            src={category.imagePlaceholder} 
            alt={t(category.nameKey)}
            className="w-full h-full object-cover"
          />
        ) : (
          <IconComponent className="w-10 h-10 text-muted-foreground/60 group-hover:text-primary transition-colors" />
        )}
      </div>
      
      {/* Category name */}
      <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
        {t(category.nameKey)}
      </h3>
      
      {/* Category description */}
      {category.descriptionKey && (
        <p className="text-sm text-muted-foreground text-center max-w-[200px]">
          {t(category.descriptionKey)}
        </p>
      )}
      
      {/* Hover indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs text-primary font-medium">
          →
        </span>
      </div>
    </button>
  );
}

export default function TemplatesHome() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (key: string) => {
    const translations = templateTranslations[language as 'en' | 'tr'] || templateTranslations.en;
    return translations[key as keyof typeof translations] || key;
  };
  
  const categories = getSortedCategories();
  
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
              {language === 'tr' ? 'Ana Sayfa' : 'Home'}
            </span>
          </button>
          
          <h1 className="text-lg font-semibold text-foreground">
            {t('templates.pageTitle')}
          </h1>
          
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-12">
        {/* Page title section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('templates.whatToSell')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('templates.whatToSellDesc')}
          </p>
        </div>
        
        {/* Category grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-6xl mx-auto">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </main>
    </div>
  );
}
