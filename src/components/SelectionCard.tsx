import { cn } from '@/lib/utils';

interface SelectionCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  colorSwatch?: string;
  selected?: boolean;
  onClick: () => void;
  className?: string;
}

export function SelectionCard({ 
  title, 
  subtitle, 
  icon, 
  colorSwatch,
  selected, 
  onClick,
  className 
}: SelectionCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "selection-card flex flex-col items-center justify-center gap-3 min-h-[140px] aspect-square",
        selected && "selected",
        className
      )}
    >
      {colorSwatch && (
        <div 
          className="w-12 h-12 rounded-full border-2 border-border shadow-sm"
          style={{ backgroundColor: colorSwatch }}
        />
      )}
      {icon && (
        <div className="text-primary text-3xl">
          {icon}
        </div>
      )}
      <div className="text-center">
        <p className="font-medium text-foreground">{title}</p>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
