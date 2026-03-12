import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import VendorAuth from "./pages/VendorAuth";
import AdminAuth from "./pages/AdminAuth";
import ResetPassword from "./pages/ResetPassword";
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
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/e-commerce" element={<ProtectedRoute><AppLayout><Marketplace /></AppLayout></ProtectedRoute>} />
          <Route path="/marketplace" element={<ProtectedRoute><AppLayout><Marketplace /></AppLayout></ProtectedRoute>} />
          <Route path="/market-rates" element={<ProtectedRoute><AppLayout><MarketRates /></AppLayout></ProtectedRoute>} />
          <Route path="/yojanas" element={<ProtectedRoute><AppLayout><Yojanas /></AppLayout></ProtectedRoute>} />
          <Route path="/weather" element={<ProtectedRoute><AppLayout><Weather /></AppLayout></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><AppLayout><Community /></AppLayout></ProtectedRoute>} />
          <Route path="/soil-prediction" element={<ProtectedRoute><AppLayout><SoilPrediction /></AppLayout></ProtectedRoute>} />
          <Route path="/vendor" element={<ProtectedRoute requiredRole="vendor"><AppLayout><VendorDashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><AppLayout><Cart /></AppLayout></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><AppLayout><Orders /></AppLayout></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
