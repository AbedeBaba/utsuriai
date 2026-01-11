import { Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RandomSingleFilterButtonProps {
  onClick: () => void;
  className?: string;
  label?: string;
}

export function RandomSingleFilterButton({ onClick, className, label = "Random for this filter" }: RandomSingleFilterButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        "gap-2 text-white/70 hover:text-white hover:bg-violet-500/20 border border-white/20 hover:border-violet-400/50 transition-all duration-300",
        className
      )}
    >
      <Shuffle className="h-3.5 w-3.5" />
      <span className="text-xs">{label}</span>
    </Button>
  );
}
