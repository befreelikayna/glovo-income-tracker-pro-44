
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
      console.log('Fetching earnings...');
      const { data, error } = await supabase
        .from('earnings')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Earnings fetched successfully:', data?.length || 0);
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

  const addEarning = async (dailyAmount: number, cashAmount: number, selectedDate?: string) => {
    try {
      console.log('Adding earning:', { dailyAmount, cashAmount, selectedDate });
      const targetDate = selectedDate || new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('earnings')
        .insert({
          date: targetDate,
          daily_amount: dailyAmount,
          cash_amount: cashAmount
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          console.log('Updating existing record for date:', targetDate);
          // Update existing record for the date
          const { data: updateData, error: updateError } = await supabase
            .from('earnings')
            .update({
              daily_amount: dailyAmount,
              cash_amount: cashAmount,
              updated_at: new Date().toISOString()
            })
            .eq('date', targetDate)
            .select()
            .single();

          if (updateError) throw updateError;
          
          setEarnings(prev => prev.map(earning => 
            earning.date === targetDate ? updateData : earning
          ));
          
          toast({
            title: "Success",
            description: `Earnings for ${targetDate} updated successfully!`,
          });
        } else {
          throw error;
        }
      } else {
        setEarnings(prev => [data, ...prev.filter(e => e.date !== targetDate)].sort((a, b) => b.date.localeCompare(a.date)));
        toast({
          title: "Success",
          description: "Earnings saved successfully!",
        });
      }
      
      // Refresh the data to ensure consistency
      await fetchEarnings();
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
      console.log('Deleting earning:', earningId);
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
    console.log('useEarnings hook initialized');
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
