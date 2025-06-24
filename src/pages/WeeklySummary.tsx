
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";
import NavigationBar from "@/components/NavigationBar";

const WeeklySummary = () => {
  const [weeklyData, setWeeklyData] = useState({
    totalIncome: 0,
    deductions: {
      rent: 400,
      motorcycle: 150,
      tax: 0,
      glovoFee: 0,
    },
    netIncome: 0,
    dailyEarnings: Array(7).fill(0),
  });

  useEffect(() => {
    // Calculate weekly summary from stored earnings
    const earnings = JSON.parse(localStorage.getItem("earnings") || "[]");
    const settings = JSON.parse(localStorage.getItem("adminSettings") || '{"rent": 400, "motorcycle": 150, "taxRate": 10, "glovoRate": 10}');
    
    if (earnings.length > 0) {
      const totalIncome = earnings.reduce((sum: number, earning: any) => sum + earning.daily + earning.cash, 0);
      const tax = (totalIncome * settings.taxRate) / 100;
      const glovoFee = (totalIncome * settings.glovoRate) / 100;
      const netIncome = totalIncome - settings.rent - settings.motorcycle - tax - glovoFee;

      // Get last 7 days of earnings for chart
      const last7Days = earnings.slice(-7).map((earning: any) => earning.daily + earning.cash);
      while (last7Days.length < 7) {
        last7Days.unshift(0);
      }

      setWeeklyData({
        totalIncome,
        deductions: {
          rent: settings.rent,
          motorcycle: settings.motorcycle,
          tax,
          glovoFee,
        },
        netIncome,
        dailyEarnings: last7Days,
      });
    }
  }, []);

  const days = ['Mon', 'Tu', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxEarning = Math.max(...weeklyData.dailyEarnings);

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
          <h2 className="text-lg font-semibold text-glovo-dark">Weekly Summary</h2>
        </div>

        <Card className="p-4 bg-gray-50 border-0 mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Income</p>
            <p className="text-3xl font-bold text-glovo-dark">{weeklyData.totalIncome.toFixed(0)} RON</p>
          </div>
        </Card>

        <div className="space-y-2 mb-6">
          <div className="flex justify-between">
            <span className="text-glovo-dark">Deductions</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Rent</span>
            <span className="text-glovo-dark font-semibold">{weeklyData.deductions.rent} RON</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Motorcycle</span>
            <span className="text-glovo-dark font-semibold">{weeklyData.deductions.motorcycle} RON</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax</span>
            <span className="text-glovo-dark font-semibold">{weeklyData.deductions.tax.toFixed(0)} RON</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Net Income</span>
            <span className="text-glovo-dark font-bold">{weeklyData.netIncome.toFixed(0)} RON</span>
          </div>
        </div>

        {/* Chart */}
        <div className="mb-4">
          <div className="flex items-end justify-between h-32 px-2">
            {weeklyData.dailyEarnings.map((earning, index) => (
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
      </div>

      <NavigationBar />
    </div>
  );
};

export default WeeklySummary;
