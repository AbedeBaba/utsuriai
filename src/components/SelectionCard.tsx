import { cn } from '@/lib/utils';
import { useState, useRef } from 'react';

interface SelectionCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  colorSwatch?: string;
  selected?: boolean;
  onClick: () => void;
  className?: string;
  animationDelay?: number;
  isAnimating?: boolean;
  isFadingOut?: boolean;
}

export function SelectionCard({ 
  title, 
  subtitle, 
  icon, 
  colorSwatch,
  selected, 
  onClick,
  className,
  animationDelay = 0,
  isAnimating = false,
  isFadingOut = false,
}: SelectionCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className={cn(
        "selection-card flex flex-col items-center justify-center gap-3 min-h-[140px] aspect-square",
        selected && "selected",
        isAnimating && "selecting",
        isFadingOut && "fading-out",
        className
      )}
      style={{ 
        animationDelay: `${animationDelay}ms`,
      }}
    >
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
    </div>
  );
}
