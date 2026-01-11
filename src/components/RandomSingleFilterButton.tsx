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
      variant="outline"
      size="sm"
      onClick={onClick}
      className={cn(
        "gap-2 text-muted-foreground hover:text-primary hover:border-primary/50",
        className
      )}
    >
      <Shuffle className="h-4 w-4" />
      {label}
    </Button>
  );
}
