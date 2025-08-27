-- Create profiles table that mirrors auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  credits integer NOT NULL DEFAULT 5, -- Start with 5 free credits
  free_generations_used integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create credits table for tracking credit balance
CREATE TABLE IF NOT EXISTS public.credits (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance integer NOT NULL DEFAULT 5, -- 5 free credits on signup
  updated_at timestamptz DEFAULT now()
);

-- Create generations table for tracking all image generations
CREATE TABLE IF NOT EXISTS public.generations (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('openai', 'google')),
  model text NOT NULL, -- e.g., 'dall-e-3', 'gemini-2.5-flash-image-preview', 'imagen-4'
  mode text NOT NULL CHECK (mode IN ('txt2img', 'img2img')),
  prompt text NOT NULL,
  credits_used integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Create demo_payments table for tracking demo payments
CREATE TABLE IF NOT EXISTS public.demo_payments (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_added integer NOT NULL,
  amount_cents integer NOT NULL DEFAULT 500, -- $5.00 default
  created_at timestamptz DEFAULT now()
);

-- Create credit_packs table for different pricing options
CREATE TABLE IF NOT EXISTS public.credit_packs (
  id serial PRIMARY KEY,
  name text NOT NULL,
  credits integer NOT NULL,
  price_cents integer NOT NULL,
  description text,
  popular boolean DEFAULT false,
  active boolean DEFAULT true
);

-- Insert default credit packs
INSERT INTO public.credit_packs (name, credits, price_cents, description, popular) VALUES
  ('Starter', 100, 500, '100 credits for casual use', false),
  ('Pro', 500, 2000, '500 credits - Best value!', true),
  ('Business', 2000, 7500, '2000 credits for power users', false),
  ('Enterprise', 10000, 30000, '10000 credits with priority support', false);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_packs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- RLS Policies for credits
CREATE POLICY "Users can view own credits" 
  ON public.credits FOR SELECT 
  USING (auth.uid() = user_id);

-- RLS Policies for generations
CREATE POLICY "Users can view own generations" 
  ON public.generations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generations" 
  ON public.generations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for demo_payments
CREATE POLICY "Users can view own payments" 
  ON public.demo_payments FOR SELECT 
  USING (auth.uid() = user_id);

-- RLS Policies for credit_packs (public read)
CREATE POLICY "Anyone can view active credit packs" 
  ON public.credit_packs FOR SELECT 
  USING (active = true);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, credits)
  VALUES (new.id, new.email, 5)
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert initial credits
  INSERT INTO public.credits (user_id, balance)
  VALUES (new.id, 5)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

-- RPC function to atomically add credits
CREATE OR REPLACE FUNCTION public.add_credits(p_user_id uuid, p_delta int)
RETURNS void AS $$
BEGIN
  -- Update credits table
  UPDATE public.credits
  SET balance = GREATEST(0, balance + p_delta), 
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Also update profiles table for consistency
  UPDATE public.profiles
  SET credits = GREATEST(0, credits + p_delta)
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to atomically consume credits
CREATE OR REPLACE FUNCTION public.consume_credit(p_user_id uuid, p_amount int DEFAULT 1)
RETURNS boolean AS $$
DECLARE 
  v_success boolean;
BEGIN
  -- Try to deduct credits
  UPDATE public.credits
  SET balance = balance - p_amount, 
      updated_at = now()
  WHERE user_id = p_user_id AND balance >= p_amount;
  
  GET DIAGNOSTICS v_success = ROW_COUNT > 0;
  
  IF v_success THEN
    -- Also update profiles table
    UPDATE public.profiles
    SET credits = GREATEST(0, credits - p_amount)
    WHERE id = p_user_id;
  END IF;
  
  RETURN v_success;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to get user credits
CREATE OR REPLACE FUNCTION public.get_user_credits(p_user_id uuid)
RETURNS integer AS $$
DECLARE
  v_balance integer;
BEGIN
  SELECT balance INTO v_balance
  FROM public.credits
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(v_balance, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON public.generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON public.generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_demo_payments_user_id ON public.demo_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_credits_user_id ON public.credits(user_id);