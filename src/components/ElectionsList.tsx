import { useState, useEffect } from "react";
import { ElectionCard } from "./ElectionCard";
import { VotingModal } from "./VotingModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

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
  start_date: string;
  end_date: string;
  status: string;
  candidates?: Candidate[];
}

export function ElectionsList() {
  const [elections, setElections] = useState<Election[]>([]);
  const [filteredElections, setFilteredElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const fetchElections = async () => {
    setIsLoading(true);
    try {
      // Fetch elections
      const { data: electionsData, error: electionsError } = await supabase
        .from('elections')
        .select('*')
        .order('created_at', { ascending: false });

      if (electionsError) throw electionsError;

      // Fetch candidates and votes for each election
      const electionsWithDetails = await Promise.all(
        (electionsData || []).map(async (election) => {
          const { data: candidates } = await supabase
            .from('candidates')
            .select('*')
            .eq('election_id', election.id);

          const { data: votes } = await supabase
            .from('votes')
            .select('candidate_id')
            .eq('election_id', election.id);

          // Count votes per candidate
          const voteCounts: Record<string, number> = {};
          votes?.forEach((vote) => {
            voteCounts[vote.candidate_id] = (voteCounts[vote.candidate_id] || 0) + 1;
          });

          // Update status based on dates
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
            candidates: candidates?.map((c) => ({
              ...c,
              votes: voteCounts[c.id] || 0,
            })),
          };
        })
      );

      setElections(electionsWithDetails);
    } catch (error) {
      console.error('Error fetching elections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('elections-votes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        () => {
          fetchElections();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    let filtered = elections;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((e) => e.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredElections(filtered);
  }, [elections, statusFilter, searchQuery]);

  const handleVote = (election: Election) => {
    setSelectedElection(election);
    setIsModalOpen(true);
  };

  return (
    <section id="elections" className="py-20">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Active <span className="text-gradient-primary">Elections</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse current and upcoming elections. Cast your vote securely using blockchain technology.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search elections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>

          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="bg-secondary">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button variant="outline" size="icon" onClick={fetchElections}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </motion.div>

        {/* Elections Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-xl bg-secondary/50 animate-pulse" />
            ))}
          </div>
        ) : filteredElections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredElections.map((election, index) => (
              <ElectionCard
                key={election.id}
                election={election}
                onVote={handleVote}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No elections found</h3>
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== 'all'
                ? "Try adjusting your filters"
                : "Check back soon for new elections"}
            </p>
          </div>
        )}

        <VotingModal
          election={selectedElection}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onVoteSuccess={fetchElections}
        />
      </div>
    </section>
  );
}
