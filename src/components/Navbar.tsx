import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, User, LogOut, LayoutDashboard, Building2 } from "lucide-react";
import { getUser, logout, isAuthenticated, isAdmin, isLandlord } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getUser();
  const authenticated = isAuthenticated();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  return (
    <nav className="border-b bg-background sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 smooth-transition">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="text-2xl font-bold text-primary">Ramshelf</span>
        </Link>

        <div className="flex items-center gap-4">
          {authenticated ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Link>
              </Button>

              {isAdmin() && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
              )}

              {isLandlord() && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/landlord/properties">
                    <Building2 className="h-4 w-4 mr-2" />
                    My Properties
                  </Link>
                </Button>
              )}

              <Button variant="ghost" size="sm" asChild>
                <Link to="/profile">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
              </Button>

              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
