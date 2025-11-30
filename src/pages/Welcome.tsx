import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Vote, Shield, Users, CheckCircle, ArrowRight, Lock, Eye } from "lucide-react";

export default function Welcome() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border text-sm font-medium text-secondary-foreground mb-8 animate-fade-in">
              <Shield className="w-4 h-4" />
              <span>Secure & Transparent Voting</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-primary mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Your Voice,{" "}
              <span className="text-accent">Secured</span> by Technology
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
              A modern platform for secure, transparent, and accessible democratic participation. 
              Every vote is encrypted, verified, and immutably recorded.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Link href="/dashboard">
                <Button variant="civic" size="xl" className="w-full sm:w-auto">
                  View Elections
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/results">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  View Results
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
              How CivicVote Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform combines modern security practices with an intuitive user experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Lock,
                title: "Verify Identity",
                description: "Securely authenticate using your unique voter ID. Your identity is verified without exposing personal data.",
              },
              {
                icon: Vote,
                title: "Cast Your Vote",
                description: "Select your preferred candidate and submit your encrypted vote to our secure system.",
              },
              {
                icon: Eye,
                title: "Track & Verify",
                description: "Receive a unique confirmation to verify your vote was recorded correctly and view real-time results.",
              },
            ].map((feature, index) => (
              <Card
                key={feature.title}
                className="p-6 bg-card border-border hover:shadow-civic transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Vote, value: "100%", label: "Vote Verification" },
              { icon: Users, value: "24/7", label: "Accessibility" },
              { icon: Shield, value: "Bank-Grade", label: "Security" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="w-16 h-16 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-accent" />
                </div>
                <p className="text-3xl font-serif font-bold text-primary mb-1">{stat.value}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground mb-4">
            Ready to Make Your Voice Heard?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join thousands of citizens participating in secure, transparent elections.
          </p>
          <Link href="/dashboard">
            <Button variant="gold" size="xl">
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
