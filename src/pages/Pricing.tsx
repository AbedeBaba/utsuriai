import { Check, Sparkles, Crown, Zap, Star, Lock, Image } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

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
      { textKey: "pricing.feature.bodyParts", included: false, isLocked: true },
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
      { textKey: "pricing.feature.bodyParts", included: false, isLocked: true },
      { textKey: "pricing.feature.faceTypes", included: false, isLocked: true },
      { textKey: "pricing.feature.saveReuse", included: false, isLocked: true },
    ],
  },
  {
    nameKey: "pricing.pro",
    price: "$39.99",
    periodKey: "pricing.perMonth",
    descriptionKey: "pricing.professionalFeatures",
    creditsValue: "250",
    creditsKey: "pricing.creditsPerMonth",
    badgeKey: "pricing.popular",
    badgeType: "popular",
    buttonTextKey: "pricing.upgradeToPro",
    highlighted: true,
    features: [
      { textKey: "pricing.feature.250credits", included: true },
      { textKey: "pricing.feature.proQuality", included: true },
      { textKey: "pricing.feature.allEthnicities", included: true },
      { textKey: "pricing.feature.allHairEye", included: true },
      { textKey: "pricing.feature.allBackgrounds", included: true },
      { textKey: "pricing.feature.allPosesAngles", included: true },
      { textKey: "pricing.feature.bodyPartsDetailed", included: true },
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
      { textKey: "pricing.feature.bodyPartsDetailed", included: true },
      { textKey: "pricing.feature.faceTypesExpressions", included: true },
      { textKey: "pricing.feature.saveReuseOutfit", included: true, isUltra: true },
    ],
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSelectPlan = (planName: string) => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121a] to-[#0a0a0f] py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Top Navigation */}
        <div className="absolute top-4 right-4 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="text-gray-300 hover:text-white hover:bg-white/10"
          >
            {t('nav.dashboard')}
          </Button>
          <LanguageSwitcher />
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


        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {plans.map((plan) => (
            <div
              key={plan.nameKey}
              className={`relative rounded-2xl p-6 transition-all duration-300 flex flex-col ${
                plan.highlighted
                  ? "bg-gradient-to-b from-[#2a2a3a] to-[#1a1a25] border-2 border-primary/50 shadow-[0_0_40px_rgba(155,135,245,0.15)] scale-[1.02] lg:scale-105"
                  : "bg-gradient-to-b from-[#1a1a25] to-[#12121a] border border-white/10 hover:border-white/20"
              }`}
            >
              {/* Badge */}
              {plan.badgeKey && (
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold ${
                    plan.badgeType === "popular"
                      ? "bg-gradient-to-r from-primary to-purple-500 text-white"
                      : plan.badgeType === "powerful"
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                      : "bg-gray-700 text-gray-300"
                  }`}
                >
                  {plan.badgeType === "popular" && <Star className="inline w-3 h-3 mr-1" />}
                  {plan.badgeType === "powerful" && <Crown className="inline w-3 h-3 mr-1" />}
                  {t(plan.badgeKey)}
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
                        <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
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
          ))}
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
                  <td className="py-3 px-4 text-center text-primary">250</td>
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
                  <td className="py-3 px-4 text-gray-300">{t('pricing.feature.bodyPartsDetailed')}</td>
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
                  <td className="py-3 px-4 text-center"><Sparkles className="w-4 h-4 text-amber-400 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Note */}
        <p className="text-center text-gray-500 text-sm mt-12">
          {t('pricing.bottomNote')}
        </p>
      </div>
    </div>
  );
};

export default Pricing;
