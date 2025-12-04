import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, MapPin, BedDouble, Bath, Building2 } from "lucide-react";
import { rentalsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { getUser } from "@/lib/auth";

const LandlordProperties = () => {
  const { toast } = useToast();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    price: "",
    images: [] as string[],
    mapUrl: "",
    bedrooms: "",
    bathrooms: "",
    garageSpaces: "",
    parkingSpaces: "",
    furnished: false,
    petFriendly: false,
    available: true,
  });

  const [imageInput, setImageInput] = useState("");

  const currentUser = getUser();
  const currentUserId = (currentUser as any)?._id || (currentUser as any)?.id;

  const myProperties = properties.filter((property) => {
    const landlord = (property as any).landlord;
    const landlordId =
      (landlord && (landlord._id || landlord.id)) || landlord;

    if (!currentUserId || !landlordId) return false;

    return String(landlordId) === String(currentUserId);
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    const response = await rentalsApi.getMy();
    
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const trimmed = searchQuery.trim();
    const response = trimmed
      ? await rentalsApi.searchMy(trimmed)
      : await rentalsApi.getMy();

    if (response.error) {
      toast({
        variant: "destructive",
        title: "Search failed",
        description: response.error,
      });
    } else {
      setProperties((response.data as any) || []);
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Build the exact payload structure required by the API
    const propertyData = {
      title: formData.title,
      description: formData.description,
      address: formData.address,
      price: parseFloat(formData.price), // Ensure it's a number
      images: formData.images, // Array of strings
      mapUrl: formData.mapUrl.trim() || undefined,
      bedrooms: formData.bedrooms ? parseInt(formData.bedrooms, 10) : undefined,
      bathrooms: formData.bathrooms ? parseInt(formData.bathrooms, 10) : undefined,
      garageSpaces: formData.garageSpaces ? parseInt(formData.garageSpaces, 10) : undefined,
      parkingSpaces: formData.parkingSpaces ? parseInt(formData.parkingSpaces, 10) : undefined,
      furnished: formData.furnished,
      petFriendly: formData.petFriendly,
      available: formData.available,
    };

    // Log the request body for debugging
    console.log("🏠 [Property Form] Submitting property:", JSON.stringify(propertyData, null, 2));
    console.log("🏠 [Property Form] Price type:", typeof propertyData.price);
    console.log("🏠 [Property Form] Images type:", Array.isArray(propertyData.images) ? "array" : typeof propertyData.images);

    const response = editingProperty
      ? await rentalsApi.update(editingProperty._id, propertyData)
      : await rentalsApi.create(propertyData);

    if (response.error) {
      toast({
        variant: "destructive",
        title: editingProperty ? "Update failed" : "Create failed",
        description: response.error,
      });
    } else {
      toast({
        title: "Success",
        description: editingProperty
          ? "Property updated successfully"
          : "Property created successfully",
      });
      
      setDialogOpen(false);
      resetForm();
      fetchProperties();
    }

    setLoading(false);
  };

  const handleAddImage = () => {
    if (imageInput.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, imageInput.trim()],
      });
      setImageInput("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;

    const response = await rentalsApi.delete(id);

    if (response.error) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: response.error,
      });
    } else {
      toast({
        title: "Property deleted",
        description: "The property has been removed.",
      });
      fetchProperties();
    }
  };

  const handleEdit = (property: any) => {
    setEditingProperty(property);
    setFormData({
      title: property.title,
      description: property.description,
      address: property.address || property.location || "",
      price: property.price?.toString() || "",
      images: property.images || [],
      mapUrl: property.mapUrl || "",
      bedrooms: property.bedrooms?.toString() || "",
      bathrooms: property.bathrooms?.toString() || "",
      garageSpaces: property.garageSpaces?.toString() || "",
      parkingSpaces: property.parkingSpaces?.toString() || "",
      furnished: Boolean(property.furnished),
      petFriendly: Boolean(property.petFriendly),
      available: property.available !== false,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingProperty(null);
    setFormData({
      title: "",
      description: "",
      address: "",
      price: "",
      images: [],
      mapUrl: "",
      bedrooms: "",
      bathrooms: "",
      garageSpaces: "",
      parkingSpaces: "",
      furnished: false,
      petFriendly: false,
      available: true,
    });
    setImageInput("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Properties</h1>
            <p className="text-muted-foreground">Manage your property listings</p>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder="Search in my rentals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" variant="outline">
                Search
              </Button>
            </form>

            <Dialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProperty ? "Edit Property" : "Add New Property"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Property Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Modern 2BR Apartment in City Center"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your property, amenities, and unique features..."
                    rows={5}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Full Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Street, City, Province, Postal Code"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Daily Cost (R) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g., 12000"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      min="0"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                      placeholder="e.g., 2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      min="0"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                      placeholder="e.g., 1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="garageSpaces">Garage Spaces</Label>
                    <Input
                      id="garageSpaces"
                      type="number"
                      min="0"
                      value={formData.garageSpaces}
                      onChange={(e) => setFormData({ ...formData, garageSpaces: e.target.value })}
                      placeholder="e.g., 1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parkingSpaces">Parking Spaces</Label>
                    <Input
                      id="parkingSpaces"
                      type="number"
                      min="0"
                      value={formData.parkingSpaces}
                      onChange={(e) => setFormData({ ...formData, parkingSpaces: e.target.value })}
                      placeholder="e.g., 2"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mapUrl">Map URL (optional)</Label>
                  <Input
                    id="mapUrl"
                    value={formData.mapUrl}
                    onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
                    placeholder="Paste a Google Maps share link"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <Label htmlFor="furnished">Furnished</Label>
                      <p className="text-xs text-muted-foreground">Is this property fully or partly furnished?</p>
                    </div>
                    <Switch
                      id="furnished"
                      checked={formData.furnished}
                      onCheckedChange={(checked) => setFormData({ ...formData, furnished: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <Label htmlFor="petFriendly">Pet friendly</Label>
                      <p className="text-xs text-muted-foreground">Are pets allowed?</p>
                    </div>
                    <Switch
                      id="petFriendly"
                      checked={formData.petFriendly}
                      onCheckedChange={(checked) => setFormData({ ...formData, petFriendly: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <Label htmlFor="available">Available</Label>
                      <p className="text-xs text-muted-foreground">Toggle if this listing is currently bookable.</p>
                    </div>
                    <Switch
                      id="available"
                      checked={formData.available}
                      onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Property Images</Label>
                  <div className="flex gap-2">
                    <Input
                      value={imageInput}
                      onChange={(e) => setImageInput(e.target.value)}
                      placeholder="Enter image URL"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImage();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddImage}
                    >
                      Add
                    </Button>
                  </div>
                  {formData.images.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {formData.images.map((url, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 bg-muted rounded-md"
                        >
                          <span className="text-sm flex-1 truncate">{url}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveImage(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Add image URLs one at a time. Press Enter or click Add.
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Saving..." : editingProperty ? "Update Property" : "List Property"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading properties...</p>
          </div>
        ) : myProperties.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">You haven't listed any properties yet</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Property
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {myProperties.map((property) => (
              <Card key={property._id} className="hover-lift flex flex-col h-full">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{property.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 flex-1 flex flex-col">
                  <div className="flex items-center text-muted-foreground text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="line-clamp-1">{property.address || property.location}</span>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {property.description}
                  </p>

                  {property.images && property.images.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {property.images.length} image{property.images.length !== 1 ? 's' : ''}
                    </p>
                  )}

                  <div className="mt-auto text-2xl font-bold text-primary">
                    R {property.price.toLocaleString('en-ZA')}
                    <span className="text-sm font-normal">/Day</span>
                  </div>
                </CardContent>
                <CardFooter className="mt-auto flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(property)}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(property._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LandlordProperties;
