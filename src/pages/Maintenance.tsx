import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { maintenanceApi } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { Wrench, Plus, Clock, Loader2, CheckCircle, MessageSquare, Send } from "lucide-react";
import Navbar from "@/components/Navbar";

interface MaintenanceMessage {
  sender: { _id: string; name: string; email: string } | string;
  text: string;
  createdAt?: string;
}

interface MaintenanceRequest {
  _id: string;
  tenant: { _id: string; name: string; email: string } | string;
  title: string;
  messages: MaintenanceMessage[];
  status: "open" | "in-progress" | "closed";
  createdAt: string;
}

const statusConfig = {
  open: { label: "Open", icon: Clock, className: "border-yellow-500 text-yellow-700 bg-yellow-50" },
  "in-progress": { label: "In Progress", icon: Loader2, className: "border-blue-500 text-blue-700 bg-blue-50" },
  closed: { label: "Closed", icon: CheckCircle, className: "border-green-500 text-green-700 bg-green-50" },
};

const Maintenance = () => {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [initialMessage, setInitialMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const { toast } = useToast();
  const user = getUser();
  const isAdmin = user?.role === "admin";

  const fetchRequests = async () => {
    setLoading(true);
    const res = await maintenanceApi.getAll();
    if (res.data) setRequests(res.data as MaintenanceRequest[]);
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleCreate = async () => {
    if (!title.trim() || !initialMessage.trim()) {
      toast({ title: "Error", description: "Title and message are required.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const res = await maintenanceApi.create({ title, initialMessage });
    if (res.data) {
      toast({ title: "Request created", description: "Your maintenance request has been submitted." });
      setTitle("");
      setInitialMessage("");
      setDialogOpen(false);
      fetchRequests();
    } else {
      toast({ title: "Error", description: res.error || "Failed to create request.", variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    setReplying(true);
    const res = await maintenanceApi.addMessage(id, replyText);
    if (res.data) {
      toast({ title: "Message sent" });
      setReplyText("");
      fetchRequests();
    } else {
      toast({ title: "Error", description: res.error || "Failed to send.", variant: "destructive" });
    }
    setReplying(false);
  };

  const handleStatusUpdate = async (id: string, status: "open" | "in-progress" | "closed") => {
    const res = await maintenanceApi.updateStatus(id, status);
    if (res.data) {
      toast({ title: "Status updated" });
      fetchRequests();
    } else {
      toast({ title: "Error", description: res.error || "Failed to update.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Maintenance</h1>
            <p className="text-muted-foreground mt-1">
              {isAdmin ? "Manage all maintenance requests" : "Submit and track maintenance requests"}
            </p>
          </div>
          {!isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />New Request</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Maintenance Request</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <Input placeholder="Title (e.g., Leaking faucet)" value={title} onChange={(e) => setTitle(e.target.value)} />
                  <Textarea placeholder="Describe the issue..." value={initialMessage} onChange={(e) => setInitialMessage(e.target.value)} rows={5} />
                  <Button onClick={handleCreate} disabled={submitting} className="w-full">
                    {submitting ? "Submitting..." : "Submit Request"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {loading ? (
          <p className="text-muted-foreground text-center py-12">Loading requests...</p>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No maintenance requests found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((r) => {
              const sc = statusConfig[r.status];
              const Icon = sc.icon;
              const isExpanded = expandedId === r._id;
              return (
                <Card key={r._id}>
                  <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : r._id)}>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {r.title}
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-normal text-muted-foreground">{r.messages.length}</span>
                        </CardTitle>
                        {isAdmin && typeof r.tenant === "object" && (
                          <p className="text-sm text-muted-foreground mt-1">By: {r.tenant.name} ({r.tenant.email})</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={sc.className}>
                          <Icon className="h-3 w-3 mr-1" />{sc.label}
                        </Badge>
                        {isAdmin && (
                          <Select onValueChange={(v) => handleStatusUpdate(r._id, v as any)} defaultValue={r.status}>
                            <SelectTrigger className="w-32 h-8 text-xs" onClick={(e) => e.stopPropagation()}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent>
                      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto border rounded-md p-3 bg-muted/30">
                        {r.messages.map((msg, i) => {
                          const senderName = typeof msg.sender === "object" ? msg.sender.name : "You";
                          return (
                            <div key={i} className="text-sm">
                              <span className="font-medium text-foreground">{senderName}: </span>
                              <span className="text-muted-foreground">{msg.text}</span>
                            </div>
                          );
                        })}
                      </div>
                      {r.status !== "closed" && (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Type a reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleReply(r._id)}
                          />
                          <Button size="icon" onClick={() => handleReply(r._id)} disabled={replying}>
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-3">
                        Created {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Maintenance;
