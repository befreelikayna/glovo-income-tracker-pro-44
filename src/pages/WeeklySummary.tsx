
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";
import NavigationBar from "@/components/NavigationBar";
import { useEarnings } from "@/hooks/useEarnings";
import { useSettings } from "@/hooks/useSettings";
import { useHistoricalSummaries } from "@/hooks/useHistoricalSummaries";
import { useMonthlyTargets } from "@/hooks/useMonthlyTargets";

const WeeklySummary = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const { earnings, loading: earningsLoading } = useEarnings();
  const { settings, loading: settingsLoading } = useSettings();
  const { summaries, saveSummary } = useHistoricalSummaries();
  const { targets } = useMonthlyTargets();
  const [calculatedData, setCalculatedData] = useState({
    totalIncome: 0,
    deductions: {
      rent: 400,
      motorcycle: 150,
      tax: 425,
      woltFee: 0,
    },
    netIncome: 0,
    dailyEarnings: Array(7).fill(0),
  });

  const periodOptions = [
    { value: "week", label: "1 Week", multiplier: 1 },
    { value: "2weeks", label: "2 Weeks", multiplier: 2 },
    { value: "3weeks", label: "3 Weeks", multiplier: 3 },
    { value: "4weeks", label: "4 Weeks", multiplier: 4 },
    { value: "month", label: "1 Month", multiplier: 4.33 },
  ];

  useEffect(() => {
    if (earnings.length > 0 && settings) {
      calculatePeriodSummary();
    }
  }, [selectedPeriod, earnings, settings]);

  const calculatePeriodSummary = () => {
    if (!settings) return;
    
    const selectedOption = periodOptions.find(p => p.value === selectedPeriod);
    const multiplier = selectedOption?.multiplier || 1;
    
    const totalIncome = earnings.reduce((sum, earning) => sum + earning.total_amount, 0);
    const scaledIncome = totalIncome * multiplier;
    const woltFee = (scaledIncome * settings.wolt_rate) / 100;
    const totalDeductions = (settings.rent + settings.motorcycle + settings.tax) * multiplier + woltFee;
    const netIncome = scaledIncome - totalDeductions;

    // Get last 7 days for chart display
    const last7Days = earnings.slice(0, 7).map(earning => earning.total_amount);
    while (last7Days.length < 7) {
      last7Days.unshift(0);
    }

    setCalculatedData({
      totalIncome: scaledIncome,
      deductions: {
        rent: settings.rent * multiplier,
        motorcycle: settings.motorcycle * multiplier,
        tax: settings.tax * multiplier,
        woltFee,
      },
      netIncome,
      dailyEarnings: last7Days.reverse(),
    });
  };

  const saveToHistory = async () => {
    if (!settings) return;
    
    const selectedOption = periodOptions.find(p => p.value === selectedPeriod);
    if (!selectedOption) return;

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 7);

    await saveSummary({
      period_type: selectedPeriod,
      period_label: selectedOption.label,
      start_date: startDate.toISOString().split('T')[0],
      end_date: today.toISOString().split('T')[0],
      total_income: calculatedData.totalIncome,
      rent_deduction: calculatedData.deductions.rent,
      motorcycle_deduction: calculatedData.deductions.motorcycle,
      tax_deduction: calculatedData.deductions.tax,
      wolt_fee: calculatedData.deductions.woltFee,
      net_income: calculatedData.netIncome,
    });
  };

  const getCurrentMonthTarget = () => {
    const now = new Date();
    return targets.find(t => t.month === now.getMonth() + 1 && t.year === now.getFullYear());
  };

  const days = ['Mon', 'Tu', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxEarning = Math.max(...calculatedData.dailyEarnings);
  const currentTarget = getCurrentMonthTarget();

  if (earningsLoading || settingsLoading) {
    return <div className="min-h-screen bg-glovo-light flex items-center justify-center">
      <div className="text-glovo-dark">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-glovo-light">
      {/* Header */}
      <div className="bg-white p-4 rounded-b-3xl shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <Link to="/">
            <ArrowLeft className="w-6 h-6 text-glovo-dark" />
          </Link>
          <MoreVertical className="w-6 h-6 text-glovo-dark" />
        </div>
        
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-glovo-dark mb-1">W</h1>
          <h2 className="text-lg font-semibold text-glovo-dark">Period Summary</h2>
        </div>

        {/* Period Selector */}
        <div className="mb-6">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="bg-white border-2 border-glovo-gold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {periodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Monthly Target Display */}
        {currentTarget && (
          <Card className="p-4 bg-blue-50 border-0 mb-4">
            <div className="text-center">
              <p className="text-sm text-blue-600 mb-1">Monthly Target</p>
              <p className="text-2xl font-bold text-blue-800">{currentTarget.target_amount.toFixed(0)} RON</p>
              <p className="text-sm text-blue-600">
                Progress: {((calculatedData.netIncome / currentTarget.target_amount) * 100).toFixed(1)}%
              </p>
            </div>
          </Card>
        )}

        <Card className="p-4 bg-gray-50 border-0 mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Income</p>
            <p className="text-3xl font-bold text-glovo-dark">{calculatedData.totalIncome.toFixed(0)} RON</p>
          </div>
        </Card>

        <div className="space-y-2 mb-6">
          <div className="flex justify-between">
            <span className="text-glovo-dark">Deductions</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Rent</span>
            <span className="text-glovo-dark font-semibold">{calculatedData.deductions.rent.toFixed(0)} RON</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Motorcycle</span>
            <span className="text-glovo-dark font-semibold">{calculatedData.deductions.motorcycle.toFixed(0)} RON</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax</span>
            <span className="text-glovo-dark font-semibold">{calculatedData.deductions.tax.toFixed(0)} RON</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Wolt Fee</span>
            <span className="text-glovo-dark font-semibold">{calculatedData.deductions.woltFee.toFixed(0)} RON</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-gray-600 font-bold">Net Income</span>
            <span className="text-glovo-dark font-bold">{calculatedData.netIncome.toFixed(0)} RON</span>
          </div>
        </div>

        {/* Chart */}
        <div className="mb-4">
          <div className="flex items-end justify-between h-32 px-2">
            {calculatedData.dailyEarnings.map((earning, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className="bg-glovo-green rounded-t w-6 mb-1"
                  style={{
                    height: `${maxEarning > 0 ? (earning / maxEarning) * 100 : 0}px`,
                    minHeight: earning > 0 ? '8px' : '0px'
                  }}
                ></div>
                <span className="text-xs text-gray-600">{days[index]}</span>
              </div>
            ))}
          </div>
        </div>

        <Button 
          onClick={saveToHistory}
          className="w-full mb-4 bg-glovo-gold text-glovo-dark font-bold py-3 rounded-2xl hover:bg-glovo-gold/90"
        >
          Save to History
        </Button>

        {/* Historic Data */}
        {summaries.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-bold text-glovo-dark mb-4">Historic Data</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {summaries.slice(0, 5).map((record) => (
                <Card key={record.id} className="p-3 bg-gray-50 border-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-glovo-dark">{record.period_label}</p>
                      <p className="text-xs text-gray-600">{new Date(record.created_at).toLocaleDateString()}</p>
                    </div>
                    <p className="font-bold text-glovo-dark">{record.net_income.toFixed(0)} RON</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <NavigationBar />
    </div>
  );
};

export default WeeklySummary;
