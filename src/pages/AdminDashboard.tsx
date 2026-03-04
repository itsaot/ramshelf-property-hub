import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users, Building2 } from "lucide-react";
import { adminApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

import AdminAnalyticsCards from "@/components/admin/AdminAnalyticsCards";
import AdminUsersTab from "@/components/admin/AdminUsersTab";
import AdminRentalsTab from "@/components/admin/AdminRentalsTab";
import AdminFlaggedTab from "@/components/admin/AdminFlaggedTab";
import AdminChecksTab from "@/components/admin/AdminChecksTab";

interface Analytics {
  totalUsers: number;
  totalRentals: number;
  totalReviews: number;
}

interface User {
  _id: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  role: string;
  status?: string;
}

interface FlaggedContent {
  _id: string;
  reviewer: { fullName: string; email: string };
  text: string;
  rating: number;
  createdAt: string;
}

interface Rental {
  _id: string;
  title: string;
  address?: string;
  price?: number;
  landlord?: { fullName: string; email: string };
  createdAt: string;
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // User action dialog
  const [actionDialog, setActionDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<"suspend" | "warn">("warn");
  const [actionReason, setActionReason] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [analyticsRes, usersRes, flaggedRes, rentalsRes] = await Promise.all([
      adminApi.getAnalytics(),
      adminApi.getAllUsers(),
      adminApi.getFlaggedContent(),
      adminApi.getAllRentals(),
    ]);

    if (analyticsRes.data) setAnalytics(analyticsRes.data as Analytics);
    if (usersRes.data) setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
    if (flaggedRes.data) setFlaggedContent(Array.isArray(flaggedRes.data) ? flaggedRes.data : []);
    if (rentalsRes.data) setRentals(Array.isArray(rentalsRes.data) ? rentalsRes.data : []);
    setLoading(false);
  };

  const handleUserAction = async () => {
    if (!selectedUser) return;
    const response = await adminApi.updateUserStatus(selectedUser._id, actionType, actionReason);
    if (response.error) {
      toast({ variant: "destructive", title: "Error", description: response.error });
    } else {
      toast({ title: "Success", description: `User ${actionType === "suspend" ? "suspended" : "warned"} successfully` });
      fetchData();
    }
    setActionDialog(false);
    setSelectedUser(null);
    setActionReason("");
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    const response = await adminApi.deleteUser(userId);
    if (response.error) {
      toast({ variant: "destructive", title: "Error", description: response.error });
    } else {
      toast({ title: "Success", description: "User deleted successfully" });
      fetchData();
    }
  };

  const handleDeleteRental = async (rentalId: string) => {
    const response = await adminApi.deleteRental(rentalId);
    if (response.error) {
      toast({ variant: "destructive", title: "Error", description: response.error });
    } else {
      toast({ title: "Success", description: "Property deleted successfully" });
      fetchData();
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    const response = await adminApi.deleteContent("review", reviewId);
    if (response.error) {
      toast({ variant: "destructive", title: "Error", description: response.error });
    } else {
      toast({ title: "Success", description: "Review deleted successfully" });
      fetchData();
    }
  };

  const openActionDialog = (user: User, type: "suspend" | "warn") => {
    setSelectedUser(user);
    setActionType(type);
    setActionDialog(true);
  };

  const getUserName = (user: User) =>
    user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, properties, checks, and content</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        ) : (
          <>
            <AdminAnalyticsCards
              totalUsers={analytics?.totalUsers || 0}
              totalRentals={analytics?.totalRentals || 0}
              totalReviews={analytics?.totalReviews || 0}
              flaggedCount={flaggedContent.length}
            />

            <div className="flex gap-4 mb-8">
              <Link to="/admin/users">
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" /> Manage Users
                </Button>
              </Link>
              <Link to="/admin/properties">
                <Button variant="outline">
                  <Building2 className="h-4 w-4 mr-2" /> Manage Properties
                </Button>
              </Link>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="rentals">Properties</TabsTrigger>
                <TabsTrigger value="checks">Checks</TabsTrigger>
                <TabsTrigger value="flagged">
                  Flagged
                  {flaggedContent.length > 0 && (
                    <Badge variant="destructive" className="ml-2">{flaggedContent.length}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card>
                  <CardHeader><CardTitle>Platform Overview</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      Welcome to the admin dashboard. Use the tabs above to manage users, properties, run checks, and review flagged content.
                    </p>
                    <div className="grid md:grid-cols-3 gap-4">
                      <Card className="bg-muted/50">
                        <CardContent className="pt-6">
                          <h3 className="font-semibold mb-2">Users</h3>
                          <p className="text-sm text-muted-foreground">{users.length} registered users</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/50">
                        <CardContent className="pt-6">
                          <h3 className="font-semibold mb-2">Properties</h3>
                          <p className="text-sm text-muted-foreground">{rentals.length} listed properties</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/50">
                        <CardContent className="pt-6">
                          <h3 className="font-semibold mb-2">Flagged</h3>
                          <p className="text-sm text-muted-foreground">{flaggedContent.length} items need review</p>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users">
                <AdminUsersTab
                  users={users}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onWarn={(user) => openActionDialog(user, "warn")}
                  onSuspend={(user) => openActionDialog(user, "suspend")}
                  onDelete={handleDeleteUser}
                />
              </TabsContent>

              <TabsContent value="rentals">
                <AdminRentalsTab
                  rentals={rentals}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onDelete={handleDeleteRental}
                />
              </TabsContent>

              <TabsContent value="checks">
                <AdminChecksTab />
              </TabsContent>

              <TabsContent value="flagged">
                <AdminFlaggedTab
                  items={flaggedContent}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onDelete={handleDeleteReview}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      {/* User Action Dialog */}
      <Dialog open={actionDialog} onOpenChange={setActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionType === "suspend" ? "Suspend User" : "Warn User"}</DialogTitle>
            <DialogDescription>
              {actionType === "suspend"
                ? "This will suspend the user account and notify them."
                : "This will send a warning notification to the user."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm font-medium mb-1">User</p>
              <p className="text-muted-foreground">
                {selectedUser && getUserName(selectedUser)} ({selectedUser?.email})
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Reason</label>
              <Textarea
                placeholder="Enter reason for this action..."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(false)}>Cancel</Button>
            <Button
              variant={actionType === "suspend" ? "destructive" : "default"}
              onClick={handleUserAction}
            >
              {actionType === "suspend" ? "Suspend User" : "Send Warning"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
