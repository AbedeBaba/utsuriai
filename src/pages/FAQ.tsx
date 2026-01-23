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

type FAQItem = {
  question: string;
  answer: string;
};

const faqItemsTr: FAQItem[] = [
  {
    question: "UtsuriAI nedir?",
    answer:
      "UtsuriAI, ürün fotoğraflarınızı kullanarak dakikalar içinde AI destekli moda model görselleri üretmenize yardımcı olan bir platformdur.",
  },
  {
    question: "Görselleri nasıl oluştururum?",
    answer:
      "Kıyafet görsellerinizi yükleyin, model özelliklerini (cinsiyet, etnik köken, poz vb.) seçin ve oluşturma işlemini başlatın. Sonuçlarınız hazır olduğunda indirebilirsiniz.",
  },
  {
    question: "Oluşturulan görseller ne kadar süre saklanır?",
    answer:
      "Dashboard sayfasındaki bilgilendirmeye göre oluşturulan görselleriniz belirli bir süre boyunca saklanır. Süresi dolmadan indirmeniz önerilir.",
  },
  {
    question: "Ticari kullanım hakkım var mı?",
    answer:
      "Oluşturduğunuz görselleri markanızın içeriklerinde kullanabilirsiniz. Detaylar için ilgili yasal dokümanları incelemenizi öneririz.",
  },
  {
    question: "Destek ekibine nasıl ulaşabilirim?",
    answer:
      "Bize İletişim sayfasından veya support@utsuriai.com adresinden ulaşabilirsiniz.",
  },
];

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
    document.title = "Sıkça Sorulan Sorular (SSS) | UtsuriAI";
    setMetaDescription(
      "UtsuriAI SSS: Ürün fotoğrafından AI moda model görselleri üretme, kullanım, indirme ve destek hakkında sıkça sorulan sorular.",
    );
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 w-full">
        <div className="max-w-7xl mx-auto px-6 h-20 md:h-32 flex items-center justify-between">
          <div className="cursor-pointer" onClick={() => navigate("/")}
          >
            <div className="hidden md:block">
              <BrandLogo size="xl" withText text="Utsuri" textClassName="font-bold text-2xl md:text-3xl not-italic" />
            </div>
            <div className="md:hidden">
              <BrandLogo size="lg" withText text="Utsuri" textClassName="font-bold text-xl not-italic" />
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => navigate("/templates")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("nav.templates")}
            </button>
            <button
              onClick={() => navigate("/pricing")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("nav.pricing")}
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("common.contact")}
            </button>
            <button
              onClick={() => navigate("/faq")}
              className="text-sm text-foreground font-medium"
              aria-current="page"
            >
              {t("nav.faq")}
            </button>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {!loading && user && (
              <button
                onClick={() => navigate("/dashboard")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("common.dashboard")}
              </button>
            )}
            {!loading && !user && (
              <button
                onClick={() => navigate("/auth")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("common.login")}
              </button>
            )}
            <LanguageSwitcher />
            <Button
              onClick={handleStart}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6"
            >
              {t("common.getStarted")}
            </Button>
          </div>

          <div className="flex md:hidden items-center gap-3">
            <LanguageSwitcher />
            <Button
              onClick={handleStart}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4"
            >
              {t("common.getStarted")}
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-28 md:pt-40 pb-16">
        <section className="max-w-4xl mx-auto px-6">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Sıkça Sorulan Sorular (SSS)
            </h1>
            <p className="mt-3 text-base md:text-lg text-muted-foreground">
              UtsuriAI kullanımı, görsel üretimi ve destek hakkında en sık sorulan sorular.
            </p>
          </header>

          <div className="rounded-2xl border border-border bg-card">
            <Accordion type="single" collapsible className="px-2">
              {faqItemsTr.map((item, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`} className="border-border">
                  <AccordionTrigger className="text-left font-semibold text-foreground">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p className="leading-relaxed">{item.answer}</p>
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
