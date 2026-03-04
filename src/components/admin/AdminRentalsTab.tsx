import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Trash2, Building2 } from "lucide-react";

interface Rental {
  _id: string;
  title: string;
  address?: string;
  price?: number;
  landlord?: { fullName: string; email: string };
  createdAt: string;
}

interface Props {
  rentals: Rental[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onDelete: (id: string) => void;
}

const AdminRentalsTab = ({ rentals, searchQuery, onSearchChange, onDelete }: Props) => {
  const filtered = rentals.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.title?.toLowerCase().includes(q) ||
      r.address?.toLowerCase().includes(q) ||
      r.landlord?.fullName?.toLowerCase().includes(q)
    );
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" /> Property Management
          </CardTitle>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No properties found</p>
          ) : (
            filtered.map((rental) => (
              <div key={rental._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <span className="font-medium">{rental.title}</span>
                  {rental.address && (
                    <p className="text-sm text-muted-foreground">{rental.address}</p>
                  )}
                  {rental.price != null && (
                    <Badge variant="outline">R{rental.price}/mo</Badge>
                  )}
                  {rental.landlord && (
                    <p className="text-xs text-muted-foreground">
                      Owner: {rental.landlord.fullName} ({rental.landlord.email})
                    </p>
                  )}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm("Delete this property?")) onDelete(rental._id);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminRentalsTab;
