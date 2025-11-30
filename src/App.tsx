import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WalletProvider } from "@/lib/WalletContext";
import Layout from "@/components/Layout";

import Welcome from "@/pages/Welcome";
import UserDashboard from "@/pages/UserDashboard";
import ElectionDetails from "@/pages/ElectionDetails";
import VoteConfirm from "@/pages/VoteConfirm";
import VoteSuccess from "@/pages/VoteSuccess";
import Results from "@/pages/Results";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import CreateElection from "@/pages/CreateElection";
import AddCandidate from "@/pages/AddCandidate";
import Logs from "@/pages/Logs";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Welcome} />
        <Route path="/dashboard" component={UserDashboard} />
        <Route path="/election/:id" component={ElectionDetails} />
        <Route path="/vote-confirm/:electionId/:candidateId" component={VoteConfirm} />
        <Route path="/vote-success" component={VoteSuccess} />
        <Route path="/results" component={Results} />
        
        <Route path="/admin" component={AdminLogin} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/admin/create" component={CreateElection} />
        <Route path="/admin/election/:id/add-candidate" component={AddCandidate} />
        <Route path="/admin/logs" component={Logs} />
        
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default App;
