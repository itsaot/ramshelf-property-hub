import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, User, LogOut, LayoutDashboard, Building2, DollarSign, ShieldCheck, AlertTriangle, Wrench } from "lucide-react";
import { getUser, logout, isAuthenticated, isAdmin, isLandlord, isTenant } from "@/lib/auth";
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
    <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 smooth-transition">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="text-xl font-serif font-bold text-foreground tracking-wide">Ramshelf</span>
        </Link>

        {/* Center Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-foreground hover:text-primary smooth-transition">
            Home
          </Link>
          {isLandlord() && (
            <Link to="/landlord/properties" className="text-sm font-medium text-foreground hover:text-primary smooth-transition">
              Properties
            </Link>
          )}
          {authenticated && (
            <>
              <Link to="/disputes" className="text-sm font-medium text-foreground hover:text-primary smooth-transition">
                Disputes
              </Link>
              <Link to="/maintenance" className="text-sm font-medium text-foreground hover:text-primary smooth-transition">
                Maintenance
              </Link>
            </>
          )}
          {isAdmin() && (
            <>
              <Link to="/admin" className="text-sm font-medium text-foreground hover:text-primary smooth-transition">
                Dashboard
              </Link>
              <Link to="/admin/accounting" className="text-sm font-medium text-foreground hover:text-primary smooth-transition">
                Accounting
              </Link>
              <Link to="/admin/checks" className="text-sm font-medium text-foreground hover:text-primary smooth-transition">
                Checks
              </Link>
            </>
          )}
        </div>

        {/* Right Side Icons/Buttons */}
        <div className="flex items-center gap-3">
          {authenticated ? (
            <>
              <Button variant="ghost" size="icon" asChild className="hidden md:flex">
                <Link to="/profile">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden md:flex">
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