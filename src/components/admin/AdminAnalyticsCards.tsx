import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Star, AlertTriangle } from "lucide-react";

interface Props {
  totalUsers: number;
  totalRentals: number;
  totalReviews: number;
  flaggedCount: number;
}

const AdminAnalyticsCards = ({ totalUsers, totalRentals, totalReviews, flaggedCount }: Props) => (
  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalUsers}</div>
        <p className="text-xs text-muted-foreground">Registered accounts</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Properties Listed</CardTitle>
        <Building2 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalRentals}</div>
        <p className="text-xs text-muted-foreground">Active listings</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
        <Star className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalReviews}</div>
        <p className="text-xs text-muted-foreground">User reviews</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Flagged Content</CardTitle>
        <AlertTriangle className="h-4 w-4 text-destructive" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-destructive">{flaggedCount}</div>
        <p className="text-xs text-muted-foreground">Requires attention</p>
      </CardContent>
    </Card>
  </div>
);

export default AdminAnalyticsCards;
