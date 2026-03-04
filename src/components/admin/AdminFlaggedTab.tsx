import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Trash2, Flag, AlertTriangle, Star } from "lucide-react";

interface FlaggedContent {
  _id: string;
  reviewer: { fullName: string; email: string };
  text: string;
  rating: number;
  createdAt: string;
}

interface Props {
  items: FlaggedContent[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onDelete: (id: string) => void;
}

const AdminFlaggedTab = ({ items, searchQuery, onSearchChange, onDelete }: Props) => {
  const filtered = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    return item.text?.toLowerCase().includes(q) || item.reviewer?.fullName?.toLowerCase().includes(q);
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" /> Flagged Content
          </CardTitle>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search flagged content..."
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
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No flagged content</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div key={item._id} className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">Flagged Review</Badge>
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < item.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm">{item.text}</p>
                    <p className="text-xs text-muted-foreground">
                      By: {item.reviewer?.fullName} ({item.reviewer?.email})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => onDelete(item._id)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminFlaggedTab;
