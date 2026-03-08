import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { disputesApi } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { AlertTriangle, Plus, Clock, CheckCircle, XCircle } from "lucide-react";
import Navbar from "@/components/Navbar";

interface Dispute {
  _id: string;
  tenant: { _id: string; name: string; email: string } | string;
  subject: string;
  description: string;
  status: "open" | "resolved" | "rejected";
  createdAt: string;
}

const statusConfig = {
  open: { label: "Open", icon: Clock, variant: "outline" as const, className: "border-yellow-500 text-yellow-700 bg-yellow-50" },
  resolved: { label: "Resolved", icon: CheckCircle, variant: "outline" as const, className: "border-green-500 text-green-700 bg-green-50" },
  rejected: { label: "Rejected", icon: XCircle, variant: "outline" as const, className: "border-destructive text-destructive bg-red-50" },
};

const Disputes = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const user = getUser();
  const isAdmin = user?.role === "admin";

  const fetchDisputes = async () => {
    setLoading(true);
    const res = await disputesApi.getAll();
    if (res.data) setDisputes(res.data as Dispute[]);
    setLoading(false);
  };

  useEffect(() => { fetchDisputes(); }, []);

  const handleCreate = async () => {
    if (!subject.trim() || !description.trim()) {
      toast({ title: "Error", description: "Subject and description are required.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const res = await disputesApi.create({ subject, description });
    if (res.data) {
      toast({ title: "Dispute created", description: "Your dispute has been submitted." });
      setSubject("");
      setDescription("");
      setDialogOpen(false);
      fetchDisputes();
    } else {
      toast({ title: "Error", description: res.error || "Failed to create dispute.", variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handleStatusUpdate = async (id: string, status: "open" | "resolved" | "rejected") => {
    const res = await disputesApi.updateStatus(id, status);
    if (res.data) {
      toast({ title: "Status updated" });
      fetchDisputes();
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
            <h1 className="text-3xl font-serif font-bold text-foreground">Disputes</h1>
            <p className="text-muted-foreground mt-1">
              {isAdmin ? "Manage all tenant disputes" : "Submit and track your disputes"}
            </p>
          </div>
          {!isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />New Dispute</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a Dispute</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
                  <Textarea placeholder="Describe your issue in detail..." value={description} onChange={(e) => setDescription(e.target.value)} rows={5} />
                  <Button onClick={handleCreate} disabled={submitting} className="w-full">
                    {submitting ? "Submitting..." : "Submit Dispute"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {loading ? (
          <p className="text-muted-foreground text-center py-12">Loading disputes...</p>
        ) : disputes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No disputes found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {disputes.map((d) => {
              const sc = statusConfig[d.status];
              const Icon = sc.icon;
              return (
                <Card key={d._id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{d.subject}</CardTitle>
                        {isAdmin && typeof d.tenant === "object" && (
                          <p className="text-sm text-muted-foreground mt-1">
                            By: {d.tenant.name} ({d.tenant.email})
                          </p>
                        )}
                      </div>
                      <Badge variant={sc.variant} className={sc.className}>
                        <Icon className="h-3 w-3 mr-1" />{sc.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground mb-3">{d.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </span>
                      {isAdmin && (
                        <Select onValueChange={(v) => handleStatusUpdate(d._id, v as any)} defaultValue={d.status}>
                          <SelectTrigger className="w-36 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Disputes;
