import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Vote, Calendar, Users, ChevronRight, Search, Clock, User } from "lucide-react";
import { useWallet } from "@/lib/WalletContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Election {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: string;
  candidateCount?: number;
  voteCount?: number;
}

export default function UserDashboard() {
  const { voterId, isConnected, connect } = useWallet();
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [voterIdInput, setVoterIdInput] = useState("");

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const { data: electionsData, error } = await supabase
        .from('elections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const electionsWithCounts = await Promise.all(
        (electionsData || []).map(async (election) => {
          const { count: candidateCount } = await supabase
            .from('candidates')
            .select('*', { count: 'exact', head: true })
            .eq('election_id', election.id);

          const { count: voteCount } = await supabase
            .from('votes')
            .select('*', { count: 'exact', head: true })
            .eq('election_id', election.id);

          // Calculate status based on dates
          const now = new Date();
          const start = new Date(election.start_date);
          const end = new Date(election.end_date);
          let status = election.status;
          if (now < start) status = 'upcoming';
          else if (now > end) status = 'completed';
          else status = 'active';

          return {
            ...election,
            status,
            candidateCount: candidateCount || 0,
            voteCount: voteCount || 0,
          };
        })
      );

      setElections(electionsWithCounts);
    } catch (error) {
      console.error('Error fetching elections:', error);
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

  const filteredElections = elections.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-2">Elections</h1>
          <p className="text-muted-foreground">Browse and participate in active elections</p>
        </div>

        {!isConnected && (
          <Button variant="civic" onClick={() => setShowConnectDialog(true)}>
            <User className="w-4 h-4" />
            Connect Voter ID
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search elections..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Elections Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-64 animate-pulse bg-muted" />
          ))}
        </div>
      ) : filteredElections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredElections.map((election) => (
            <Card
              key={election.id}
              className="group p-6 bg-card border-border hover:shadow-civic transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <Badge variant="outline" className={`${getStatusColor(election.status)} border`}>
                  {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
                </Badge>
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <Users className="w-4 h-4" />
                  <span>{election.voteCount} votes</span>
                </div>
              </div>

              <h3 className="text-xl font-serif font-semibold text-primary mb-2 group-hover:text-accent transition-colors line-clamp-2">
                {election.title}
              </h3>
              
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {election.description}
              </p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(election.start_date), 'MMM d')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{format(new Date(election.end_date), 'MMM d, yyyy')}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Vote className="w-4 h-4" />
                <span>{election.candidateCount} candidates</span>
              </div>

              <Link href={`/election/${election.id}`}>
                <Button
                  variant={election.status === 'active' ? 'civic' : 'outline'}
                  className="w-full"
                >
                  {election.status === 'active' ? 'Vote Now' : election.status === 'upcoming' ? 'View Details' : 'View Results'}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Vote className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No elections found</h3>
          <p className="text-muted-foreground">Check back soon for new elections</p>
        </div>
      )}

      {/* Connect Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Connect Your Voter ID</DialogTitle>
            <DialogDescription>
              Enter your unique voter ID to participate in elections
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
              Connect
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
