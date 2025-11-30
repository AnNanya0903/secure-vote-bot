import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function CreateElection() {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.startDate || !formData.endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('elections')
        .insert({
          title: formData.title,
          description: formData.description,
          start_date: formData.startDate,
          end_date: formData.endDate,
          status: 'upcoming',
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from('audit_logs').insert({
        action: 'Election Created',
        user: 'Admin',
        details: `Created election: ${formData.title}`,
      });

      toast.success("Election created successfully");
      navigate(`/admin/election/${data.id}/add-candidate`);
    } catch (error) {
      console.error('Error creating election:', error);
      toast.error("Failed to create election");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/admin/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Link>

        <Card className="p-8">
          <h1 className="text-2xl font-serif font-bold text-primary mb-6">
            Create New Election
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Election Title *</Label>
              <Input
                id="title"
                placeholder="e.g., City Council Election 2025"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the election and its purpose..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" variant="civic" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Election'
                )}
              </Button>
              <Link href="/admin/dashboard">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
