import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  BedDouble, 
  Bath, 
  Home, 
  ChevronLeft, 
  Calendar, 
  Mail,
  Car,
  ParkingCircle,
  PawPrint,
  Sofa,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { rentalsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { isAuthenticated } from "@/lib/auth";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    if (!id) return;
    
    setLoading(true);
    const response = await rentalsApi.getById(id);

    if (response.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: response.error,
      });
      navigate("/");
    } else {
      setProperty(response.data);
    }
    setLoading(false);
  };

  const handleBooking = () => {
    if (!isAuthenticated()) {
      toast({
        title: "Login Required",
        description: "Please log in to book this property.",
      });
      navigate("/login");
      return;
    }
    navigate(`/payment/${id}`);
  };

  const handleContact = () => {
    toast({
      title: "Contact Landlord",
      description: "Contact functionality will be available soon!",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Property not found</p>
        </div>
      </div>
    );
  }

  // Extract mapUrl or use address for embedding
  const getMapEmbedUrl = () => {
    if (property.mapUrl) {
      // If it's already an embed URL, use it directly
      if (property.mapUrl.includes('embed') || property.mapUrl.includes('iframe')) {
        // Extract src from iframe if provided
        const srcMatch = property.mapUrl.match(/src="([^"]+)"/);
        return srcMatch ? srcMatch[1] : property.mapUrl;
      }
      // If it's a Google Maps URL, try to convert it to embed
      if (property.mapUrl.includes('google.com/maps')) {
        // Extract place or coordinates
        const placeMatch = property.mapUrl.match(/place\/([^/]+)/);
        if (placeMatch) {
          return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(placeMatch[1])}`;
        }
        // Try to extract coordinates
        const coordMatch = property.mapUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (coordMatch) {
          return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&output=embed`;
        }
      }
      // Return as-is if it seems like an embed URL
      if (property.mapUrl.includes('maps.google.com') || property.mapUrl.includes('google.com/maps')) {
        return property.mapUrl.replace('/maps?', '/maps/embed?');
      }
      return property.mapUrl;
    }
    // Fallback: use address for Google Maps embed
    if (property.address) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(property.address)}&output=embed`;
    }
    return null;
  };

  const mapEmbedUrl = getMapEmbedUrl();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {property.images && property.images.length > 0 ? (
                  <Carousel className="w-full">
                    <CarouselContent>
                      {property.images.map((image: string, index: number) => (
                        <CarouselItem key={index}>
                          <div className="aspect-video relative">
                            <img
                              src={image}
                              alt={`${property.title} - Image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {property.images.length > 1 && (
                      <>
                        <CarouselPrevious className="left-4" />
                        <CarouselNext className="right-4" />
                      </>
                    )}
                  </Carousel>
                ) : (
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <Home className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Property Info */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div>
                    <CardTitle className="text-3xl mb-2">{property.title}</CardTitle>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{property.address || property.location}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {property.type && (
                      <Badge className="text-base px-4 py-1">{property.type}</Badge>
                    )}
                    {property.petFriendly && (
                      <Badge variant="secondary" className="bg-green-500 text-white border-0 px-4 py-1">
                        <PawPrint className="h-4 w-4 mr-1" />
                        Pet Friendly
                      </Badge>
                    )}
                    {property.furnished && (
                      <Badge variant="secondary" className="bg-blue-500 text-white border-0 px-4 py-1">
                        <Sofa className="h-4 w-4 mr-1" />
                        Furnished
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Property Features Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-3">
                    <BedDouble className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{property.bedrooms || 0}</p>
                      <p className="text-xs text-muted-foreground">Bedrooms</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-3">
                    <Bath className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{property.bathrooms || 0}</p>
                      <p className="text-xs text-muted-foreground">Bathrooms</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-3">
                    <Car className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{property.garageSpaces || 0}</p>
                      <p className="text-xs text-muted-foreground">Garage</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-3">
                    <ParkingCircle className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{property.parkingSpaces || 0}</p>
                      <p className="text-xs text-muted-foreground">Parking</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-xl font-semibold mb-3">Description</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {property.description || "No description available."}
                  </p>
                </div>

                <Separator />

                {/* Property Highlights */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">Property Highlights</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      {property.furnished ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <span className={property.furnished ? "" : "text-muted-foreground"}>
                        Furnished
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {property.petFriendly ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <span className={property.petFriendly ? "" : "text-muted-foreground"}>
                        Pet Friendly
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {property.garageSpaces > 0 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <span className={property.garageSpaces > 0 ? "" : "text-muted-foreground"}>
                        Garage Available
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {property.parkingSpaces > 0 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <span className={property.parkingSpaces > 0 ? "" : "text-muted-foreground"}>
                        Parking Available
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Map Section */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">Location</h3>
                  {mapEmbedUrl ? (
                    <div className="aspect-video rounded-lg overflow-hidden border border-border">
                      <iframe
                        src={mapEmbedUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Property Location"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Map not available</p>
                        <p className="text-xs text-muted-foreground mt-1">{property.address || property.location}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price & Booking */}
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-3xl text-primary">
                  R {property.price?.toLocaleString('en-ZA') || 0}
                  <span className="text-base font-normal text-muted-foreground">/month</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleBooking}
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Request Booking
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={handleContact}
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Contact Landlord
                </Button>

                <Separator />

                <div className="text-sm text-muted-foreground space-y-2">
                  <p>✓ Verified property listing</p>
                  <p>✓ Secure booking process</p>
                  <p>✓ 24/7 customer support</p>
                </div>
              </CardContent>
            </Card>

            {/* Property Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Bedrooms</span>
                    <span className="font-medium">{property.bedrooms || 0}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Bathrooms</span>
                    <span className="font-medium">{property.bathrooms || 0}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Garage Spaces</span>
                    <span className="font-medium">{property.garageSpaces || 0}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Parking Spaces</span>
                    <span className="font-medium">{property.parkingSpaces || 0}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Furnished</span>
                    <span className="font-medium">{property.furnished ? "Yes" : "No"}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Pet Friendly</span>
                    <span className="font-medium">{property.petFriendly ? "Yes" : "No"}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
