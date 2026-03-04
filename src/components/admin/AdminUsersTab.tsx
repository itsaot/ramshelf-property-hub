import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Trash2, Ban, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

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

interface Props {
  users: User[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onWarn: (user: User) => void;
  onSuspend: (user: User) => void;
  onDelete: (userId: string) => void;
}

const getUserName = (user: User) =>
  user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown";

const getStatusBadge = (status?: string) => {
  switch (status) {
    case "suspended":
      return <Badge variant="destructive">Suspended</Badge>;
    case "warned":
      return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">Warned</Badge>;
    default:
      return <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>;
  }
};

const getRoleBadge = (role: string) => {
  switch (role) {
    case "admin":
      return <Badge className="bg-purple-500">Admin</Badge>;
    case "landlord":
      return <Badge className="bg-blue-500">Landlord</Badge>;
    default:
      return <Badge variant="secondary">Tenant</Badge>;
  }
};

const AdminUsersTab = ({ users, searchQuery, onSearchChange, onWarn, onSuspend, onDelete }: Props) => {
  const filtered = users.filter((user) => {
    const name = getUserName(user).toLowerCase();
    const email = user.email?.toLowerCase() || "";
    const q = searchQuery.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle>User Management</CardTitle>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
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
            <p className="text-center text-muted-foreground py-8">No users found</p>
          ) : (
            filtered.slice(0, 10).map((user) => (
              <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{getUserName(user)}</span>
                    {getRoleBadge(user.role)}
                    {getStatusBadge(user.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  {user.phone && <p className="text-sm text-muted-foreground">{user.phone}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => onWarn(user)}>
                    <AlertCircle className="h-4 w-4 mr-1" /> Warn
                  </Button>
                  <Button variant="outline" size="sm" className="text-orange-600" onClick={() => onSuspend(user)}>
                    <Ban className="h-4 w-4 mr-1" /> Suspend
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => onDelete(user._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
          {filtered.length > 10 && (
            <Link to="/admin/users">
              <Button variant="outline" className="w-full">View All Users ({filtered.length})</Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminUsersTab;
