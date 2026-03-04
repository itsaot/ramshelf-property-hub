import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ShieldCheck, CreditCard, Search } from "lucide-react";
import { checksApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface CreditCheck {
  _id: string;
  tenant: string;
  score: number;
  createdAt: string;
}

interface BackgroundCheck {
  _id: string;
  tenant: string;
  passed: boolean;
  notes: string;
  createdAt: string;
}

const AdminChecksTab = () => {
  const { toast } = useToast();
  const [tenantId, setTenantId] = useState("");
  const [creditScore, setCreditScore] = useState("");
  const [bgPassed, setBgPassed] = useState(true);
  const [bgNotes, setBgNotes] = useState("");
  const [lookupId, setLookupId] = useState("");
  const [results, setResults] = useState<{ credit: CreditCheck[]; background: BackgroundCheck[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreditCheck = async () => {
    if (!tenantId || !creditScore) return;
    const res = await checksApi.runCreditCheck(tenantId, Number(creditScore));
    if (res.error) {
      toast({ variant: "destructive", title: "Error", description: res.error });
    } else {
      toast({ title: "Success", description: "Credit check completed" });
      setCreditScore("");
    }
  };

  const handleBackgroundCheck = async () => {
    if (!tenantId) return;
    const res = await checksApi.runBackgroundCheck(tenantId, bgPassed, bgNotes);
    if (res.error) {
      toast({ variant: "destructive", title: "Error", description: res.error });
    } else {
      toast({ title: "Success", description: "Background check completed" });
      setBgNotes("");
    }
  };

  const handleLookup = async () => {
    if (!lookupId) return;
    setLoading(true);
    const res = await checksApi.getChecks(lookupId);
    if (res.error) {
      toast({ variant: "destructive", title: "Error", description: res.error });
    } else {
      setResults(res.data as any);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Run Checks */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4" /> Run Credit Check
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tenant ID</Label>
              <Input value={tenantId} onChange={(e) => setTenantId(e.target.value)} placeholder="Enter tenant ID" />
            </div>
            <div className="space-y-2">
              <Label>Credit Score</Label>
              <Input type="number" value={creditScore} onChange={(e) => setCreditScore(e.target.value)} placeholder="e.g. 650" />
            </div>
            <Button onClick={handleCreditCheck} className="w-full">Submit Credit Check</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4" /> Run Background Check
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tenant ID</Label>
              <Input value={tenantId} onChange={(e) => setTenantId(e.target.value)} placeholder="Enter tenant ID" />
            </div>
            <div className="flex items-center gap-2">
              <Label>Passed</Label>
              <Switch checked={bgPassed} onCheckedChange={setBgPassed} />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={bgNotes} onChange={(e) => setBgNotes(e.target.value)} placeholder="Optional notes..." />
            </div>
            <Button onClick={handleBackgroundCheck} className="w-full">Submit Background Check</Button>
          </CardContent>
        </Card>
      </div>

      {/* Lookup */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lookup Tenant Checks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={lookupId} onChange={(e) => setLookupId(e.target.value)} placeholder="Tenant ID" className="pl-10" />
            </div>
            <Button onClick={handleLookup} disabled={loading}>
              {loading ? "Loading..." : "Lookup"}
            </Button>
          </div>

          {results && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Credit Checks ({results.credit.length})</h4>
                {results.credit.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No credit checks found</p>
                ) : (
                  results.credit.map((c) => (
                    <div key={c._id} className="flex items-center justify-between p-3 border rounded-lg mb-2">
                      <div>
                        <span className="font-medium">Score: {c.score}</span>
                        <p className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={c.score >= 600 ? "default" : "destructive"}>
                        {c.score >= 600 ? "Good" : "Low"}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
              <div>
                <h4 className="font-medium mb-2">Background Checks ({results.background.length})</h4>
                {results.background.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No background checks found</p>
                ) : (
                  results.background.map((b) => (
                    <div key={b._id} className="flex items-center justify-between p-3 border rounded-lg mb-2">
                      <div>
                        <span className="font-medium">{b.passed ? "Passed" : "Failed"}</span>
                        {b.notes && <p className="text-sm text-muted-foreground">{b.notes}</p>}
                        <p className="text-xs text-muted-foreground">{new Date(b.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={b.passed ? "default" : "destructive"}>
                        {b.passed ? "✓ Passed" : "✗ Failed"}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminChecksTab;
