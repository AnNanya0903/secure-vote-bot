import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Vote, Users, BarChart3, FileText, LogOut, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Election {
  id: string;
  title: string;
  status: string;
  start_date: string;
  end_date: string;
  candidateCount: number;
  voteCount: number;
}

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const [elections, setElections] = useState<Election[]>([]);
  const [stats, setStats] = useState({
    totalElections: 0,
    activeElections: 0,
    totalVotes: 0,
    totalCandidates: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (!isAdmin) {
      navigate("/admin");
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: electionsData } = await supabase
        .from('elections')
        .select('*')
        .order('created_at', { ascending: false });

      let totalVotes = 0;
      let totalCandidates = 0;
      let activeCount = 0;

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

          totalCandidates += candidateCount || 0;
          totalVotes += voteCount || 0;

          const now = new Date();
          const start = new Date(election.start_date);
          const end = new Date(election.end_date);
          let status = election.status;
          if (now < start) status = 'upcoming';
          else if (now > end) status = 'completed';
          else {
            status = 'active';
            activeCount++;
          }

          return {
            ...election,
            status,
            candidateCount: candidateCount || 0,
            voteCount: voteCount || 0,
          };
        })
      );

      setElections(electionsWithCounts);
      setStats({
        totalElections: electionsWithCounts.length,
        activeElections: activeCount,
        totalVotes,
        totalCandidates,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    navigate("/admin");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'upcoming':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Manage elections and view statistics</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/logs">
            <Button variant="outline">
              <FileText className="w-4 h-4" />
              View Logs
            </Button>
          </Link>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Elections", value: stats.totalElections, icon: Vote },
          { label: "Active Elections", value: stats.activeElections, icon: BarChart3 },
          { label: "Total Votes", value: stats.totalVotes, icon: Users },
          { label: "Candidates", value: stats.totalCandidates, icon: UserPlus },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="mb-8">
        <Link href="/admin/create">
          <Button variant="civic">
            <Plus className="w-4 h-4" />
            Create New Election
          </Button>
        </Link>
      </div>

      {/* Elections List */}
      <div>
        <h2 className="text-xl font-serif font-semibold text-primary mb-4">All Elections</h2>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-24 animate-pulse bg-muted" />
            ))}
          </div>
        ) : elections.length > 0 ? (
          <div className="space-y-4">
            {elections.map((election) => (
              <Card key={election.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-primary">{election.title}</h3>
                      <Badge className={getStatusColor(election.status)}>
                        {election.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{format(new Date(election.start_date), 'MMM d')} - {format(new Date(election.end_date), 'MMM d, yyyy')}</span>
                      <span>{election.candidateCount} candidates</span>
                      <span>{election.voteCount} votes</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/election/${election.id}/add-candidate`}>
                      <Button variant="outline" size="sm">
                        <UserPlus className="w-4 h-4" />
                        Add Candidate
                      </Button>
                    </Link>
                    <Link href={`/election/${election.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <Vote className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No Elections Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first election to get started</p>
            <Link href="/admin/create">
              <Button variant="civic">
                <Plus className="w-4 h-4" />
                Create Election
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
