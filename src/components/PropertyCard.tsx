import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, BedDouble, Bath, Car, ParkingCircle, PawPrint, Sofa } from "lucide-react";
import { Link } from "react-router-dom";

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  imageUrl?: string;
  type?: string;
  garageSpaces?: number;
  parkingSpaces?: number;
  petFriendly?: boolean;
  furnished?: boolean;
  pricingType?: "monthly" | "daily";
}

const PropertyCard = ({
  id,
  title,
  location,
  price,
  bedrooms,
  bathrooms,
  imageUrl,
  type,
  garageSpaces,
  parkingSpaces,
  petFriendly,
  furnished,
  pricingType = "monthly",
}: PropertyCardProps) => {
  const priceLabel = pricingType === "daily" ? "/day" : "/month";

  return (
    <Link to={`/property/${id}`}>
      <Card className="overflow-hidden hover-lift cursor-pointer border-border/50 shadow-sm hover:shadow-md transition-all group h-full flex flex-col">
        <div className="aspect-[4/3] bg-muted relative overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary-light">
              <span className="text-muted-foreground text-sm">No image available</span>
            </div>
          )}
          <div className="absolute top-3 right-3 flex flex-wrap gap-1.5 justify-end">
            {type && (
              <Badge className="bg-background/90 text-foreground border-border/50">
                {type}
              </Badge>
            )}
            <Badge className={pricingType === "daily" ? "bg-amber-500/90 text-white border-0" : "bg-primary/90 text-primary-foreground border-0"}>
              {pricingType === "daily" ? "Daily" : "Monthly"}
            </Badge>
            {petFriendly && (
              <Badge variant="secondary" className="bg-green-500/90 text-white border-0">
                <PawPrint className="h-3 w-3 mr-1" />
                Pets OK
              </Badge>
            )}
            {furnished && (
              <Badge variant="secondary" className="bg-blue-500/90 text-white border-0">
                <Sofa className="h-3 w-3 mr-1" />
                Furnished
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-5 space-y-3 flex-1">
          <h3 className="font-serif font-semibold text-xl mb-1 line-clamp-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <div className="flex items-start text-muted-foreground text-sm">
            <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-1">{location}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground pt-2 border-t border-border/50">
            <div className="flex items-center">
              <BedDouble className="h-4 w-4 mr-1.5 flex-shrink-0" />
              <span>{bedrooms} Beds</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1.5 flex-shrink-0" />
              <span>{bathrooms} Baths</span>
            </div>
            {(garageSpaces !== undefined && garageSpaces > 0) && (
              <div className="flex items-center">
                <Car className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>{garageSpaces} Garage</span>
              </div>
            )}
            {(parkingSpaces !== undefined && parkingSpaces > 0) && (
              <div className="flex items-center">
                <ParkingCircle className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>{parkingSpaces} Parking</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-5 pt-0 mt-auto">
          <div className="text-2xl font-serif font-bold text-primary">
            R{price.toLocaleString('en-ZA')}
            <span className="text-sm font-sans font-normal text-muted-foreground ml-1">{priceLabel}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default PropertyCard;
