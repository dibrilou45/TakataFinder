-- Supabase Schema for BlogEasy

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User domains table
CREATE TABLE public.user_domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  landing_page_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, domain)
);

-- Articles table
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  domain_id UUID NOT NULL REFERENCES public.user_domains(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  meta_description TEXT,
  keywords TEXT[],
  slug TEXT NOT NULL,
  author TEXT DEFAULT 'BlogEasy AI',
  publish_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  category TEXT,
  image_url TEXT,
  image_alt TEXT,
  word_count INTEGER,
  reading_time INTEGER,
  seo_score INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Article generation history
CREATE TABLE public.generation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  domain_id UUID NOT NULL REFERENCES public.user_domains(id) ON DELETE CASCADE,
  topic JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  generation_type TEXT CHECK (generation_type IN ('initial', 'daily', 'manual'))
);

-- Create indexes
CREATE INDEX idx_user_domains_user_id ON public.user_domains(user_id);
CREATE INDEX idx_articles_user_id ON public.articles(user_id);
CREATE INDEX idx_articles_domain_id ON public.articles(domain_id);
CREATE INDEX idx_articles_slug ON public.articles(slug);
CREATE INDEX idx_generation_history_user_id ON public.generation_history(user_id);
CREATE INDEX idx_generation_history_domain_id ON public.generation_history(domain_id);

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see and update their own profile
CREATE POLICY "Users can view own profile" 
  ON public.users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);

-- Users can only see and manage their own domains
CREATE POLICY "Users can view own domains" 
  ON public.user_domains FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own domains" 
  ON public.user_domains FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own domains" 
  ON public.user_domains FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own domains" 
  ON public.user_domains FOR DELETE 
  USING (auth.uid() = user_id);

-- Users can only see and manage their own articles
CREATE POLICY "Users can view own articles" 
  ON public.articles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own articles" 
  ON public.articles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own articles" 
  ON public.articles FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own articles" 
  ON public.articles FOR DELETE 
  USING (auth.uid() = user_id);

-- Users can only see their own generation history
CREATE POLICY "Users can view own generation history" 
  ON public.generation_history FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generation history" 
  ON public.generation_history FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Functions
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_domains_updated_at BEFORE UPDATE ON public.user_domains
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
