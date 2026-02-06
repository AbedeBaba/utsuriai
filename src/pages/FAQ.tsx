import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { BrandLogo } from "@/components/BrandLogo";
import { Footer } from "@/components/Footer";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

const FAQ_KEYS = Array.from({ length: 15 }, (_, i) => i + 1);

function setMetaDescription(content: string) {
  const name = "description";
  let tag = document.querySelector(`meta[name='${name}']`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.name = name;
    document.head.appendChild(tag);
  }
  tag.content = content;
}

export default function FAQ() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  const handleStart = () => {
    if (user) navigate("/filter/gender");
    else navigate("/auth");
  };

  useEffect(() => {
    document.title = t("faq.metaTitle");
    setMetaDescription(t("faq.metaDescription"));
  }, [t]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 w-full">
        <div className="max-w-7xl mx-auto px-6 h-20 md:h-32 flex items-center justify-between">
          <div className="cursor-pointer" onClick={() => navigate("/")}>
            <div className="hidden md:block">
              <BrandLogo size="xl" withText text="Utsuri" textClassName="font-bold text-2xl md:text-3xl not-italic" />
            </div>
            <div className="md:hidden">
              <BrandLogo size="lg" withText text="Utsuri" textClassName="font-bold text-xl not-italic" />
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate("/templates")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t("nav.templates")}
            </button>
            <button onClick={() => navigate("/pricing")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t("nav.pricing")}
            </button>
            <button onClick={() => navigate("/contact")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t("common.contact")}
            </button>
            <button onClick={() => navigate("/faq")} className="text-sm text-foreground font-medium" aria-current="page">
              {t("nav.faq")}
            </button>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {!loading && user && (
              <button onClick={() => navigate("/dashboard")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("common.dashboard")}
              </button>
            )}
            {!loading && !user && (
              <button onClick={() => navigate("/auth")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("common.login")}
              </button>
            )}
            <LanguageSwitcher />
            <Button onClick={handleStart} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6">
              {t("common.getStarted")}
            </Button>
          </div>

          <div className="flex md:hidden items-center gap-3">
            <LanguageSwitcher />
            <Button onClick={handleStart} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4">
              {t("common.getStarted")}
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-28 md:pt-40 pb-16">
        <section className="max-w-4xl mx-auto px-6">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {t("faq.pageTitle")}
            </h1>
            <p className="mt-3 text-base md:text-lg text-muted-foreground">
              {t("faq.pageSubtitle")}
            </p>
          </header>

          <div className="rounded-2xl border border-border bg-card">
            <Accordion type="single" collapsible className="px-2">
              {FAQ_KEYS.map((num) => (
                <AccordionItem key={num} value={`item-${num}`} className="border-border">
                  <AccordionTrigger className="text-left font-semibold text-foreground">
                    {t(`faq.q${num}`)}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p className="leading-relaxed">{t(`faq.a${num}`)}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
