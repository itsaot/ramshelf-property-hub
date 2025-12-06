import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Search, SlidersHorizontal, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export interface PropertyFiltersState {
  search: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
  furnished: boolean | null;
  petFriendly: boolean | null;
  garageSpaces: string;
  parkingSpaces: string;
}

interface PropertyFiltersProps {
  filters: PropertyFiltersState;
  onFiltersChange: (filters: PropertyFiltersState) => void;
  onSearch: () => void;
  loading?: boolean;
}

export const defaultFilters: PropertyFiltersState = {
  search: "",
  minPrice: "",
  maxPrice: "",
  bedrooms: "",
  bathrooms: "",
  furnished: null,
  petFriendly: null,
  garageSpaces: "",
  parkingSpaces: "",
};

const PropertyFilters = ({
  filters,
  onFiltersChange,
  onSearch,
  loading,
}: PropertyFiltersProps) => {
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const updateFilter = (key: keyof PropertyFiltersState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange(defaultFilters);
  };

  const hasActiveFilters = 
    filters.minPrice || 
    filters.maxPrice || 
    filters.bedrooms || 
    filters.bathrooms ||
    filters.furnished !== null ||
    filters.petFriendly !== null ||
    filters.garageSpaces ||
    filters.parkingSpaces;

  return (
    <div className="w-full">
      {/* Main Search Bar - Property24 Style */}
      <div className="bg-card rounded-xl shadow-lg border border-border p-2">
        <div className="flex flex-col md:flex-row gap-2">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for a City, Suburb or Area..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="h-14 pl-12 text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
            />
          </div>
          
          {/* Search Button */}
          <Button 
            onClick={onSearch} 
            disabled={loading}
            className="h-14 px-8 text-base font-semibold"
          >
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

      {/* Filter Pills Row */}
      <div className="flex flex-wrap gap-2 mt-4">
        {/* Quick Filters */}
        <Select
          value={filters.bedrooms}
          onValueChange={(val) => updateFilter("bedrooms", val === "any" ? "" : val)}
        >
          <SelectTrigger className="w-[140px] bg-card">
            <SelectValue placeholder="Bedrooms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="1">1+</SelectItem>
            <SelectItem value="2">2+</SelectItem>
            <SelectItem value="3">3+</SelectItem>
            <SelectItem value="4">4+</SelectItem>
            <SelectItem value="5">5+</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.minPrice}
          onValueChange={(val) => updateFilter("minPrice", val === "any" ? "" : val)}
        >
          <SelectTrigger className="w-[140px] bg-card">
            <SelectValue placeholder="Min Price" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="1000">R1,000</SelectItem>
            <SelectItem value="2500">R2,500</SelectItem>
            <SelectItem value="5000">R5,000</SelectItem>
            <SelectItem value="7500">R7,500</SelectItem>
            <SelectItem value="10000">R10,000</SelectItem>
            <SelectItem value="15000">R15,000</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.maxPrice}
          onValueChange={(val) => updateFilter("maxPrice", val === "any" ? "" : val)}
        >
          <SelectTrigger className="w-[140px] bg-card">
            <SelectValue placeholder="Max Price" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="5000">R5,000</SelectItem>
            <SelectItem value="7500">R7,500</SelectItem>
            <SelectItem value="10000">R10,000</SelectItem>
            <SelectItem value="15000">R15,000</SelectItem>
            <SelectItem value="20000">R20,000</SelectItem>
            <SelectItem value="30000">R30,000</SelectItem>
            <SelectItem value="50000">R50,000</SelectItem>
          </SelectContent>
        </Select>

        {/* More Filters Button */}
        <Sheet open={showMoreFilters} onOpenChange={setShowMoreFilters}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2 bg-card">
              <SlidersHorizontal className="h-4 w-4" />
              More Filters
              {hasActiveFilters && (
                <span className="ml-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  !
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filter Properties</SheetTitle>
              <SheetDescription>
                Refine your search with additional filters
              </SheetDescription>
            </SheetHeader>
            
            <div className="space-y-6 mt-6">
              {/* Bathrooms */}
              <div className="space-y-2">
                <Label>Bathrooms</Label>
                <Select
                  value={filters.bathrooms}
                  onValueChange={(val) => updateFilter("bathrooms", val === "any" ? "" : val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Garage Spaces */}
              <div className="space-y-2">
                <Label>Garage Spaces</Label>
                <Select
                  value={filters.garageSpaces}
                  onValueChange={(val) => updateFilter("garageSpaces", val === "any" ? "" : val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Parking Spaces */}
              <div className="space-y-2">
                <Label>Parking Spaces</Label>
                <Select
                  value={filters.parkingSpaces}
                  onValueChange={(val) => updateFilter("parkingSpaces", val === "any" ? "" : val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Furnished */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Furnished</Label>
                  <p className="text-xs text-muted-foreground">Only show furnished properties</p>
                </div>
                <Switch
                  checked={filters.furnished === true}
                  onCheckedChange={(checked) => updateFilter("furnished", checked ? true : null)}
                />
              </div>

              {/* Pet Friendly */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Pet Friendly</Label>
                  <p className="text-xs text-muted-foreground">Only show pet-friendly properties</p>
                </div>
                <Switch
                  checked={filters.petFriendly === true}
                  onCheckedChange={(checked) => updateFilter("petFriendly", checked ? true : null)}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
                <Button 
                  onClick={() => {
                    setShowMoreFilters(false);
                    onSearch();
                  }}
                  className="flex-1"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};

export default PropertyFilters;
