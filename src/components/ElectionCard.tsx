import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, ChevronRight, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface Candidate {
  id: string;
  name: string;
  party: string | null;
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

interface ElectionCardProps {
  election: Election;
  onVote: (election: Election) => void;
  index: number;
}

export function ElectionCard({ election, onVote, index }: ElectionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/20 text-success border-success/30';
      case 'upcoming':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'completed':
        return 'bg-muted text-muted-foreground border-muted';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const totalVotes = election.candidates?.reduce((sum, c) => sum + (c.votes || 0), 0) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="group relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
        {/* Status indicator line */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${election.status === 'active' ? 'bg-gradient-primary' : election.status === 'upcoming' ? 'bg-warning' : 'bg-muted'}`} />
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <Badge variant="outline" className={`${getStatusColor(election.status)} border font-medium`}>
              {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
            </Badge>
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <Users className="w-4 h-4" />
              <span>{totalVotes} votes</span>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {election.title}
          </h3>
          
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {election.description}
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(election.start_date), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{format(new Date(election.end_date), 'MMM d, yyyy')}</span>
            </div>
          </div>

          {/* Candidates preview */}
          {election.candidates && election.candidates.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2">Candidates</p>
              <div className="flex flex-wrap gap-2">
                {election.candidates.slice(0, 3).map((candidate) => (
                  <span
                    key={candidate.id}
                    className="px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs"
                  >
                    {candidate.name}
                  </span>
                ))}
                {election.candidates.length > 3 && (
                  <span className="px-2 py-1 rounded-md bg-secondary/50 text-muted-foreground text-xs">
                    +{election.candidates.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          <Button
            variant={election.status === 'active' ? 'hero' : 'outline'}
            className="w-full"
            onClick={() => onVote(election)}
            disabled={election.status === 'completed'}
          >
            {election.status === 'active' ? 'Cast Your Vote' : election.status === 'upcoming' ? 'View Details' : 'View Results'}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
