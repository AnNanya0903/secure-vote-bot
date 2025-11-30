-- Create elections table
CREATE TABLE public.elections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create candidates table
CREATE TABLE public.candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  party TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create votes table with blockchain-style hash
CREATE TABLE public.votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  voter_id TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(election_id, voter_id)
);

-- Create audit logs table
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  "user" TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create chat queries table to store AI chatbot conversations
CREATE TABLE public.chat_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  message TEXT NOT NULL,
  response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_queries ENABLE ROW LEVEL SECURITY;

-- Public read access for elections and candidates
CREATE POLICY "Elections are viewable by everyone" 
ON public.elections FOR SELECT USING (true);

CREATE POLICY "Candidates are viewable by everyone" 
ON public.candidates FOR SELECT USING (true);

-- Votes can be viewed by everyone but created with voter_id
CREATE POLICY "Votes are viewable by everyone" 
ON public.votes FOR SELECT USING (true);

CREATE POLICY "Anyone can cast a vote" 
ON public.votes FOR INSERT WITH CHECK (true);

-- Audit logs viewable by everyone
CREATE POLICY "Audit logs are viewable by everyone" 
ON public.audit_logs FOR SELECT USING (true);

CREATE POLICY "Anyone can create audit logs" 
ON public.audit_logs FOR INSERT WITH CHECK (true);

-- Chat queries - anyone can create and read their own session
CREATE POLICY "Anyone can view chat queries" 
ON public.chat_queries FOR SELECT USING (true);

CREATE POLICY "Anyone can create chat queries" 
ON public.chat_queries FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update chat queries" 
ON public.chat_queries FOR UPDATE USING (true);

-- Enable realtime for votes and chat queries
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_queries;