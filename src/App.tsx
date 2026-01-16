import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ModelConfigProvider } from "@/context/ModelConfigContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Landing from "./pages/Landing";
import Pricing from "./pages/Pricing";
import Auth from "./pages/Auth";
import FilterGender from "./pages/filter/FilterGender";
import FilterEthnicity from "./pages/filter/FilterEthnicity";
import FilterSkinTone from "./pages/filter/FilterSkinTone";
import FilterHairColor from "./pages/filter/FilterHairColor";
import FilterEyeColor from "./pages/filter/FilterEyeColor";
import FilterBodyType from "./pages/filter/FilterBodyType";
import FilterHairType from "./pages/filter/FilterHairType";

import FilterBeardType from "./pages/filter/FilterBeardType";
import FilterModestOption from "./pages/filter/FilterModestOption";
import FilterPose from "./pages/filter/FilterPose";
import FilterBackground from "./pages/filter/FilterBackground";
import FilterFaceType from "./pages/filter/FilterFaceType";
import FilterExpression from "./pages/filter/FilterExpression";
import ClothingSelection from "./pages/ClothingSelection";
import Result from "./pages/Result";
import Dashboard from "./pages/Dashboard";
import AccountSettings from "./pages/AccountSettings";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

// Templates pages
import TemplatesHome from "./pages/templates/TemplatesHome";
import TemplatesList from "./pages/templates/TemplatesList";

// Legal pages
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfUse from "./pages/legal/TermsOfUse";
import MembershipAgreement from "./pages/legal/MembershipAgreement";
import PreInformationForm from "./pages/legal/PreInformationForm";
import DistanceSalesAgreement from "./pages/legal/DistanceSalesAgreement";
import Contact from "./pages/Contact";

const queryClient = new QueryClient();

// App component with all providers
const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <ModelConfigProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/account-settings" element={<AccountSettings />} />
              <Route path="/admin" element={<Admin />} />
              {/* Templates routes */}
              <Route path="/templates" element={<TemplatesHome />} />
              <Route path="/templates/:categoryId" element={<TemplatesList />} />
              <Route path="/filter/gender" element={<FilterGender />} />
              <Route path="/filter/ethnicity" element={<FilterEthnicity />} />
              <Route path="/filter/skin-tone" element={<FilterSkinTone />} />
              <Route path="/filter/hair-color" element={<FilterHairColor />} />
              <Route path="/filter/eye-color" element={<FilterEyeColor />} />
              <Route path="/filter/body-type" element={<FilterBodyType />} />
              <Route path="/filter/hair-type" element={<FilterHairType />} />
              
              <Route path="/filter/beard-type" element={<FilterBeardType />} />
              <Route path="/filter/modest-option" element={<FilterModestOption />} />
              <Route path="/filter/pose" element={<FilterPose />} />
              <Route path="/filter/background" element={<FilterBackground />} />
              <Route path="/filter/face-type" element={<FilterFaceType />} />
              <Route path="/filter/expression" element={<FilterExpression />} />
              <Route path="/clothing" element={<ClothingSelection />} />
              <Route path="/result/:id" element={<Result />} />
              {/* Legal pages */}
              <Route path="/legal/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/legal/terms-of-use" element={<TermsOfUse />} />
              <Route path="/legal/membership-agreement" element={<MembershipAgreement />} />
              <Route path="/legal/pre-information-form" element={<PreInformationForm />} />
              <Route path="/legal/distance-sales-agreement" element={<DistanceSalesAgreement />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ModelConfigProvider>
    </AuthProvider>
  </LanguageProvider>
</QueryClientProvider>
);

export default App;
