import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Activity, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface AuditLog {
  id: string;
  action: string;
  user: string;
  details: string | null;
  created_at: string;
}

export default function Logs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();

    const channel = supabase
      .channel('logs')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'audit_logs' },
        (payload) => {
          setLogs((prev) => [payload.new as AuditLog, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (data) setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('Created')) return 'bg-green-100 text-green-700';
    if (action.includes('Vote')) return 'bg-blue-100 text-blue-700';
    if (action.includes('Added')) return 'bg-purple-100 text-purple-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-primary">Audit Logs</h1>
            <p className="text-muted-foreground">System activity and event history</p>
          </div>
        </div>
        <Button variant="outline" onClick={fetchLogs} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="h-20 animate-pulse bg-muted" />
          ))}
        </div>
      ) : logs.length > 0 ? (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id} className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <Badge className={getActionColor(log.action)}>{log.action}</Badge>
                    <span className="text-sm text-muted-foreground">by {log.user}</span>
                  </div>
                  {log.details && (
                    <p className="text-sm text-foreground">{log.details}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">No Logs Yet</h3>
          <p className="text-muted-foreground">Activity will appear here as actions are performed</p>
        </Card>
      )}
    </div>
  );
}
