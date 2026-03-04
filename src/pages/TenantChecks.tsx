import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, CreditCard, Search } from "lucide-react";
import { checksApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface CreditCheckResult {
  _id: string;
  tenant: string;
  score: number;
  createdAt: string;
}

interface BackgroundCheckResult {
  _id: string;
  tenant: string;
  passed: boolean;
  notes: string;
  createdAt: string;
}

const TenantChecks = () => {
  const { toast } = useToast();

  // Credit check form
  const [creditTenantId, setCreditTenantId] = useState("");
  const [creditScore, setCreditScore] = useState("");
  const [creditSubmitting, setCreditSubmitting] = useState(false);

  // Background check form
  const [bgTenantId, setBgTenantId] = useState("");
  const [bgPassed, setBgPassed] = useState(true);
  const [bgNotes, setBgNotes] = useState("");
  const [bgSubmitting, setBgSubmitting] = useState(false);

  // Lookup
  const [lookupId, setLookupId] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [results, setResults] = useState<{
    credit: CreditCheckResult[];
    background: BackgroundCheckResult[];
  } | null>(null);

  const handleCreditCheck = async () => {
    if (!creditTenantId.trim() || !creditScore) {
      toast({ variant: "destructive", title: "Error", description: "Tenant ID and score are required" });
      return;
    }
    const score = Number(creditScore);
    if (isNaN(score) || score < 0 || score > 900) {
      toast({ variant: "destructive", title: "Error", description: "Score must be between 0 and 900" });
      return;
    }

    setCreditSubmitting(true);
    const res = await checksApi.runCreditCheck(creditTenantId.trim(), score);
    if (res.error) {
      toast({ variant: "destructive", title: "Error", description: res.error });
    } else {
      toast({ title: "Success", description: "Credit check recorded" });
      setCreditScore("");
    }
    setCreditSubmitting(false);
  };

  const handleBackgroundCheck = async () => {
    if (!bgTenantId.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Tenant ID is required" });
      return;
    }

    setBgSubmitting(true);
    const res = await checksApi.runBackgroundCheck(bgTenantId.trim(), bgPassed, bgNotes.trim() || undefined);
    if (res.error) {
      toast({ variant: "destructive", title: "Error", description: res.error });
    } else {
      toast({ title: "Success", description: "Background check recorded" });
      setBgNotes("");
    }
    setBgSubmitting(false);
  };

  const handleLookup = async () => {
    if (!lookupId.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Enter a tenant ID" });
      return;
    }
    setLookupLoading(true);
    const res = await checksApi.getChecks(lookupId.trim());
    if (res.error) {
      toast({ variant: "destructive", title: "Error", description: res.error });
    } else {
      setResults(res.data as any);
    }
    setLookupLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Tenant Checks</h1>
          <p className="text-muted-foreground">Run credit and background checks on tenants</p>
        </div>

        <Tabs defaultValue="run">
          <TabsList className="mb-6">
            <TabsTrigger value="run">Run Checks</TabsTrigger>
            <TabsTrigger value="lookup">Lookup History</TabsTrigger>
          </TabsList>

          <TabsContent value="run">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Credit Check */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" /> Credit Check
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tenant ID</Label>
                    <Input
                      value={creditTenantId}
                      onChange={(e) => setCreditTenantId(e.target.value)}
                      placeholder="Enter tenant user ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Credit Score (0-900)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="900"
                      value={creditScore}
                      onChange={(e) => setCreditScore(e.target.value)}
                      placeholder="e.g. 650"
                    />
                  </div>
                  <Button onClick={handleCreditCheck} disabled={creditSubmitting} className="w-full">
                    {creditSubmitting ? "Submitting..." : "Submit Credit Check"}
                  </Button>
                </CardContent>
              </Card>

              {/* Background Check */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" /> Background Check
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tenant ID</Label>
                    <Input
                      value={bgTenantId}
                      onChange={(e) => setBgTenantId(e.target.value)}
                      placeholder="Enter tenant user ID"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Result</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{bgPassed ? "Passed" : "Failed"}</span>
                      <Switch checked={bgPassed} onCheckedChange={setBgPassed} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes (optional)</Label>
                    <Textarea
                      value={bgNotes}
                      onChange={(e) => setBgNotes(e.target.value)}
                      placeholder="Additional notes..."
                      maxLength={500}
                    />
                  </div>
                  <Button onClick={handleBackgroundCheck} disabled={bgSubmitting} className="w-full">
                    {bgSubmitting ? "Submitting..." : "Submit Background Check"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="lookup">
            <Card>
              <CardHeader>
                <CardTitle>Lookup Tenant Check History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={lookupId}
                      onChange={(e) => setLookupId(e.target.value)}
                      placeholder="Enter tenant ID"
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={handleLookup} disabled={lookupLoading}>
                    {lookupLoading ? "Loading..." : "Search"}
                  </Button>
                </div>

                {results && (
                  <div className="space-y-6">
                    {/* Credit Results */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <CreditCard className="h-4 w-4" /> Credit Checks ({results.credit.length})
                      </h3>
                      {results.credit.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No credit checks found</p>
                      ) : (
                        <div className="space-y-2">
                          {results.credit.map((c) => (
                            <div key={c._id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div>
                                <span className="font-medium text-lg">Score: {c.score}</span>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(c.createdAt).toLocaleDateString()} at{" "}
                                  {new Date(c.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                              <Badge variant={c.score >= 600 ? "default" : "destructive"}>
                                {c.score >= 600 ? "Good Standing" : "Low Score"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Background Results */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" /> Background Checks ({results.background.length})
                      </h3>
                      {results.background.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No background checks found</p>
                      ) : (
                        <div className="space-y-2">
                          {results.background.map((b) => (
                            <div key={b._id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div>
                                <span className="font-medium">{b.passed ? "Passed" : "Failed"}</span>
                                {b.notes && (
                                  <p className="text-sm text-muted-foreground mt-1">{b.notes}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                  {new Date(b.createdAt).toLocaleDateString()} at{" "}
                                  {new Date(b.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                              <Badge variant={b.passed ? "default" : "destructive"}>
                                {b.passed ? "✓ Clear" : "✗ Failed"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TenantChecks;
