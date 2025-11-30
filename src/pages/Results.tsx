import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, Trophy, ChevronRight, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Candidate {
  id: string;
  name: string;
  party: string | null;
  votes: number;
}

interface Election {
  id: string;
  title: string;
  status: string;
  candidates: Candidate[];
  totalVotes: number;
}

export default function Results() {
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResults();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('results')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        () => fetchResults()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchResults = async () => {
    try {
      const { data: electionsData } = await supabase
        .from('elections')
        .select('*')
        .order('created_at', { ascending: false });

      const results = await Promise.all(
        (electionsData || []).map(async (election) => {
          const { data: candidates } = await supabase
            .from('candidates')
            .select('*')
            .eq('election_id', election.id);

          const { data: votes } = await supabase
            .from('votes')
            .select('candidate_id')
            .eq('election_id', election.id);

          const voteCounts: Record<string, number> = {};
          votes?.forEach((vote) => {
            voteCounts[vote.candidate_id] = (voteCounts[vote.candidate_id] || 0) + 1;
          });

          const candidatesWithVotes = (candidates || [])
            .map((c) => ({
              ...c,
              votes: voteCounts[c.id] || 0,
            }))
            .sort((a, b) => b.votes - a.votes);

          // Calculate status
          const now = new Date();
          const start = new Date(election.start_date);
          const end = new Date(election.end_date);
          let status = election.status;
          if (now < start) status = 'upcoming';
          else if (now > end) status = 'completed';
          else status = 'active';

          return {
            id: election.id,
            title: election.title,
            status,
            candidates: candidatesWithVotes,
            totalVotes: votes?.length || 0,
          };
        })
      );

      setElections(results);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-2">
            Election Results
          </h1>
          <p className="text-muted-foreground">
            Real-time voting results for all elections
          </p>
        </div>
        <Button variant="outline" onClick={fetchResults} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <Card key={i} className="h-64 animate-pulse bg-muted" />
          ))}
        </div>
      ) : elections.length > 0 ? (
        <div className="space-y-6">
          {elections.map((election) => (
            <Card key={election.id} className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-serif font-semibold text-primary">
                      {election.title}
                    </h2>
                    <Badge variant="outline" className={`${getStatusColor(election.status)} border`}>
                      {election.status === 'active' ? 'Live' : election.status.charAt(0).toUpperCase() + election.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{election.totalVotes} total votes</span>
                  </div>
                </div>
                <Link href={`/election/${election.id}`}>
                  <Button variant="ghost" size="sm">
                    View Details
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                {election.candidates.map((candidate, index) => (
                  <div key={candidate.id} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {index === 0 && election.totalVotes > 0 && (
                          <Trophy className="w-5 h-5 text-amber-500" />
                        )}
                        <span className="font-medium text-primary">{candidate.name}</span>
                        {candidate.party && (
                          <Badge variant="secondary" className="text-xs">
                            {candidate.party}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {candidate.votes} votes ({election.totalVotes > 0 ? Math.round((candidate.votes / election.totalVotes) * 100) : 0}%)
                      </div>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          index === 0 ? 'bg-primary' : 'bg-primary/60'
                        }`}
                        style={{
                          width: `${election.totalVotes > 0 ? (candidate.votes / election.totalVotes) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Results Yet</h3>
          <p className="text-muted-foreground">Results will appear once elections have votes</p>
        </div>
      )}
    </div>
  );
}
