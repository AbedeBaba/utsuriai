import { AlertTriangle } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

interface AIDisclaimerProps {
  text?: string;
  className?: string;
}

export function AIDisclaimer({ text, className }: AIDisclaimerProps) {
  const { t } = useLanguage();

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg border border-border bg-card/50 px-3 py-2 text-xs text-muted-foreground",
        className
      )}
      role="note"
    >
      <AlertTriangle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      <p className="leading-relaxed">{text ?? t("common.aiDisclaimerShort")}</p>
    </div>
  );
}
