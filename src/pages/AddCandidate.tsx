import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Candidate {
  id: string;
  name: string;
  party: string | null;
  bio: string | null;
}

export default function AddCandidate() {
  const { id: electionId } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [electionTitle, setElectionTitle] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    party: "",
    bio: "",
  });

  useEffect(() => {
    fetchData();
  }, [electionId]);

  const fetchData = async () => {
    try {
      const { data: election } = await supabase
        .from('elections')
        .select('title')
        .eq('id', electionId)
        .single();

      if (election) setElectionTitle(election.title);

      const { data: candidatesData } = await supabase
        .from('candidates')
        .select('*')
        .eq('election_id', electionId);

      if (candidatesData) setCandidates(candidatesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Please enter a candidate name");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('candidates')
        .insert({
          election_id: electionId,
          name: formData.name,
          party: formData.party || null,
          bio: formData.bio || null,
        });

      if (error) throw error;

      await supabase.from('audit_logs').insert({
        action: 'Candidate Added',
        user: 'Admin',
        details: `Added candidate: ${formData.name}`,
      });

      toast.success("Candidate added successfully");
      setFormData({ name: "", party: "", bio: "" });
      fetchData();
    } catch (error) {
      console.error('Error adding candidate:', error);
      toast.error("Failed to add candidate");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (candidateId: string, candidateName: string) => {
    if (!confirm(`Are you sure you want to remove ${candidateName}?`)) return;

    try {
      const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('id', candidateId);

      if (error) throw error;

      toast.success("Candidate removed");
      fetchData();
    } catch (error) {
      console.error('Error deleting candidate:', error);
      toast.error("Failed to remove candidate");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/admin/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-serif font-bold text-primary mb-2">
            Add Candidates
          </h1>
          <p className="text-muted-foreground">{electionTitle}</p>
        </div>

        {/* Existing Candidates */}
        {candidates.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="font-semibold text-primary mb-4">Current Candidates ({candidates.length})</h2>
            <div className="space-y-3">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium text-foreground">{candidate.name}</p>
                    {candidate.party && (
                      <p className="text-sm text-muted-foreground">{candidate.party}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(candidate.id, candidate.name)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Add Candidate Form */}
        <Card className="p-6">
          <h2 className="font-semibold text-primary mb-4">Add New Candidate</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Candidate Name *</Label>
              <Input
                id="name"
                placeholder="Full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="party">Party / Affiliation</Label>
              <Input
                id="party"
                placeholder="e.g., Independent, Democratic Party"
                value={formData.party}
                onChange={(e) => setFormData({ ...formData, party: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biography</Label>
              <Textarea
                id="bio"
                placeholder="Brief description of the candidate..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
              />
            </div>

            <Button type="submit" variant="civic" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Candidate
                </>
              )}
            </Button>
          </form>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/admin/dashboard">
            <Button variant="outline">Done Adding Candidates</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
