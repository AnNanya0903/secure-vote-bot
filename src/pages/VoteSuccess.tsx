import { Link, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Copy, Home, BarChart3 } from "lucide-react";
import { toast } from "sonner";

export default function VoteSuccess() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const hash = params.get('hash');

  const copyHash = () => {
    if (hash) {
      navigator.clipboard.writeText(hash);
      toast.success('Transaction hash copied to clipboard');
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-lg mx-auto">
        <Card className="p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="text-3xl font-serif font-bold text-primary mb-4">
            Vote Recorded!
          </h1>
          
          <p className="text-muted-foreground mb-8">
            Your vote has been securely recorded. Thank you for participating in this election.
          </p>

          {hash && (
            <div className="mb-8">
              <p className="text-sm text-muted-foreground mb-2">Transaction Hash</p>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <code className="flex-1 text-xs font-mono text-primary break-all text-left">
                  {hash}
                </code>
                <Button variant="ghost" size="icon" onClick={copyHash}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Save this hash to verify your vote later
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" className="w-full">
                <Home className="w-4 h-4" />
                Back to Elections
              </Button>
            </Link>
            <Link href="/results" className="flex-1">
              <Button variant="civic" className="w-full">
                <BarChart3 className="w-4 h-4" />
                View Results
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
