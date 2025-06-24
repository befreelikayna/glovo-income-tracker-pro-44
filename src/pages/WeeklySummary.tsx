
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";
import NavigationBar from "@/components/NavigationBar";

const WeeklySummary = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("1week");
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
  const [historicData, setHistoricData] = useState<any[]>([]);

  const periodOptions = [
    { value: "1week", label: "1 Week", multiplier: 1 },
    { value: "2week", label: "2 Weeks", multiplier: 2 },
    { value: "3week", label: "3 Weeks", multiplier: 3 },
    { value: "4week", label: "4 Weeks", multiplier: 4 },
    { value: "1month", label: "1 Month", multiplier: 4.33 },
  ];

  useEffect(() => {
    calculatePeriodSummary();
    loadHistoricData();
  }, [selectedPeriod]);

  const calculatePeriodSummary = () => {
    const earnings = JSON.parse(localStorage.getItem("earnings") || "[]");
    const settings = JSON.parse(localStorage.getItem("adminSettings") || '{"rent": 400, "motorcycle": 150, "tax": 425, "woltRate": 10}');
    
    const selectedOption = periodOptions.find(p => p.value === selectedPeriod);
    const multiplier = selectedOption?.multiplier || 1;
    
    if (earnings.length > 0) {
      const totalIncome = earnings.reduce((sum: number, earning: any) => sum + earning.daily + earning.cash, 0);
      const scaledIncome = totalIncome * multiplier;
      const woltFee = (scaledIncome * settings.woltRate) / 100;
      const totalDeductions = (settings.rent + settings.motorcycle + settings.tax) * multiplier + woltFee;
      const netIncome = scaledIncome - totalDeductions;

      // Get last 7 days for chart display
      const last7Days = earnings.slice(-7).map((earning: any) => earning.daily + earning.cash);
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
        dailyEarnings: last7Days,
      });
    }
  };

  const loadHistoricData = () => {
    const historic = JSON.parse(localStorage.getItem("historicData") || "[]");
    setHistoricData(historic);
  };

  const saveToHistory = () => {
    const newRecord = {
      period: selectedPeriod,
      periodLabel: periodOptions.find(p => p.value === selectedPeriod)?.label,
      date: new Date().toISOString(),
      ...calculatedData,
    };

    const existingHistoric = JSON.parse(localStorage.getItem("historicData") || "[]");
    existingHistoric.push(newRecord);
    localStorage.setItem("historicData", JSON.stringify(existingHistoric));
    
    setHistoricData(existingHistoric);
  };

  const days = ['Mon', 'Tu', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxEarning = Math.max(...calculatedData.dailyEarnings);

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
        {historicData.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-bold text-glovo-dark mb-4">Historic Data</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {historicData.slice(-5).reverse().map((record, index) => (
                <Card key={index} className="p-3 bg-gray-50 border-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-glovo-dark">{record.periodLabel}</p>
                      <p className="text-xs text-gray-600">{new Date(record.date).toLocaleDateString()}</p>
                    </div>
                    <p className="font-bold text-glovo-dark">{record.netIncome.toFixed(0)} RON</p>
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
