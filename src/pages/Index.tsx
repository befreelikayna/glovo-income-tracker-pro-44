
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MoreVertical, Home, BarChart3, Settings, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import NavigationBar from "@/components/NavigationBar";

const Index = () => {
  const [dailyEarnings, setDailyEarnings] = useState("");
  const [cashEarnings, setCashEarnings] = useState("");
  const { toast } = useToast();

  const handleSave = () => {
    if (!dailyEarnings) {
      toast({
        title: "Error",
        description: "Please enter daily earnings amount",
        variant: "destructive",
      });
      return;
    }

    // Save to localStorage (in a real app, this would be saved to a database)
    const earnings = {
      daily: parseFloat(dailyEarnings),
      cash: parseFloat(cashEarnings) || 0,
      date: new Date().toISOString(),
    };

    const existingEarnings = JSON.parse(localStorage.getItem("earnings") || "[]");
    existingEarnings.push(earnings);
    localStorage.setItem("earnings", JSON.stringify(existingEarnings));

    toast({
      title: "Success",
      description: "Daily earnings saved successfully!",
    });

    setDailyEarnings("");
    setCashEarnings("");
  };

  return (
    <div className="min-h-screen bg-glovo-light">
      {/* Header */}
      <div className="glovo-gradient p-4 rounded-b-3xl">
        <div className="flex items-center justify-between mb-8">
          <ArrowLeft className="w-6 h-6 text-glovo-dark" />
          <MoreVertical className="w-6 h-6 text-glovo-dark" />
        </div>
        
        <h1 className="text-2xl font-bold text-glovo-dark mb-6">Add Earnings</h1>
        
        <div className="space-y-4">
          <div>
            <label className="text-glovo-dark font-medium block mb-2">Daily earnings</label>
            <Card className="p-4 bg-white/80 backdrop-blur border-0">
              <Input
                type="number"
                value={dailyEarnings}
                onChange={(e) => setDailyEarnings(e.target.value)}
                placeholder="350"
                className="text-right text-2xl font-bold border-0 bg-transparent p-0 text-glovo-dark"
              />
            </Card>
          </div>

          <div>
            <label className="text-glovo-dark font-medium block mb-2">Cash earnings (optional)</label>
            <Card className="p-4 bg-white/80 backdrop-blur border-0">
              <Input
                type="number"
                value={cashEarnings}
                onChange={(e) => setCashEarnings(e.target.value)}
                placeholder="50"
                className="text-right text-2xl font-bold border-0 bg-transparent p-0 text-glovo-dark"
              />
            </Card>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="p-4 mt-8">
        <Button 
          onClick={handleSave}
          className="w-full glovo-gradient text-glovo-dark font-bold py-4 text-lg rounded-2xl border-0 hover:opacity-90"
        >
          Save
        </Button>
      </div>

      <NavigationBar />
    </div>
  );
};

export default Index;
