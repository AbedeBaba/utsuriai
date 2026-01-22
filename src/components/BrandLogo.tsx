import logo from "@/assets/utsuri-logo.png";
import { cn } from "@/lib/utils";

type BrandLogoSize = "xs" | "sm" | "md" | "lg";

const sizeMap: Record<BrandLogoSize, string> = {
  xs: "h-5 w-5",
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
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
