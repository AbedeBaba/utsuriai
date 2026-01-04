import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ModelConfigProvider } from "@/context/ModelConfigContext";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import FilterGender from "./pages/filter/FilterGender";
import FilterEthnicity from "./pages/filter/FilterEthnicity";
import FilterSkinTone from "./pages/filter/FilterSkinTone";
import FilterHairColor from "./pages/filter/FilterHairColor";
import FilterEyeColor from "./pages/filter/FilterEyeColor";
import FilterBodyType from "./pages/filter/FilterBodyType";
import FilterHairType from "./pages/filter/FilterHairType";
import FilterBeardType from "./pages/filter/FilterBeardType";
import ClothingSelection from "./pages/ClothingSelection";
import Result from "./pages/Result";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ModelConfigProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/filter/gender" element={<FilterGender />} />
              <Route path="/filter/ethnicity" element={<FilterEthnicity />} />
              <Route path="/filter/skin-tone" element={<FilterSkinTone />} />
              <Route path="/filter/hair-color" element={<FilterHairColor />} />
              <Route path="/filter/eye-color" element={<FilterEyeColor />} />
              <Route path="/filter/body-type" element={<FilterBodyType />} />
              <Route path="/filter/hair-type" element={<FilterHairType />} />
              <Route path="/filter/beard-type" element={<FilterBeardType />} />
              <Route path="/clothing" element={<ClothingSelection />} />
              <Route path="/result/:id" element={<Result />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ModelConfigProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
