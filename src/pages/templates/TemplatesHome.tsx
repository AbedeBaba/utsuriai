import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { getSortedCategories, ProductCategory } from "@/data/templates";
import { templateTranslations } from "@/data/templateTranslations";
import { 
  Shirt, 
  Footprints,
  ArrowLeft,
  type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

// Category background images
import hatImage from "@/assets/categories/hat.webp";
import upperWearImage from "@/assets/categories/upper-wear.webp";
import beltImage from "@/assets/categories/belt.webp";
import bottomWearImage from "@/assets/categories/bottom-wear.webp";
import shoesImage from "@/assets/categories/shoes.webp";

// Custom SVG icons for categories without good Lucide equivalents
const BeanieIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    width="24"
    height="24"
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
    width="24"
    height="24"
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
    width="24"
    height="24"
  >
    <path d="M6 2h12v4c0 1-1 2-2 2H8c-1 0-2-1-2-2V2z" />
    <path d="M6 6v16l3-2V8" />
    <path d="M18 6v16l-3-2V8" />
    <path d="M9 8h6" />
  </svg>
);

// Icon mapping for categories - using custom SVG where Lucide lacks good options
const iconMap: Record<string, LucideIcon | React.FC<{ className?: string }>> = {
  Crown: BeanieIcon,      // Hat/Beanie - custom beanie icon
  Shirt,                  // Upper Wear - Lucide shirt
  Minus: BeltIcon,        // Belt - custom belt icon
  RectangleVertical: PantsIcon, // Bottom Wear - custom pants icon
  Footprints,             // Shoes - Lucide footprints
};

// Category background image mapping
const categoryImageMap: Record<string, string> = {
  'hat': hatImage,
  'upper-wear': upperWearImage,
  'belt': beltImage,
  'bottom-wear': bottomWearImage,
  'shoes': shoesImage,
};

function CategoryCard({ category }: { category: ProductCategory }) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (key: string) => {
    const translations = templateTranslations[language as 'en' | 'tr'] || templateTranslations.en;
    return translations[key as keyof typeof translations] || key;
  };
  
  const IconComponent = iconMap[category.icon] || Shirt;
  
  const categoryImage = categoryImageMap[category.id];
  
  return (
    <button
      onClick={() => navigate(`/templates/${category.id}`)}
      className={cn(
        "group relative flex flex-col items-center justify-center p-6 rounded-xl",
        "border border-border/50 shadow-sm overflow-hidden",
        "hover:shadow-lg hover:border-primary/40",
        "transition-all duration-300 ease-out",
        "min-h-[260px] w-full"
      )}
    >
      {/* Background image */}
      {categoryImage && (
        <div className="absolute inset-0 z-0">
          <img 
            src={categoryImage} 
            alt={t(category.nameKey)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 group-hover:from-black/70 transition-colors" />
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-end h-full pb-2">
        {/* Icon */}
        <div className="mb-auto mt-4 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
          <IconComponent className="w-8 h-8 text-white group-hover:text-primary transition-colors" />
        </div>
        
        {/* Category name */}
        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors drop-shadow-lg">
          {t(category.nameKey)}
        </h3>
        
        {/* Category description */}
        {category.descriptionKey && (
          <p className="text-sm text-white/80 text-center max-w-[180px] drop-shadow">
            {t(category.descriptionKey)}
          </p>
        )}
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
