import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Vote, Home, BarChart3, Shield, User, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { useWallet } from "@/lib/WalletContext";
import { ChatBot } from "@/components/ChatBot";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { voterId, isConnected, disconnect } = useWallet();

  const isAdminRoute = location.startsWith("/admin");

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/dashboard", label: "Elections", icon: Vote },
    { href: "/results", label: "Results", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg civic-gradient flex items-center justify-center">
                <Vote className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-serif font-bold text-xl text-primary">
                CivicVote
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={location === link.href ? "secondary" : "ghost"}
                    className="gap-2"
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Button>
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-3">
              {isConnected ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-secondary-foreground">
                      {voterId?.slice(0, 8)}...
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={disconnect}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Link href="/dashboard">
                  <Button variant="default" className="gap-2">
                    <User className="w-4 h-4" />
                    Connect
                  </Button>
                </Link>
              )}
              <Link href="/admin">
                <Button variant="outline" size="sm" className="gap-2">
                  <Shield className="w-4 h-4" />
                  Admin
                </Button>
              </Link>
            </div>

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border animate-fade-in">
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <Button
                      variant={location === link.href ? "secondary" : "ghost"}
                      className="w-full justify-start gap-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <link.icon className="w-4 h-4" />
                      {link.label}
                    </Button>
                  </Link>
                ))}
                <div className="border-t border-border pt-2 mt-2">
                  {isConnected ? (
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="text-sm text-muted-foreground">
                        Connected: {voterId?.slice(0, 12)}...
                      </span>
                      <Button variant="ghost" size="sm" onClick={disconnect}>
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <Link href="/dashboard">
                      <Button variant="default" className="w-full gap-2">
                        <User className="w-4 h-4" />
                        Connect Voter ID
                      </Button>
                    </Link>
                  )}
                  <Link href="/admin">
                    <Button variant="outline" className="w-full mt-2 gap-2">
                      <Shield className="w-4 h-4" />
                      Admin Portal
                    </Button>
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Vote className="w-5 h-5 text-primary" />
              <span className="font-serif font-semibold text-primary">CivicVote</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Secure, transparent, and accessible democratic participation.
            </p>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} CivicVote
            </p>
          </div>
        </div>
      </footer>

      {/* AI Chatbot */}
      <ChatBot />
    </div>
  );
}
