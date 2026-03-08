import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [pricingTab, setPricingTab] = useState<"all" | "monthly" | "daily">("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    const response = await rentalsApi.getAll(filters.search ? { search: filters.search } : undefined);
    
    if (response.error) {
      toast({ variant: "destructive", title: "Error", description: response.error });
    } else {
      setProperties((response.data as any) || []);
    }
    setLoading(false);
  };

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      if (filters.minPrice && property.price < parseInt(filters.minPrice)) return false;
      if (filters.maxPrice && property.price > parseInt(filters.maxPrice)) return false;
      if (filters.bedrooms && property.bedrooms < parseInt(filters.bedrooms)) return false;
      if (filters.bathrooms && property.bathrooms < parseInt(filters.bathrooms)) return false;
      if (filters.garageSpaces && (property.garageSpaces || 0) < parseInt(filters.garageSpaces)) return false;
      if (filters.parkingSpaces && (property.parkingSpaces || 0) < parseInt(filters.parkingSpaces)) return false;
      if (filters.furnished === true && !property.furnished) return false;
      if (filters.petFriendly === true && !property.petFriendly) return false;

      // Pricing type filter
      const propPricingType = property.pricingType || "monthly";
      if (pricingTab === "monthly" && propPricingType !== "monthly") return false;
      if (pricingTab === "daily" && propPricingType !== "daily") return false;
      
      return true;
    });
  }, [properties, filters, pricingTab]);

  const handleSearch = () => {
    fetchProperties();
  };

  const monthlyCount = properties.filter((p) => (p.pricingType || "monthly") === "monthly").length;
  const dailyCount = properties.filter((p) => (p.pricingType || "monthly") === "daily").length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
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
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold">
                Available Properties
              </h2>
              <p className="text-muted-foreground mt-1">
                {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
              </p>
            </div>
            {/* Pricing Type Tabs */}
            <Tabs value={pricingTab} onValueChange={(v) => setPricingTab(v as any)}>
              <TabsList>
                <TabsTrigger value="all">All ({properties.length})</TabsTrigger>
                <TabsTrigger value="monthly">Per Month ({monthlyCount})</TabsTrigger>
                <TabsTrigger value="daily">Per Day ({dailyCount})</TabsTrigger>
              </TabsList>
            </Tabs>
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
              <Button variant="outline" onClick={() => { setFilters(defaultFilters); setPricingTab("all"); }}>
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
                  pricingType={property.pricingType || "monthly"}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Why Choose Ramshelf</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold">Popular Categories</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { icon: Building2, title: "Apartments", desc: "Modern living" },
              { icon: Shield, title: "Secure", desc: "Verified properties" },
              { icon: Clock, title: "Fast", desc: "Quick booking" },
              { icon: Search, title: "Easy", desc: "Simple search" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center space-y-4">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-primary/20 overflow-hidden mx-auto p-1">
                  <div className="w-full h-full rounded-full overflow-hidden bg-primary-light flex items-center justify-center">
                    <Icon className="h-12 w-12 md:h-16 md:w-16 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-lg mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Ready to List Your Property?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of landlords on Ramshelf and connect with quality tenants looking for their perfect home.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild><Link to="/signup">Get Started</Link></Button>
            <Button size="lg" variant="outline" asChild><Link to="/login">Learn More</Link></Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
