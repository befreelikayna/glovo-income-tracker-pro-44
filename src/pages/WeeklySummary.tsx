
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MoreVertical, Calendar, TrendingUp, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import NavigationBar from "@/components/NavigationBar";
import { useEarnings } from "@/hooks/useEarnings";
import { useSettings } from "@/hooks/useSettings";
import { useHistoricalSummaries } from "@/hooks/useHistoricalSummaries";
import { useMonthlyTargets } from "@/hooks/useMonthlyTargets";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval } from "date-fns";

const WeeklySummary = () => {
  const { earnings } = useEarnings();
  const { settings } = useSettings();
  const { saveSummary } = useHistoricalSummaries();
  const { getCurrentTarget } = useMonthlyTargets();
  const [selectedWeek, setSelectedWeek] = useState(0);

  const getWeekData = (weekOffset: number) => {
    const today = new Date();
    const weekStart = startOfWeek(new Date(today.getTime() - weekOffset * 7 * 24 * 60 * 60 * 1000), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    
    const weekEarnings = earnings.filter(earning => 
      isWithinInterval(new Date(earning.date), { start: weekStart, end: weekEnd })
    );

    const dailyEarnings = eachDayOfInterval({ start: weekStart, end: weekEnd }).map(day => {
      const dayEarning = weekEarnings.find(e => e.date === format(day, 'yyyy-MM-dd'));
      return {
        date: format(day, 'yyyy-MM-dd'),
        displayDate: format(day, 'EEE, MMM d'),
        daily_amount: dayEarning?.daily_amount || 0,
        cash_amount: dayEarning?.cash_amount || 0,
        total_amount: dayEarning?.total_amount || 0
      };
    });

    const totalIncome = weekEarnings.reduce((sum, earning) => sum + earning.total_amount, 0);
    
    if (!settings) return { weekStart, weekEnd, totalIncome, dailyEarnings, calculations: null };

    const rentDeduction = settings.rent / 4;
    const motorcycleDeduction = settings.motorcycle / 4;
    const taxDeduction = settings.tax / 4;
    const woltFee = totalIncome * (settings.wolt_rate / 100);
    const netIncome = totalIncome - rentDeduction - motorcycleDeduction - taxDeduction - woltFee;

    return {
      weekStart,
      weekEnd,
      totalIncome,
      dailyEarnings,
      calculations: {
        rentDeduction,
        motorcycleDeduction,
        taxDeduction,
        woltFee,
        netIncome
      }
    };
  };

  const currentWeek = getWeekData(selectedWeek);
  const monthlyTarget = getCurrentTarget();
  
  const handleSaveToHistory = async () => {
    if (!currentWeek.calculations) return;
    
    const weekLabel = `Week ${format(currentWeek.weekStart, 'MMM d')} - ${format(currentWeek.weekEnd, 'MMM d, yyyy')}`;
    
    await saveSummary({
      period_type: 'week',
      period_label: weekLabel,
      start_date: format(currentWeek.weekStart, 'yyyy-MM-dd'),
      end_date: format(currentWeek.weekEnd, 'yyyy-MM-dd'),
      total_income: currentWeek.totalIncome,
      rent_deduction: currentWeek.calculations.rentDeduction,
      motorcycle_deduction: currentWeek.calculations.motorcycleDeduction,
      tax_deduction: currentWeek.calculations.taxDeduction,
      wolt_fee: currentWeek.calculations.woltFee,
      net_income: currentWeek.calculations.netIncome
    });
  };

  return (
    <div className="min-h-screen bg-glovo-light">
      {/* Header */}
      <div className="glovo-gradient p-4 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <Link to="/">
            <ArrowLeft className="w-6 h-6 text-glovo-dark" />
          </Link>
          <MoreVertical className="w-6 h-6 text-glovo-dark" />
        </div>
        
        <h1 className="text-2xl font-bold text-glovo-dark mb-6">Weekly Summary</h1>

        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={() => setSelectedWeek(selectedWeek + 1)}
            variant="outline"
            size="sm"
            className="bg-white/80"
          >
            Previous
          </Button>
          <div className="text-center">
            <p className="text-sm text-glovo-dark/70">
              {format(currentWeek.weekStart, 'MMM d')} - {format(currentWeek.weekEnd, 'MMM d, yyyy')}
            </p>
            {selectedWeek === 0 && <p className="text-xs text-glovo-dark/60">Current Week</p>}
          </div>
          <Button
            onClick={() => setSelectedWeek(Math.max(0, selectedWeek - 1))}
            variant="outline"
            size="sm"
            className="bg-white/80"
            disabled={selectedWeek === 0}
          >
            Next
          </Button>
        </div>

        {/* Daily Earnings */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-glovo-dark mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Daily Earnings
          </h2>
          <div className="space-y-2">
            {currentWeek.dailyEarnings.map((day) => (
              <Card key={day.date} className="p-3 bg-white/80 backdrop-blur border-0">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-glovo-dark">
                    {day.displayDate}
                  </span>
                  <div className="flex items-center gap-4 text-sm">
                    {day.daily_amount > 0 && (
                      <span className="text-glovo-dark">
                        Daily: {day.daily_amount} RON
                      </span>
                    )}
                    {day.cash_amount > 0 && (
                      <span className="text-glovo-dark">
                        Cash: {day.cash_amount} RON
                      </span>
                    )}
                    <span className="font-semibold text-glovo-dark">
                      Total: {day.total_amount} RON
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="space-y-4">
          <Card className="p-4 bg-white/80 backdrop-blur border-0">
            <div className="flex justify-between items-center">
              <span className="font-medium text-glovo-dark flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Total Income
              </span>
              <span className="text-xl font-bold text-glovo-dark">{currentWeek.totalIncome.toFixed(2)} RON</span>
            </div>
          </Card>

          {currentWeek.calculations && (
            <>
              <Card className="p-4 bg-white/80 backdrop-blur border-0">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-glovo-dark">Rent (Weekly)</span>
                  <span className="text-red-600 font-semibold">-{currentWeek.calculations.rentDeduction.toFixed(2)} RON</span>
                </div>
              </Card>

              <Card className="p-4 bg-white/80 backdrop-blur border-0">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-glovo-dark">Motorcycle (Weekly)</span>
                  <span className="text-red-600 font-semibold">-{currentWeek.calculations.motorcycleDeduction.toFixed(2)} RON</span>
                </div>
              </Card>

              <Card className="p-4 bg-white/80 backdrop-blur border-0">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-glovo-dark">Tax (Weekly)</span>
                  <span className="text-red-600 font-semibold">-{currentWeek.calculations.taxDeduction.toFixed(2)} RON</span>
                </div>
              </Card>

              <Card className="p-4 bg-white/80 backdrop-blur border-0">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-glovo-dark">Wolt Fee ({settings?.wolt_rate}%)</span>
                  <span className="text-red-600 font-semibold">-{currentWeek.calculations.woltFee.toFixed(2)} RON</span>
                </div>
              </Card>

              <Card className="p-4 bg-glovo-green border-0">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Net Income
                  </span>
                  <span className="text-2xl font-bold text-white">{currentWeek.calculations.netIncome.toFixed(2)} RON</span>
                </div>
              </Card>
            </>
          )}

          {monthlyTarget && (
            <Card className="p-4 bg-glovo-gold border-0">
              <div className="flex justify-between items-center">
                <span className="font-medium text-glovo-dark">Monthly Target Progress</span>
                <span className="text-glovo-dark font-semibold">
                  {monthlyTarget.target_amount.toFixed(2)} RON
                </span>
              </div>
            </Card>
          )}
        </div>

        {selectedWeek === 0 && currentWeek.calculations && (
          <div className="mt-6">
            <Button 
              onClick={handleSaveToHistory}
              className="w-full bg-glovo-dark text-white font-bold py-4 text-lg rounded-2xl"
            >
              Save to History
            </Button>
          </div>
        )}
      </div>

      <NavigationBar />
    </div>
  );
};

export default WeeklySummary;
