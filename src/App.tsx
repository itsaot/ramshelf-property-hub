import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminLogin from "./pages/AdminLogin";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import LandlordProperties from "./pages/LandlordProperties";
import UserManagement from "./pages/UserManagement";
import PropertyManagement from "./pages/PropertyManagement";
import PropertyDetails from "./pages/PropertyDetails";
import Payment from "./pages/Payment";
import Accounting from "./pages/Accounting";
import TenantChecks from "./pages/TenantChecks";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/payment/:id" element={<Payment />} />
          
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/landlord/properties"
            element={
              <ProtectedRoute requireLandlord>
                <LandlordProperties />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireAdmin>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/properties"
            element={
              <ProtectedRoute requireAdmin>
                <PropertyManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/accounting"
            element={
              <ProtectedRoute requireAdmin>
                <Accounting />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/checks"
            element={
              <ProtectedRoute requireAdmin>
                <TenantChecks />
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;