
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MonthlyTarget {
  id: string;
  month: number;
  year: number;
  target_amount: number;
  created_at: string;
  updated_at: string;
}

export const useMonthlyTargets = () => {
  const [targets, setTargets] = useState<MonthlyTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTargets = async () => {
    try {
      const { data, error } = await supabase
        .from('monthly_targets')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (error) throw error;
      setTargets(data || []);
    } catch (error) {
      console.error('Error fetching targets:', error);
      toast({
        title: "Error",
        description: "Failed to fetch monthly targets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setTarget = async (month: number, year: number, targetAmount: number) => {
    try {
      const { data, error } = await supabase
        .from('monthly_targets')
        .upsert({
          month,
          year,
          target_amount: targetAmount,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      setTargets(prev => {
        const filtered = prev.filter(t => !(t.month === month && t.year === year));
        return [data, ...filtered].sort((a, b) => b.year - a.year || b.month - a.month);
      });
      
      toast({
        title: "Success",
        description: "Monthly target updated successfully!",
      });
    } catch (error) {
      console.error('Error setting target:', error);
      toast({
        title: "Error",
        description: "Failed to set monthly target",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTargets();
  }, []);

  return {
    targets,
    loading,
    setTarget,
    refetch: fetchTargets
  };
};
