import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Building2, Shield, Clock } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import Navbar from "@/components/Navbar";
import { rentalsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async (search?: string) => {
    setLoading(true);
    const response = await rentalsApi.getAll(search ? { search } : undefined);
    
    if (response.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: response.error,
      });
    } else {
      // Backend returns array directly
      setProperties((response.data as any) || []);
    }
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProperties(searchQuery);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section - Two Column Layout */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Left Column - Text Content */}
            <div className="space-y-6">
              <p className="text-sm uppercase tracking-wider text-primary font-medium">
                Property Rentals
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight">
                Luxurious & Simplified Home Finding
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our carefully curated properties are designed to help you find your perfect home, settle with ease, and indulge in everyday comfort.
              </p>
              
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex gap-2 pt-4">
                <Input
                  type="text"
                  placeholder="Search by location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12"
                />
                <Button type="submit" size="lg">
                  Search
                </Button>
              </form>
            </div>

            {/* Right Column - Image */}
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-secondary/50">
                <img 
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80" 
                  alt="Beautiful home interior"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Elegant Circles */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-wider text-muted-foreground mb-3">
              Why Choose Ramshelf
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold">
              Popular Categories
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-primary/20 overflow-hidden mx-auto p-1">
                <div className="w-full h-full rounded-full overflow-hidden bg-primary-light flex items-center justify-center">
                  <Building2 className="h-12 w-12 md:h-16 md:w-16 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-serif font-semibold text-lg mb-1">Apartments</h3>
                <p className="text-sm text-muted-foreground">Modern living</p>
              </div>
            </div>

            <div className="text-center space-y-4">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-primary/20 overflow-hidden mx-auto p-1">
                <div className="w-full h-full rounded-full overflow-hidden bg-primary-light flex items-center justify-center">
                  <Shield className="h-12 w-12 md:h-16 md:w-16 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-serif font-semibold text-lg mb-1">Secure</h3>
                <p className="text-sm text-muted-foreground">Verified properties</p>
              </div>
            </div>

            <div className="text-center space-y-4">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-primary/20 overflow-hidden mx-auto p-1">
                <div className="w-full h-full rounded-full overflow-hidden bg-primary-light flex items-center justify-center">
                  <Clock className="h-12 w-12 md:h-16 md:w-16 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-serif font-semibold text-lg mb-1">Fast</h3>
                <p className="text-sm text-muted-foreground">Quick booking</p>
              </div>
            </div>

            <div className="text-center space-y-4">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-primary/20 overflow-hidden mx-auto p-1">
                <div className="w-full h-full rounded-full overflow-hidden bg-primary-light flex items-center justify-center">
                  <Search className="h-12 w-12 md:h-16 md:w-16 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-serif font-semibold text-lg mb-1">Easy</h3>
                <p className="text-sm text-muted-foreground">Simple search</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-wider text-primary font-medium mb-3">
              Best of Collection 2025
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Discover the Best in Rental Properties
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Elevate your lifestyle with our curated range. Where every property is selected to bring you comfort, luxury & convenience.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading properties...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No properties found. Check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.slice(0, 6).map((property) => (
                <PropertyCard
                  key={property._id}
                  id={property._id}
                  title={property.title}
                  location={property.address || property.location}
                  price={property.price}
                  bedrooms={property.bedrooms}
                  bathrooms={property.bathrooms}
                  imageUrl={property.images?.[0]}
                  type={property.type}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Ready to List Your Property?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of landlords on Ramshelf and connect with quality tenants looking for their perfect home.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
