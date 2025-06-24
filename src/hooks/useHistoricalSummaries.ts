
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface HistoricalSummary {
  id: string;
  period_type: string;
  period_label: string;
  start_date: string;
  end_date: string;
  total_income: number;
  rent_deduction: number;
  motorcycle_deduction: number;
  tax_deduction: number;
  wolt_fee: number;
  net_income: number;
  created_at: string;
}

export const useHistoricalSummaries = () => {
  const [summaries, setSummaries] = useState<HistoricalSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSummaries = async () => {
    try {
      const { data, error } = await supabase
        .from('historical_summaries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSummaries(data || []);
    } catch (error) {
      console.error('Error fetching summaries:', error);
      toast({
        title: "Error",
        description: "Failed to fetch historical data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSummary = async (summaryData: Omit<HistoricalSummary, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('historical_summaries')
        .insert(summaryData)
        .select()
        .single();

      if (error) throw error;
      
      setSummaries(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Summary saved to history!",
      });
    } catch (error) {
      console.error('Error saving summary:', error);
      toast({
        title: "Error",
        description: "Failed to save summary",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, []);

  return {
    summaries,
    loading,
    saveSummary,
    refetch: fetchSummaries
  };
};
