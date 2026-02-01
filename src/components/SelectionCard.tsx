import { cn } from '@/lib/utils';
import { useRef } from 'react';
import { OptimizedImage } from '@/components/OptimizedImage';

interface SelectionCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  colorSwatch?: string;
  image?: string;
  selected?: boolean;
  onClick: () => void;
  className?: string;
  animationDelay?: number;
  isAnimating?: boolean;
  isFadingOut?: boolean;
  imagePosition?: string;
}

export function SelectionCard({ 
  title, 
  subtitle, 
  icon, 
  colorSwatch,
  image,
  selected, 
  onClick,
  className,
  animationDelay = 0,
  isAnimating = false,
  isFadingOut = false,
  imagePosition,
}: SelectionCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className={cn(
        "selection-card flex flex-col items-center justify-center gap-3 min-h-[140px] aspect-square overflow-hidden",
        image && "p-0",
        selected && "selected",
        isAnimating && "selecting",
        isFadingOut && "fading-out",
        className
      )}
      style={{ 
        animationDelay: `${animationDelay}ms`,
      }}
    >
      {image ? (
        <div className="relative w-full h-full">
          <OptimizedImage 
            src={image} 
            alt={title}
            className="w-full h-full object-cover"
            objectPosition={imagePosition}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
            <p className="font-semibold text-lg text-white drop-shadow-lg">{title}</p>
            {subtitle && (
              <p className="text-sm text-white/80 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      ) : (
        <>
          {colorSwatch && (
            <div 
              className="w-12 h-12 rounded-full border-2 border-white/30 shadow-sm transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: colorSwatch }}
            />
          )}
          {icon && (
            <div className="text-primary text-3xl transition-transform duration-300">
              {icon}
            </div>
          )}
          <div className="text-center">
            <p className="font-semibold text-lg text-inherit">{title}</p>
            {subtitle && (
              <p className="text-sm opacity-70 mt-1">{subtitle}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
