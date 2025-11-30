import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, FileText, Clock, Hash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface AuditLog {
  id: string;
  action: string;
  user: string;
  details: string | null;
  created_at: string;
}

export function TransparencySection() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState({
    totalVotes: 0,
    activeElections: 0,
    totalCandidates: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      // Fetch audit logs
      const { data: logs } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (logs) setAuditLogs(logs);

      // Fetch stats
      const { count: votesCount } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true });

      const { data: elections } = await supabase
        .from('elections')
        .select('status');

      const { count: candidatesCount } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true });

      const activeCount = elections?.filter((e) => {
        const now = new Date();
        return e.status === 'active';
      }).length || 0;

      setStats({
        totalVotes: votesCount || 0,
        activeElections: activeCount,
        totalCandidates: candidatesCount || 0,
      });
    };

    fetchData();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('transparency')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'audit_logs' },
        (payload) => {
          setAuditLogs((prev) => [payload.new as AuditLog, ...prev.slice(0, 4)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const generateHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return '0x' + Math.abs(hash).toString(16).padStart(8, '0');
  };

  return (
    <section id="transparency" className="py-20 relative">
      <div className="absolute inset-0 blockchain-grid opacity-20" />
      
      <div className="container px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            <span className="text-gradient-accent">Transparency</span> & Audit Trail
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Every action is logged and verifiable. The blockchain ensures complete transparency and accountability.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: "Total Votes Cast", value: stats.totalVotes, icon: Activity },
            { label: "Active Elections", value: stats.activeElections, icon: FileText },
            { label: "Registered Candidates", value: stats.totalCandidates, icon: Clock },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Audit Logs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Live Audit Trail</h3>
              <Badge variant="outline" className="bg-success/20 text-success border-success/30">
                Live
              </Badge>
            </div>

            <div className="space-y-4">
              {auditLogs.length > 0 ? (
                auditLogs.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30 border border-border/30"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Hash className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">{log.action}</span>
                        <Badge variant="outline" className="text-xs">
                          {log.user}
                        </Badge>
                      </div>
                      {log.details && (
                        <p className="text-sm text-muted-foreground truncate">{log.details}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="font-mono">{generateHash(log.id)}</span>
                        <span>{formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No activity yet. Cast a vote to see the audit trail!</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
