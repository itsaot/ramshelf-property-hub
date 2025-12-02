import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, BedDouble, Bath } from "lucide-react";
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
}: PropertyCardProps) => {
  return (
    <Link to={`/property/${id}`}>
      <Card className="overflow-hidden hover-lift cursor-pointer border-border/50 shadow-sm hover:shadow-md transition-all group">
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
          {type && (
            <Badge className="absolute top-3 right-3 bg-background/90 text-foreground border-border/50">
              {type}
            </Badge>
          )}
        </div>

        <CardContent className="p-5 space-y-3">
          <h3 className="font-serif font-semibold text-xl mb-1 line-clamp-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <div className="flex items-start text-muted-foreground text-sm">
            <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-1">{location}</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t border-border/50">
            <div className="flex items-center">
              <BedDouble className="h-4 w-4 mr-1.5" />
              <span>{bedrooms}</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1.5" />
              <span>{bathrooms}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-5 pt-0">
          <div className="text-2xl font-serif font-bold text-primary">
            R{price.toLocaleString('en-ZA')}
            <span className="text-sm font-sans font-normal text-muted-foreground ml-1">/month</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default PropertyCard;
