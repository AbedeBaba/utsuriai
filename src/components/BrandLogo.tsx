import logo from "@/assets/utsuri-logo.svg";
import { cn } from "@/lib/utils";

type BrandLogoSize = "xs" | "sm" | "md" | "lg" | "xl";

const sizeMap: Record<BrandLogoSize, string> = {
  // Slightly larger across the app for stronger brand presence
  xs: "h-6 w-6",
  sm: "h-7 w-7",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-14 w-14",
};

interface BrandLogoProps {
  /** Controls the square mark size; text remains responsive via classes. */
  size?: BrandLogoSize;
  /** Show the wordmark next to the logo. */
  withText?: boolean;
  /** Wordmark text; defaults to "Utsuri". */
  text?: string;
  className?: string;
  imgClassName?: string;
  textClassName?: string;
}

export function BrandLogo({
  size = "md",
  withText = true,
  text = "Utsuri",
  className,
  imgClassName,
  textClassName,
}: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img
        src={logo}
        alt="Utsuri logo"
        className={cn(
          sizeMap[size],
          "object-contain select-none",
          imgClassName
        )}
        draggable={false}
        loading="eager"
      />
      {withText && (
        <span className={cn("font-semibold text-foreground italic", textClassName)}>
          {text}
        </span>
      )}
    </div>
  );
}

/** Mark-only variant for tight spaces (badges, list headers, etc.). */
export function BrandLogoMark({
  size = "sm",
  className,
}: {
  size?: BrandLogoSize;
  className?: string;
}) {
  return (
    <img
      src={logo}
      alt="Utsuri logo"
      className={cn(sizeMap[size], "object-contain select-none", className)}
      draggable={false}
      loading="eager"
    />
  );
}
