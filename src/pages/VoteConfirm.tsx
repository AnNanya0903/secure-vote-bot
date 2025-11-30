import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, AlertTriangle, Shield, Loader2 } from "lucide-react";
import { useWallet } from "@/lib/WalletContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Candidate {
  id: string;
  name: string;
  party: string | null;
}

interface Election {
  id: string;
  title: string;
}

export default function VoteConfirm() {
  const { electionId, candidateId } = useParams<{ electionId: string; candidateId: string }>();
  const [, navigate] = useLocation();
  const { voterId } = useWallet();
  
  const [election, setElection] = useState<Election | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!voterId) {
      navigate('/dashboard');
      return;
    }
    fetchDetails();
  }, [electionId, candidateId, voterId]);

  const fetchDetails = async () => {
    try {
      const { data: electionData } = await supabase
        .from('elections')
        .select('id, title')
        .eq('id', electionId)
        .single();

      const { data: candidateData } = await supabase
        .from('candidates')
        .select('id, name, party')
        .eq('id', candidateId)
        .single();

      setElection(electionData);
      setCandidate(candidateData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateTransactionHash = () => {
    const chars = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  };

  const handleConfirmVote = async () => {
    if (!voterId || !electionId || !candidateId) return;
    
    setIsSubmitting(true);
    
    try {
      const transactionHash = generateTransactionHash();
      
      const { error } = await supabase
        .from('votes')
        .insert({
          election_id: electionId,
          candidate_id: candidateId,
          voter_id: voterId,
          transaction_hash: transactionHash,
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('You have already voted in this election');
          navigate(`/election/${electionId}`);
          return;
        }
        throw error;
      }

      // Log the vote
      await supabase.from('audit_logs').insert({
        action: 'Vote Cast',
        user: voterId,
        details: `Voted in: ${election?.title}`,
      });

      navigate(`/vote-success?hash=${transactionHash}`);
    } catch (error) {
      console.error('Error casting vote:', error);
      toast.error('Failed to cast vote. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!election || !candidate) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-serif font-bold text-primary mb-4">Error</h1>
        <Link href="/dashboard">
          <Button variant="outline">Back to Elections</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-lg mx-auto">
        {/* Back Button */}
        <Link href={`/election/${electionId}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>

        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-primary mb-2">
              Confirm Your Vote
            </h1>
            <p className="text-muted-foreground">
              Please review your selection carefully. This action cannot be undone.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Election</p>
              <p className="font-semibold text-primary">{election.title}</p>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Your Selection</p>
              <p className="font-semibold text-primary">{candidate.name}</p>
              {candidate.party && (
                <p className="text-sm text-muted-foreground">{candidate.party}</p>
              )}
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Voter ID</p>
              <p className="font-mono text-sm text-primary">{voterId}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg mb-8">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Your vote is secure</p>
              <p className="text-blue-600">
                Your vote will be encrypted and securely recorded. A unique transaction hash will be provided for verification.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              variant="civic"
              size="lg"
              onClick={handleConfirmVote}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Recording Vote...
                </>
              ) : (
                'Confirm & Submit Vote'
              )}
            </Button>
            
            <Link href={`/election/${electionId}`}>
              <Button variant="outline" className="w-full" disabled={isSubmitting}>
                Cancel
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
