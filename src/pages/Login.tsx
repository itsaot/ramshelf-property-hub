import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { authService } from "@/lib/authService";
import { setAuthToken, setUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
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

    const response = await authService.login({ 
      email: formData.email, 
      password: formData.password 
    });

    if (response.error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: response.error,
      });
    } else if (response.data) {
      console.log('[LOGIN PAGE] Login response:', response.data);
      const { token, user } = response.data as any;
      
      console.log('[LOGIN PAGE] Extracted token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
      console.log('[LOGIN PAGE] Extracted user:', user);
      
      setAuthToken(token);
      setUser(user);
      
      // Verify token was saved
      const savedToken = localStorage.getItem('authToken');
      console.log('[LOGIN PAGE] Verified saved token:', savedToken ? '✅ Token saved' : '❌ Token NOT saved');
      
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });

      navigate("/");
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
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
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
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="text-center text-sm">
                <Link to="/admin/login" className="text-primary hover:underline">
                  Admin? Click here
                </Link>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
