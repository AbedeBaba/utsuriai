import { Check, Sparkles, Crown, Zap, Star, Lock, Image, Camera, Palette, User, Hand, Footprints, ArrowDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface PlanFeature {
  text: string;
  included: boolean;
  isUltra?: boolean;
  isLocked?: boolean;
}

interface PricingPlan {
  name: string;
  price: string;
  period?: string;
  description: string;
  credits?: string;
  features: PlanFeature[];
  badge?: string;
  badgeType?: "popular" | "powerful" | "trial";
  buttonText: string;
  highlighted?: boolean;
}

const plans: PricingPlan[] = [
  {
    name: "Trial",
    price: "Free",
    description: "Test the platform",
    credits: "5 generations total",
    badge: "Demo",
    badgeType: "trial",
    buttonText: "Start Free Trial",
    features: [
      { text: "5 image generations", included: true },
      { text: "2 images at Utsuri Pro quality", included: true },
      { text: "Basic ethnicity & appearance", included: true },
      { text: "Backgrounds & poses", included: false, isLocked: true },
      { text: "Camera angles", included: false, isLocked: true },
      { text: "Body parts (hands, feet, etc.)", included: false, isLocked: true },
      { text: "Face types & expressions", included: false, isLocked: true },
      { text: "Save & reuse models", included: false, isLocked: true },
    ],
  },
  {
    name: "Starter",
    price: "$13.99",
    period: "/ month",
    description: "Entry-level plan",
    credits: "100 credits/month",
    buttonText: "Get Started",
    features: [
      { text: "100 credits per month", included: true },
      { text: "Utsuri Pro quality", included: true },
      { text: "All ethnicities & appearances", included: true },
      { text: "Basic hair & eye colors", included: true },
      { text: "Backgrounds & poses", included: false, isLocked: true },
      { text: "Camera angles", included: false, isLocked: true },
      { text: "Body parts (hands, feet, etc.)", included: false, isLocked: true },
      { text: "Face types & expressions", included: false, isLocked: true },
      { text: "Save & reuse models", included: false, isLocked: true },
    ],
  },
  {
    name: "Pro",
    price: "$29.99",
    period: "/ month",
    description: "Professional features",
    credits: "250 credits/month",
    badge: "Popular",
    badgeType: "popular",
    buttonText: "Upgrade to Pro",
    highlighted: true,
    features: [
      { text: "250 credits per month", included: true },
      { text: "Utsuri Pro quality", included: true },
      { text: "All ethnicities & appearances", included: true },
      { text: "All hair & eye color options", included: true },
      { text: "All backgrounds", included: true },
      { text: "All poses & camera angles", included: true },
      { text: "Body parts (hands, feet, neck, back, legs)", included: true },
      { text: "Face types & expressions", included: false, isLocked: true },
      { text: "Save & reuse models", included: false, isLocked: true },
    ],
  },
  {
    name: "Creator",
    price: "$39.99",
    period: "/ month",
    description: "Ultimate creative power",
    credits: "500 credits/month",
    badge: "Most Powerful",
    badgeType: "powerful",
    buttonText: "Go Creator",
    features: [
      { text: "500 credits per month", included: true },
      { text: "Utsuri Pro quality", included: true },
      { text: "All ethnicities & appearances", included: true },
      { text: "All hair & eye color options", included: true },
      { text: "All backgrounds", included: true },
      { text: "All poses & camera angles", included: true },
      { text: "Body parts (hands, feet, neck, back, legs)", included: true },
      { text: "Face types & facial expressions", included: true },
      { text: "Save & reuse models with any outfit", included: true, isUltra: true },
    ],
  },
];

const Pricing = () => {
  const navigate = useNavigate();

  const handleSelectPlan = (planName: string) => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121a] to-[#0a0a0f] py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Unlock the power of AI fashion photography. Select the plan that fits your creative needs.
          </p>
        </div>

        {/* Credit explanation */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10">
            <Image className="w-5 h-5 text-primary" />
            <span className="text-sm text-gray-300">1 credit = 1 AI-generated image</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-6 transition-all duration-300 flex flex-col ${
                plan.highlighted
                  ? "bg-gradient-to-b from-[#2a2a3a] to-[#1a1a25] border-2 border-primary/50 shadow-[0_0_40px_rgba(155,135,245,0.15)] scale-[1.02] lg:scale-105"
                  : "bg-gradient-to-b from-[#1a1a25] to-[#12121a] border border-white/10 hover:border-white/20"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
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
                  {plan.badge}
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-4 pt-2">
                <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.period && <span className="text-gray-500">{plan.period}</span>}
                </div>
                <p className="text-sm text-gray-400 mt-2">{plan.description}</p>
                {plan.credits && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                    <Zap className="w-3 h-3 text-primary" />
                    <span className="text-xs font-medium text-primary">{plan.credits}</span>
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
                      {feature.text}
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
                onClick={() => handleSelectPlan(plan.name)}
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
                {plan.buttonText}
              </Button>
            </div>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Feature</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Trial</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Starter</th>
                  <th className="text-center py-4 px-4 text-primary font-medium">Pro</th>
                  <th className="text-center py-4 px-4 text-amber-400 font-medium">Creator</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 text-gray-300">Monthly Credits</td>
                  <td className="py-3 px-4 text-center text-gray-400">5 total</td>
                  <td className="py-3 px-4 text-center text-gray-300">100</td>
                  <td className="py-3 px-4 text-center text-primary">250</td>
                  <td className="py-3 px-4 text-center text-amber-400">500</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 text-gray-300">Utsuri Pro Quality</td>
                  <td className="py-3 px-4 text-center text-gray-400">2 images only</td>
                  <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-amber-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 text-gray-300">Backgrounds & Poses</td>
                  <td className="py-3 px-4 text-center"><Lock className="w-4 h-4 text-gray-600 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Lock className="w-4 h-4 text-gray-600 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-amber-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 text-gray-300">Camera Angles</td>
                  <td className="py-3 px-4 text-center"><Lock className="w-4 h-4 text-gray-600 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Lock className="w-4 h-4 text-gray-600 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-amber-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 text-gray-300">Body Parts (hands, feet, neck, back, legs)</td>
                  <td className="py-3 px-4 text-center"><Lock className="w-4 h-4 text-gray-600 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Lock className="w-4 h-4 text-gray-600 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-amber-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 text-gray-300">Face Types & Expressions</td>
                  <td className="py-3 px-4 text-center"><Lock className="w-4 h-4 text-gray-600 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Lock className="w-4 h-4 text-gray-600 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Lock className="w-4 h-4 text-gray-600 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-amber-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 text-gray-300 flex items-center gap-2">
                    Save & Reuse Models
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
          All plans include secure payments and can be cancelled anytime. Credits reset monthly.
        </p>
      </div>
    </div>
  );
};

export default Pricing;
