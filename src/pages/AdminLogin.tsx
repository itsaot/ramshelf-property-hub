import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Shield } from "lucide-react";
import { authService } from "@/lib/authService";
import { setAuthToken, setUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const response = await authService.adminLogin({ 
      emailOrPhone: formData.email, 
      password: formData.password 
    });

    if (response.error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: response.error,
      });
    } else if (response.data) {
      console.log('[ADMIN LOGIN PAGE] Login response:', response.data);
      const { token, user } = response.data as any;
      
      console.log('[ADMIN LOGIN PAGE] Extracted token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
      console.log('[ADMIN LOGIN PAGE] Extracted user:', user);
      
      if (user.role !== 'admin') {
        toast({
          variant: "destructive",
          title: "Access denied",
          description: "You do not have admin privileges.",
        });
        setLoading(false);
        return;
      }

      setAuthToken(token);
      setUser(user);
      
      // Verify token was saved
      const savedToken = localStorage.getItem('authToken');
      console.log('[ADMIN LOGIN PAGE] Verified saved token:', savedToken ? '✅ Token saved' : '❌ Token NOT saved');
      
      toast({
        title: "Welcome, Admin",
        description: "You have successfully logged in.",
      });

      navigate("/admin");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-3xl font-bold text-primary">Ramshelf</span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle>Admin Portal</CardTitle>
            </div>
            <CardDescription>Sign in with your admin credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@ramshelf.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Admin Sign In"}
              </Button>

              <div className="text-center text-sm">
                <Link to="/login" className="text-primary hover:underline">
                  ← Back to regular login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
