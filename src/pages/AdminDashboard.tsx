import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Building2,
  AlertTriangle,
  Star,
  Search,
  Trash2,
  Ban,
  AlertCircle,
  Flag,
  Eye,
} from "lucide-react";
import { adminApi, reviewsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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

interface Review {
  _id: string;
  reviewer: {
    _id: string;
    fullName: string;
    email?: string;
  };
  reviewee?: {
    _id: string;
    fullName: string;
  };
  rating: number;
  text: string;
  riskFlag?: boolean;
  flagged?: boolean;
  createdAt: string;
}

interface FlaggedContent {
  _id: string;
  reviewer: {
    fullName: string;
    email: string;
  };
  text: string;
  rating: number;
  createdAt: string;
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  
  // User action dialog
  const [actionDialog, setActionDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<'suspend' | 'warn'>('warn');
  const [actionReason, setActionReason] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    const [analyticsRes, usersRes, flaggedRes] = await Promise.all([
      adminApi.getAnalytics(),
      adminApi.getAllUsers(),
      adminApi.getFlaggedContent(),
    ]);

    if (analyticsRes.data) setAnalytics(analyticsRes.data as Analytics);
    if (usersRes.data) setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
    if (flaggedRes.data) setFlaggedContent(Array.isArray(flaggedRes.data) ? flaggedRes.data : []);
    
    setLoading(false);
  };

  const handleUserAction = async () => {
    if (!selectedUser) return;

    const response = await adminApi.updateUserStatus(
      selectedUser._id,
      actionType,
      actionReason
    );

    if (response.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: response.error,
      });
    } else {
      toast({
        title: "Success",
        description: `User ${actionType === 'suspend' ? 'suspended' : 'warned'} successfully`,
      });
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
      toast({
        variant: "destructive",
        title: "Error",
        description: response.error,
      });
    } else {
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      fetchData();
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    const response = await adminApi.deleteContent("review", reviewId);

    if (response.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: response.error,
      });
    } else {
      toast({
        title: "Success",
        description: "Review deleted successfully",
      });
      fetchData();
    }
  };

  const openActionDialog = (user: User, type: 'suspend' | 'warn') => {
    setSelectedUser(user);
    setActionType(type);
    setActionDialog(true);
  };

  const getUserName = (user: User) => {
    return user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown';
  };

  const filteredUsers = users.filter((user) => {
    const name = getUserName(user).toLowerCase();
    const email = user.email?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  const filteredFlagged = flaggedContent.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.text?.toLowerCase().includes(query) ||
      item.reviewer?.fullName?.toLowerCase().includes(query)
    );
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      case 'warned':
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">Warned</Badge>;
      default:
        return <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-500">Admin</Badge>;
      case 'landlord':
        return <Badge className="bg-blue-500">Landlord</Badge>;
      default:
        return <Badge variant="secondary">Tenant</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, properties, and content</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Analytics Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">Registered accounts</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Properties Listed</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalRentals || 0}</div>
                  <p className="text-xs text-muted-foreground">Active listings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalReviews || 0}</div>
                  <p className="text-xs text-muted-foreground">User reviews</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Flagged Content</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">
                    {flaggedContent.length}
                  </div>
                  <p className="text-xs text-muted-foreground">Requires attention</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-4 mb-8">
              <Link to="/admin/users">
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
              <Link to="/admin/properties">
                <Button variant="outline">
                  <Building2 className="h-4 w-4 mr-2" />
                  Manage Properties
                </Button>
              </Link>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="flagged">
                  Flagged Content
                  {flaggedContent.length > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {flaggedContent.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      Welcome to the admin dashboard. Use the tabs above to manage users
                      and review flagged content.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="bg-muted/50">
                        <CardContent className="pt-6">
                          <h3 className="font-semibold mb-2">Recent Activity</h3>
                          <p className="text-sm text-muted-foreground">
                            {users.length} total users registered on the platform.
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/50">
                        <CardContent className="pt-6">
                          <h3 className="font-semibold mb-2">Content Status</h3>
                          <p className="text-sm text-muted-foreground">
                            {flaggedContent.length} items require review.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <CardTitle>User Management</CardTitle>
                      <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search users..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredUsers.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          No users found
                        </p>
                      ) : (
                        filteredUsers.slice(0, 10).map((user) => (
                          <div
                            key={user._id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{getUserName(user)}</span>
                                {getRoleBadge(user.role)}
                                {getStatusBadge(user.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                              {user.phone && (
                                <p className="text-sm text-muted-foreground">{user.phone}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openActionDialog(user, 'warn')}
                              >
                                <AlertCircle className="h-4 w-4 mr-1" />
                                Warn
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-orange-600"
                                onClick={() => openActionDialog(user, 'suspend')}
                              >
                                <Ban className="h-4 w-4 mr-1" />
                                Suspend
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteUser(user._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                      {filteredUsers.length > 10 && (
                        <Link to="/admin/users">
                          <Button variant="outline" className="w-full">
                            View All Users ({filteredUsers.length})
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="flagged">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <CardTitle className="flex items-center gap-2">
                        <Flag className="h-5 w-5 text-destructive" />
                        Flagged Content
                      </CardTitle>
                      <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search flagged content..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredFlagged.length === 0 ? (
                        <div className="text-center py-8">
                          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No flagged content</p>
                        </div>
                      ) : (
                        filteredFlagged.map((item) => (
                          <div
                            key={item._id}
                            className="p-4 border border-destructive/20 rounded-lg bg-destructive/5"
                          >
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="destructive">Flagged Review</Badge>
                                  <div className="flex items-center">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-3 w-3 ${
                                          i < item.rating
                                            ? "text-yellow-500 fill-yellow-500"
                                            : "text-muted-foreground"
                                        }`}
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
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteReview(item._id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      {/* User Action Dialog */}
      <Dialog open={actionDialog} onOpenChange={setActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'suspend' ? 'Suspend User' : 'Warn User'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'suspend'
                ? 'This will suspend the user account and notify them via email.'
                : 'This will send a warning notification to the user.'}
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
            <Button variant="outline" onClick={() => setActionDialog(false)}>
              Cancel
            </Button>
            <Button
              variant={actionType === 'suspend' ? 'destructive' : 'default'}
              onClick={handleUserAction}
            >
              {actionType === 'suspend' ? 'Suspend User' : 'Send Warning'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
