import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import VendorAuth from "./pages/VendorAuth";
import AdminAuth from "./pages/AdminAuth";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import MarketRates from "./pages/MarketRates";
import Yojanas from "./pages/Yojanas";
import Weather from "./pages/Weather";
import Community from "./pages/Community";
import SoilPrediction from "./pages/SoilPrediction";
import VendorDashboard from "./pages/VendorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppLayout({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/vendor-auth" element={<VendorAuth />} />
          <Route path="/admin-auth" element={<AdminAuth />} />
          <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/marketplace" element={<AppLayout><Marketplace /></AppLayout>} />
          <Route path="/market-rates" element={<AppLayout><MarketRates /></AppLayout>} />
          <Route path="/yojanas" element={<AppLayout><Yojanas /></AppLayout>} />
          <Route path="/weather" element={<AppLayout><Weather /></AppLayout>} />
          <Route path="/community" element={<AppLayout><Community /></AppLayout>} />
          <Route path="/soil-prediction" element={<AppLayout><SoilPrediction /></AppLayout>} />
          <Route path="/vendor" element={<AppLayout><VendorDashboard /></AppLayout>} />
          <Route path="/admin" element={<AppLayout><AdminDashboard /></AppLayout>} />
          <Route path="/cart" element={<AppLayout><Cart /></AppLayout>} />
          <Route path="/orders" element={<AppLayout><Orders /></AppLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
