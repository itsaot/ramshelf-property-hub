import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Building2, Shield, Clock, Search } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import PropertyFilters, { PropertyFiltersState, defaultFilters } from "@/components/PropertyFilters";
import Navbar from "@/components/Navbar";
import { rentalsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Index = () => {
  const [filters, setFilters] = useState<PropertyFiltersState>(defaultFilters);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    const response = await rentalsApi.getAll(filters.search ? { search: filters.search } : undefined);
    
    if (response.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: response.error,
      });
    } else {
      setProperties((response.data as any) || []);
    }
    setLoading(false);
  };

  // Client-side filtering for additional filters
  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      // Price filters
      if (filters.minPrice && property.price < parseInt(filters.minPrice)) return false;
      if (filters.maxPrice && property.price > parseInt(filters.maxPrice)) return false;
      
      // Room filters
      if (filters.bedrooms && property.bedrooms < parseInt(filters.bedrooms)) return false;
      if (filters.bathrooms && property.bathrooms < parseInt(filters.bathrooms)) return false;
      
      // Parking filters
      if (filters.garageSpaces && (property.garageSpaces || 0) < parseInt(filters.garageSpaces)) return false;
      if (filters.parkingSpaces && (property.parkingSpaces || 0) < parseInt(filters.parkingSpaces)) return false;
      
      // Boolean filters
      if (filters.furnished === true && !property.furnished) return false;
      if (filters.petFriendly === true && !property.petFriendly) return false;
      
      return true;
    });
  }, [properties, filters]);

  const handleSearch = () => {
    fetchProperties();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section - Property24 Style */}
      <section 
        className="relative py-16 md:py-24 bg-cover bg-center"
        style={{
          backgroundImage: 'linear-gradient(to bottom, hsl(var(--background) / 0.7), hsl(var(--background) / 0.9)), url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80")'
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-4">
              Find Your Perfect Rental
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Search through thousands of verified properties across South Africa
            </p>
          </div>

          {/* Property24-style Search */}
          <div className="max-w-4xl mx-auto">
            <PropertyFilters
              filters={filters}
              onFiltersChange={setFilters}
              onSearch={handleSearch}
              loading={loading}
            />
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold">
                Available Properties
              </h2>
              <p className="text-muted-foreground mt-1">
                {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading properties...</p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No properties found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search filters</p>
              <Button variant="outline" onClick={() => setFilters(defaultFilters)}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
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
                  garageSpaces={property.garageSpaces}
                  parkingSpaces={property.parkingSpaces}
                  petFriendly={property.petFriendly}
                  furnished={property.furnished}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features - Elegant Circles */}
      <section className="py-20 bg-secondary/20">
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
