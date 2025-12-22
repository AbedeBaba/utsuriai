import { useState, useCallback, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SelectionContainerProps {
  children: ReactNode;
  onSelectionComplete: (selectedId: string) => void;
  selectedId?: string;
}

export function SelectionContainer({
  children,
  onSelectionComplete,
  selectedId,
}: SelectionContainerProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatingId, setAnimatingId] = useState<string | null>(null);

  const handleSelect = useCallback((id: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setAnimatingId(id);

    // Trigger selection animation
    setTimeout(() => {
      onSelectionComplete(id);
    }, 600);
  }, [isAnimating, onSelectionComplete]);

  return (
    <div className="relative">
      {/* Backdrop */}
      <div 
        className={cn(
          "selection-backdrop",
          isAnimating && "active"
        )} 
      />
      
      {/* Pass animation state to children via context or clone */}
      <div className="relative z-10">
        {typeof children === 'function' 
          ? (children as (props: { 
              handleSelect: (id: string) => void; 
              isAnimating: boolean;
              animatingId: string | null;
            }) => ReactNode)({ handleSelect, isAnimating, animatingId })
          : children
        }
      </div>
    </div>
  );
}
