
-- Create earnings table for daily entries
CREATE TABLE public.earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  daily_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  cash_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) GENERATED ALWAYS AS (daily_amount + cash_amount) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create settings table for admin configuration
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rent DECIMAL(10,2) NOT NULL DEFAULT 400,
  motorcycle DECIMAL(10,2) NOT NULL DEFAULT 150,
  tax DECIMAL(10,2) NOT NULL DEFAULT 425,
  wolt_rate DECIMAL(5,2) NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create historical summaries table
CREATE TABLE public.historical_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('week', '2weeks', '3weeks', '4weeks', 'month')),
  period_label VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_income DECIMAL(10,2) NOT NULL,
  rent_deduction DECIMAL(10,2) NOT NULL,
  motorcycle_deduction DECIMAL(10,2) NOT NULL,
  tax_deduction DECIMAL(10,2) NOT NULL,
  wolt_fee DECIMAL(10,2) NOT NULL,
  net_income DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create monthly targets table
CREATE TABLE public.monthly_targets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  target_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(month, year)
);

-- Insert default settings
INSERT INTO public.settings (rent, motorcycle, tax, wolt_rate) 
VALUES (400, 150, 425, 10);

-- Create indexes for better performance
CREATE INDEX idx_earnings_date ON public.earnings(date);
CREATE INDEX idx_historical_summaries_period ON public.historical_summaries(period_type, start_date);
CREATE INDEX idx_monthly_targets_month_year ON public.monthly_targets(month, year);

-- Add unique constraint to prevent duplicate daily entries
ALTER TABLE public.earnings ADD CONSTRAINT unique_date UNIQUE (date);
