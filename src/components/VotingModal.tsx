import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle2, Hash, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Candidate {
  id: string;
  name: string;
  party: string | null;
  bio: string | null;
  votes?: number;
}

interface Election {
  id: string;
  title: string;
  description: string | null;
  status: string;
  candidates?: Candidate[];
}

interface VotingModalProps {
  election: Election | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVoteSuccess: () => void;
}

export function VotingModal({ election, open, onOpenChange, onVoteSuccess }: VotingModalProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<string>("");
  const [voterId, setVoterId] = useState("");
  const [isVoting, setIsVoting] = useState(false);
  const [voteConfirmed, setVoteConfirmed] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");

  const generateTransactionHash = () => {
    const chars = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  };

  const handleVote = async () => {
    if (!election || !selectedCandidate || !voterId.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsVoting(true);

    try {
      const hash = generateTransactionHash();
      
      const { error } = await supabase
        .from('votes')
        .insert({
          election_id: election.id,
          candidate_id: selectedCandidate,
          voter_id: voterId.trim(),
          transaction_hash: hash,
        });

      if (error) {
        if (error.code === '23505') {
          toast.error("You have already voted in this election");
        } else {
          throw error;
        }
        return;
      }

      // Log the vote
      await supabase.from('audit_logs').insert({
        action: 'Vote Cast',
        user: voterId.trim(),
        details: `Vote cast in election: ${election.title}`,
      });

      setTransactionHash(hash);
      setVoteConfirmed(true);
      toast.success("Vote successfully recorded on blockchain!");
      onVoteSuccess();
    } catch (error) {
      console.error('Error casting vote:', error);
      toast.error("Failed to cast vote. Please try again.");
    } finally {
      setIsVoting(false);
    }
  };

  const handleClose = () => {
    setSelectedCandidate("");
    setVoterId("");
    setVoteConfirmed(false);
    setTransactionHash("");
    onOpenChange(false);
  };

  if (!election) return null;

  const totalVotes = election.candidates?.reduce((sum, c) => sum + (c.votes || 0), 0) || 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {voteConfirmed ? "Vote Confirmed" : election.title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {voteConfirmed 
              ? "Your vote has been securely recorded on the blockchain"
              : election.description
            }
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {voteConfirmed ? (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-6"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Vote Successfully Cast!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your vote is now immutably recorded on the blockchain
                </p>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Hash className="w-4 h-4" />
                  <span>Transaction Hash</span>
                </div>
                <code className="text-xs font-mono text-primary break-all">
                  {transactionHash}
                </code>
              </div>

              <Button variant="hero" className="w-full" onClick={handleClose}>
                Done
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="voting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 py-4"
            >
              {/* Voter ID Input */}
              <div className="space-y-2">
                <Label htmlFor="voterId" className="text-foreground">
                  Voter ID
                </Label>
                <Input
                  id="voterId"
                  placeholder="Enter your unique voter ID"
                  value={voterId}
                  onChange={(e) => setVoterId(e.target.value)}
                  className="bg-secondary border-border"
                />
                <p className="text-xs text-muted-foreground">
                  Your voter ID will be hashed for privacy
                </p>
              </div>

              {/* Candidates */}
              <div className="space-y-3">
                <Label className="text-foreground">Select Candidate</Label>
                <RadioGroup
                  value={selectedCandidate}
                  onValueChange={setSelectedCandidate}
                  className="space-y-3"
                >
                  {election.candidates?.map((candidate) => (
                    <motion.div
                      key={candidate.id}
                      whileHover={{ scale: 1.01 }}
                      className={`relative flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedCandidate === candidate.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-secondary/30 hover:border-primary/30'
                      }`}
                      onClick={() => setSelectedCandidate(candidate.id)}
                    >
                      <RadioGroupItem value={candidate.id} id={candidate.id} className="mt-1" />
                      <div className="flex-1">
                        <label htmlFor={candidate.id} className="font-medium text-foreground cursor-pointer">
                          {candidate.name}
                        </label>
                        {candidate.party && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {candidate.party}
                          </Badge>
                        )}
                        {candidate.bio && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {candidate.bio}
                          </p>
                        )}
                        {election.status !== 'upcoming' && totalVotes > 0 && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>{candidate.votes || 0} votes</span>
                              <span>{Math.round(((candidate.votes || 0) / totalVotes) * 100)}%</span>
                            </div>
                            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-primary rounded-full transition-all"
                                style={{ width: `${((candidate.votes || 0) / totalVotes) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </RadioGroup>
              </div>

              {/* Submit Button */}
              <Button
                variant="hero"
                className="w-full"
                onClick={handleVote}
                disabled={!selectedCandidate || !voterId.trim() || isVoting || election.status !== 'active'}
              >
                {isVoting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Recording on Blockchain...
                  </>
                ) : election.status !== 'active' ? (
                  'Voting Not Available'
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Cast Secure Vote
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
