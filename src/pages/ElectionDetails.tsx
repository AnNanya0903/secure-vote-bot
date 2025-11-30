import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calendar, Users, CheckCircle, User } from "lucide-react";
import { useWallet } from "@/lib/WalletContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";

interface Candidate {
  id: string;
  name: string;
  party: string | null;
  bio: string | null;
  votes: number;
}

interface Election {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: string;
}

export default function ElectionDetails() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { voterId, isConnected, connect } = useWallet();
  
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [voterIdInput, setVoterIdInput] = useState("");

  useEffect(() => {
    if (id) {
      fetchElectionDetails();
    }
  }, [id, voterId]);

  const fetchElectionDetails = async () => {
    try {
      const { data: electionData, error: electionError } = await supabase
        .from('elections')
        .select('*')
        .eq('id', id)
        .single();

      if (electionError) throw electionError;

      // Calculate status
      const now = new Date();
      const start = new Date(electionData.start_date);
      const end = new Date(electionData.end_date);
      let status = electionData.status;
      if (now < start) status = 'upcoming';
      else if (now > end) status = 'completed';
      else status = 'active';

      setElection({ ...electionData, status });

      // Fetch candidates with vote counts
      const { data: candidatesData } = await supabase
        .from('candidates')
        .select('*')
        .eq('election_id', id);

      const { data: votes } = await supabase
        .from('votes')
        .select('candidate_id')
        .eq('election_id', id);

      const voteCounts: Record<string, number> = {};
      votes?.forEach((vote) => {
        voteCounts[vote.candidate_id] = (voteCounts[vote.candidate_id] || 0) + 1;
      });

      const candidatesWithVotes = (candidatesData || []).map((c) => ({
        ...c,
        votes: voteCounts[c.id] || 0,
      }));

      setCandidates(candidatesWithVotes);

      // Check if user has voted
      if (voterId) {
        const { data: existingVote } = await supabase
          .from('votes')
          .select('id')
          .eq('election_id', id)
          .eq('voter_id', voterId)
          .maybeSingle();

        setHasVoted(!!existingVote);
      }
    } catch (error) {
      console.error('Error fetching election:', error);
      toast.error('Failed to load election details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = () => {
    if (voterIdInput.trim()) {
      connect(voterIdInput.trim());
      setShowConnectDialog(false);
      setVoterIdInput("");
    }
  };

  const handleVote = () => {
    if (!isConnected) {
      setShowConnectDialog(true);
      return;
    }
    if (!selectedCandidate) {
      toast.error('Please select a candidate');
      return;
    }
    navigate(`/vote-confirm/${id}/${selectedCandidate}`);
  };

  const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'upcoming':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'completed':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-serif font-bold text-primary mb-4">Election Not Found</h1>
        <Link href="/dashboard">
          <Button variant="outline">Back to Elections</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link href="/dashboard">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Elections
        </Button>
      </Link>

      {/* Election Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="outline" className={`${getStatusColor(election.status)} border`}>
            {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
          </Badge>
          {hasVoted && (
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Voted
            </Badge>
          )}
        </div>
        
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
          {election.title}
        </h1>
        
        <p className="text-muted-foreground text-lg mb-4">{election.description}</p>
        
        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(election.start_date), 'MMM d')} - {format(new Date(election.end_date), 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{totalVotes} total votes</span>
          </div>
        </div>
      </div>

      {/* Candidates */}
      <div className="mb-8">
        <h2 className="text-2xl font-serif font-semibold text-primary mb-6">Candidates</h2>
        
        <div className="grid gap-4">
          {candidates.map((candidate) => (
            <Card
              key={candidate.id}
              className={`p-6 cursor-pointer transition-all duration-200 ${
                selectedCandidate === candidate.id
                  ? 'border-primary bg-primary/5 ring-2 ring-primary'
                  : 'border-border hover:border-primary/50'
              } ${hasVoted || election.status !== 'active' ? 'cursor-default' : ''}`}
              onClick={() => {
                if (!hasVoted && election.status === 'active') {
                  setSelectedCandidate(candidate.id);
                }
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-primary">{candidate.name}</h3>
                    {candidate.party && (
                      <Badge variant="secondary">{candidate.party}</Badge>
                    )}
                  </div>
                  {candidate.bio && (
                    <p className="text-muted-foreground mb-4">{candidate.bio}</p>
                  )}
                  
                  {/* Vote progress bar */}
                  <div>
                    <div className="flex justify-between text-sm text-muted-foreground mb-1">
                      <span>{candidate.votes} votes</span>
                      <span>{totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                {selectedCandidate === candidate.id && (
                  <div className="ml-4">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Vote Button */}
      {election.status === 'active' && !hasVoted && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
          <div className="container mx-auto">
            <Button
              variant="civic"
              size="lg"
              className="w-full md:w-auto"
              onClick={handleVote}
              disabled={!selectedCandidate}
            >
              {!isConnected ? 'Connect to Vote' : selectedCandidate ? 'Proceed to Vote' : 'Select a Candidate'}
            </Button>
          </div>
        </div>
      )}

      {/* Connect Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Connect Your Voter ID</DialogTitle>
            <DialogDescription>
              Enter your unique voter ID to cast your vote
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="voterId">Voter ID</Label>
              <Input
                id="voterId"
                placeholder="Enter your voter ID"
                value={voterIdInput}
                onChange={(e) => setVoterIdInput(e.target.value)}
              />
            </div>
            <Button variant="civic" className="w-full" onClick={handleConnect}>
              <User className="w-4 h-4" />
              Connect
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
