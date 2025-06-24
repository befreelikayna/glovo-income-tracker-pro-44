
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Earning {
  id: string;
  date: string;
  daily_amount: number;
  cash_amount: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export const useEarnings = () => {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEarnings = async () => {
    try {
      const { data, error } = await supabase
        .from('earnings')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setEarnings(data || []);
    } catch (error) {
      console.error('Error fetching earnings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch earnings data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addEarning = async (dailyAmount: number, cashAmount: number) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('earnings')
        .insert({
          date: today,
          daily_amount: dailyAmount,
          cash_amount: cashAmount
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          // Update existing record for today
          const { data: updateData, error: updateError } = await supabase
            .from('earnings')
            .update({
              daily_amount: dailyAmount,
              cash_amount: cashAmount,
              updated_at: new Date().toISOString()
            })
            .eq('date', today)
            .select()
            .single();

          if (updateError) throw updateError;
          
          setEarnings(prev => prev.map(earning => 
            earning.date === today ? updateData : earning
          ));
          
          toast({
            title: "Success",
            description: "Today's earnings updated successfully!",
          });
        } else {
          throw error;
        }
      } else {
        setEarnings(prev => [data, ...prev]);
        toast({
          title: "Success",
          description: "Earnings saved successfully!",
        });
      }
    } catch (error) {
      console.error('Error saving earnings:', error);
      toast({
        title: "Error",
        description: "Failed to save earnings",
        variant: "destructive",
      });
    }
  };

  const deleteEarning = async (earningId: string) => {
    try {
      const { error } = await supabase
        .from('earnings')
        .delete()
        .eq('id', earningId);

      if (error) throw error;
      
      setEarnings(prev => prev.filter(earning => earning.id !== earningId));
      toast({
        title: "Success",
        description: "Earning deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting earning:', error);
      toast({
        title: "Error",
        description: "Failed to delete earning",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  return {
    earnings,
    loading,
    addEarning,
    deleteEarning,
    refetch: fetchEarnings
  };
};
