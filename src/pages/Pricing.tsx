import { Check, Crown, Zap, Star, Lock, Image, Plus, AlertTriangle, ArrowLeft } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useSubscription } from "@/hooks/useSubscription";
import { Footer } from "@/components/Footer";
import { BrandLogoMark } from "@/components/BrandLogo";

interface PlanFeature {
  textKey: string;
  included: boolean;
  isUltra?: boolean;
  isLocked?: boolean;
}

interface PricingPlan {
  nameKey: string;
  price: string;
  periodKey?: string;
  descriptionKey: string;
  creditsKey?: string;
  creditsValue?: string;
  features: PlanFeature[];
  badgeKey?: string;
  badgeType?: "popular" | "powerful" | "trial";
  buttonTextKey: string;
  highlighted?: boolean;
}

interface CreditPack {
  credits: number;
  price: string;
  priceValue: number;
}

const creditPacks: CreditPack[] = [
  { credits: 50, price: "$5", priceValue: 5 },
  { credits: 100, price: "$9.50", priceValue: 9.5 },
  { credits: 200, price: "$18", priceValue: 18 },
  { credits: 500, price: "$45", priceValue: 45 },
  { credits: 1000, price: "$85", priceValue: 85 },
];

const plans: PricingPlan[] = [
  {
    nameKey: "pricing.trial",
    price: "Free",
    descriptionKey: "pricing.testPlatform",
    creditsKey: "pricing.generationsTotal",
    badgeKey: "pricing.demo",
    badgeType: "trial",
    buttonTextKey: "pricing.startFreeTrial",
    features: [
      { textKey: "pricing.feature.5generations", included: true },
      { textKey: "pricing.feature.2proQuality", included: true },
      { textKey: "pricing.feature.basicEthnicity", included: true },
      { textKey: "pricing.feature.backgroundsPoses", included: false, isLocked: true },
      { textKey: "pricing.feature.cameraAngles", included: false, isLocked: true },
      { textKey: "pricing.feature.faceTypes", included: false, isLocked: true },
      { textKey: "pricing.feature.saveReuse", included: false, isLocked: true },
    ],
  },
  {
    nameKey: "pricing.starter",
    price: "$9.99",
    periodKey: "pricing.perMonth",
    descriptionKey: "pricing.entryLevel",
    creditsValue: "100",
    creditsKey: "pricing.creditsPerMonth",
    buttonTextKey: "pricing.getStarted",
    features: [
      { textKey: "pricing.feature.100credits", included: true },
      { textKey: "pricing.feature.proQuality", included: true },
      { textKey: "pricing.feature.allEthnicities", included: true },
      { textKey: "pricing.feature.basicHairEye", included: true },
      { textKey: "pricing.feature.backgroundsPoses", included: false, isLocked: true },
      { textKey: "pricing.feature.cameraAngles", included: false, isLocked: true },
      { textKey: "pricing.feature.faceTypes", included: false, isLocked: true },
      { textKey: "pricing.feature.saveReuse", included: false, isLocked: true },
    ],
  },
  {
    nameKey: "pricing.pro",
    price: "$39.99",
    periodKey: "pricing.perMonth",
    descriptionKey: "pricing.professionalFeatures",
    creditsValue: "400",
    creditsKey: "pricing.creditsPerMonth",
    badgeKey: "pricing.popular",
    badgeType: "popular",
    buttonTextKey: "pricing.upgradeToPro",
    highlighted: true,
    features: [
      { textKey: "pricing.feature.400credits", included: true },
      { textKey: "pricing.feature.proQuality", included: true },
      { textKey: "pricing.feature.allEthnicities", included: true },
      { textKey: "pricing.feature.allHairEye", included: true },
      { textKey: "pricing.feature.allBackgrounds", included: true },
      { textKey: "pricing.feature.allPosesAngles", included: true },
      { textKey: "pricing.feature.faceTypes", included: false, isLocked: true },
      { textKey: "pricing.feature.saveReuse", included: false, isLocked: true },
    ],
  },
  {
    nameKey: "pricing.creator",
    price: "$49.99",
    periodKey: "pricing.perMonth",
    descriptionKey: "pricing.ultimatePower",
    creditsValue: "500",
    creditsKey: "pricing.creditsPerMonth",
    badgeKey: "pricing.mostPowerful",
    badgeType: "powerful",
    buttonTextKey: "pricing.goCreator",
    features: [
      { textKey: "pricing.feature.500credits", included: true },
      { textKey: "pricing.feature.proQuality", included: true },
      { textKey: "pricing.feature.allEthnicities", included: true },
      { textKey: "pricing.feature.allHairEye", included: true },
      { textKey: "pricing.feature.allBackgrounds", included: true },
      { textKey: "pricing.feature.allPosesAngles", included: true },
      { textKey: "pricing.feature.faceTypesExpressions", included: true },
      { textKey: "pricing.feature.saveReuseOutfit", included: true, isUltra: true },
    ],
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isTrial, isPaid, isTrialProExhausted, trialStandardRemaining } = useSubscription();

  const handleSelectPlan = (planName: string) => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121a] to-[#0a0a0f] py-20 px-4 overflow-x-hidden max-w-full">
      <div className="max-w-7xl mx-auto w-full">
        {/* Top Navigation */}
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-gray-300 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>
        <div className="absolute top-4 right-4 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="text-gray-300 hover:text-white hover:bg-white/10"
          >
            Dashboard
          </Button>
          <LanguageSwitcher className="text-white" />
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            {t('pricing.title')}
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            {t('pricing.subtitle')}
          </p>
        </div>

        {/* Trial Pro Exhausted Warning */}
        {isTrial && isTrialProExhausted && (
          <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-medium">Pro generation limit reached</p>
                <p className="text-sm text-amber-400/80">
                  You have {trialStandardRemaining} standard generations remaining. Upgrade to unlock all features.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {plans.map((plan) => {
            // Highlight Trial card when Pro is exhausted
            const isTrialCard = plan.nameKey === "pricing.trial";
            const shouldHighlightTrial = isTrialCard && isTrial && isTrialProExhausted;
            
            return (
              <div
                key={plan.nameKey}
                className={`relative rounded-2xl p-6 transition-all duration-300 flex flex-col ${
                  shouldHighlightTrial
                    ? "bg-gradient-to-b from-amber-500/20 to-[#1a1a25] border-2 border-amber-500/50 shadow-[0_0_40px_rgba(245,158,11,0.2)] ring-2 ring-amber-500/30"
                    : plan.highlighted
                    ? "bg-gradient-to-b from-[#2a2a3a] to-[#1a1a25] border-2 border-primary/50 shadow-[0_0_40px_rgba(155,135,245,0.15)] scale-[1.02] lg:scale-105"
                    : "bg-gradient-to-b from-[#1a1a25] to-[#12121a] border border-white/10 hover:border-white/20"
                }`}
              >
              {/* Badge */}
              {(plan.badgeKey || shouldHighlightTrial) && (
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold ${
                    shouldHighlightTrial
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                      : plan.badgeType === "popular"
                      ? "bg-gradient-to-r from-primary to-purple-500 text-white"
                      : plan.badgeType === "powerful"
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                      : "bg-gray-700 text-gray-300"
                  }`}
                >
                  {shouldHighlightTrial && <AlertTriangle className="inline w-3 h-3 mr-1" />}
                  {plan.badgeType === "popular" && <Star className="inline w-3 h-3 mr-1" />}
                  {plan.badgeType === "powerful" && <Crown className="inline w-3 h-3 mr-1" />}
                  {shouldHighlightTrial ? "Upgrade Now" : t(plan.badgeKey!)}
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-4 pt-2">
                <h3 className="text-xl font-semibold text-white mb-2">{t(plan.nameKey)}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.periodKey && <span className="text-gray-500">{t(plan.periodKey)}</span>}
                </div>
                <p className="text-sm text-gray-400 mt-2">{t(plan.descriptionKey)}</p>
                {plan.creditsKey && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                    <Zap className="w-3 h-3 text-primary" />
                    <span className="text-xs font-medium text-primary">
                      {plan.creditsValue ? `${plan.creditsValue} ${t(plan.creditsKey)}` : t(plan.creditsKey)}
                    </span>
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className={`flex items-start gap-2.5 ${
                      feature.isUltra
                        ? "bg-gradient-to-r from-amber-500/10 to-orange-500/10 -mx-2 px-2 py-2 rounded-lg border border-amber-500/30"
                        : ""
                    }`}
                  >
                    {feature.included ? (
                      feature.isUltra ? (
                        <BrandLogoMark size="sm" className="mt-0.5" />
                      ) : (
                        <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      )
                    ) : feature.isLocked ? (
                      <Lock className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-gray-600 flex-shrink-0 mt-0.5" />
                    )}
                    <span
                      className={`text-sm ${
                        feature.included
                          ? feature.isUltra
                            ? "text-amber-300 font-medium"
                            : "text-gray-300"
                          : "text-gray-600"
                      }`}
                    >
                      {t(feature.textKey)}
                      {feature.isUltra && (
                        <span className="ml-2 text-[10px] uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-full">
                          Ultra
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                onClick={() => handleSelectPlan(t(plan.nameKey))}
                className={`w-full py-6 font-semibold transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white shadow-lg shadow-primary/25"
                    : plan.badgeType === "powerful"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-500/90 hover:to-orange-500/90 text-white"
                    : plan.badgeType === "trial"
                    ? "bg-white/10 hover:bg-white/15 text-white border border-white/20"
                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                }`}
              >
                {plan.badgeType === "powerful" && <Zap className="w-4 h-4 mr-2" />}
                {t(plan.buttonTextKey)}
              </Button>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-white text-center mb-8">{t('pricing.featureComparison')}</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">{t('pricing.feature')}</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">{t('pricing.trial')}</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">{t('pricing.starter')}</th>
                  <th className="text-center py-4 px-4 text-primary font-medium">{t('pricing.pro')}</th>
                  <th className="text-center py-4 px-4 text-amber-400 font-medium">{t('pricing.creator')}</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 text-gray-300">{t('pricing.monthlyCredits')}</td>
                  <td className="py-3 px-4 text-center text-gray-400">5 {t('pricing.total')}</td>
                  <td className="py-3 px-4 text-center text-gray-300">100</td>
                  <td className="py-3 px-4 text-center text-primary">400</td>
                  <td className="py-3 px-4 text-center text-amber-400">500</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 text-gray-300">{t('pricing.feature.proQuality')}</td>
                  <td className="py-3 px-4 text-center text-gray-400">2 {t('pricing.imagesOnly')}</td>
                  <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-amber-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 text-gray-300">{t('pricing.feature.backgroundsPoses')}</td>
                  <td className="py-3 px-4 text-center"><Lock className="w-4 h-4 text-gray-600 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Lock className="w-4 h-4 text-gray-600 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-amber-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 text-gray-300">{t('pricing.feature.cameraAngles')}</td>
                  <td className="py-3 px-4 text-center"><Lock className="w-4 h-4 text-gray-600 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Lock className="w-4 h-4 text-gray-600 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-amber-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 text-gray-300">{t('pricing.feature.faceTypes')}</td>
                  <td className="py-3 px-4 text-center"><Lock className="w-4 h-4 text-gray-600 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Lock className="w-4 h-4 text-gray-600 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Lock className="w-4 h-4 text-gray-600 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-amber-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 text-gray-300 flex items-center gap-2">
                    {t('pricing.feature.saveReuse')}
                    <span className="text-[10px] uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-full">Ultra</span>
                  </td>
                  <td className="py-3 px-4 text-center"><Lock className="w-4 h-4 text-gray-600 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Lock className="w-4 h-4 text-gray-600 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Lock className="w-4 h-4 text-gray-600 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><BrandLogoMark size="sm" className="mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Credit Packs Section - Only visible to paid plan users */}
        {isPaid ? (
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-white text-center mb-4">{t('pricing.creditPacks.title')}</h2>
            <p className="text-gray-400 text-center mb-8 max-w-xl mx-auto">
              {t('pricing.creditPacks.subtitle')}
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
              {creditPacks.map((pack) => (
                <div
                  key={pack.credits}
                  className="relative rounded-xl p-5 bg-gradient-to-b from-[#1a1a25] to-[#12121a] border border-white/10 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(155,135,245,0.1)] group"
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="text-2xl font-bold text-white">{pack.credits}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">{t('pricing.credits')}</p>
                    <p className="text-xl font-semibold text-primary">{pack.price}</p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      ${(pack.priceValue / pack.credits * 100).toFixed(1)}¢ / {t('pricing.perCredit')}
                    </p>
                  </div>
                  
                  <Button
                    onClick={() => handleSelectPlan(`${pack.credits} credits`)}
                    size="sm"
                    className="w-full mt-4 bg-white/5 hover:bg-primary/20 text-white border border-white/10 hover:border-primary/50 transition-all"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {t('pricing.buy')}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : isTrial ? (
          <div className="mt-20 max-w-2xl mx-auto">
            <div className="rounded-xl p-8 bg-gradient-to-b from-[#1a1a25] to-[#12121a] border border-primary/30 text-center">
              <Zap className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">
                {t('pricing.upgradeToUnlock')}
              </h3>
              <p className="text-gray-400 mb-6">
                {t('pricing.upgradeToUnlockDescription')}
              </p>
              <p className="text-sm text-gray-500">
                {t('pricing.chooseAPlanAbove')}
              </p>
            </div>
          </div>
        ) : null}

        {/* Legal Notice for Payment */}
        <div className="mt-12 p-6 rounded-xl bg-white/5 border border-white/10 max-w-2xl mx-auto text-center">
          <p className="text-sm text-gray-400">
            Satın alma işlemini tamamlayarak{' '}
            <Link to="/legal/pre-information-form" className="text-primary hover:underline">Ön Bilgilendirme Formu</Link>'nu
            {' '}ve{' '}
            <Link to="/legal/distance-sales-agreement" className="text-primary hover:underline">Mesafeli Satış Sözleşmesi</Link>'ni kabul etmiş olursunuz.
          </p>
        </div>

        {/* Bottom Note */}
        <p className="text-center text-gray-500 text-sm mt-8">
          {t('pricing.bottomNote')}
        </p>
      </div>
      
      {/* Footer */}
      <Footer variant="dark" />
    </div>
  );
};

export default Pricing;
