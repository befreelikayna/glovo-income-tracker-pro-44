
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";
import NavigationBar from "@/components/NavigationBar";
import { useSettings } from "@/hooks/useSettings";
import { useMonthlyTargets } from "@/hooks/useMonthlyTargets";
import EarningsManager from "@/components/EarningsManager";

const AdminPanel = () => {
  const { settings, loading, updateSettings } = useSettings();
  const { setTarget } = useMonthlyTargets();
  const [localSettings, setLocalSettings] = useState({
    rent: 400,
    motorcycle: 150,
    tax: 425,
    wolt_rate: 10,
  });
  const [monthlyTarget, setMonthlyTarget] = useState("");

  useEffect(() => {
    if (settings) {
      setLocalSettings({
        rent: settings.rent,
        motorcycle: settings.motorcycle,
        tax: settings.tax,
        wolt_rate: settings.wolt_rate,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings(localSettings);
  };

  const handleSetMonthlyTarget = async () => {
    if (monthlyTarget) {
      const now = new Date();
      await setTarget(now.getMonth() + 1, now.getFullYear(), parseFloat(monthlyTarget));
      setMonthlyTarget("");
    }
  };

  const handleInputChange = (field: keyof typeof localSettings, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  if (loading) {
    return <div className="min-h-screen bg-glovo-dark flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-glovo-dark">
      {/* Header */}
      <div className="bg-glovo-dark p-4 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <Link to="/">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <MoreVertical className="w-6 h-6 text-white" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-8">Admin Panel</h1>

        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="earnings">Manage Earnings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings" className="space-y-4">
            <Card className="p-4 bg-white border-0">
              <div className="flex justify-between items-center">
                <span className="font-medium text-glovo-dark">Rent</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={localSettings.rent}
                    onChange={(e) => handleInputChange('rent', e.target.value)}
                    className="w-20 text-right border-0 bg-gray-100"
                  />
                  <span className="text-sm text-gray-600">RON</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white border-0">
              <div className="flex justify-between items-center">
                <span className="font-medium text-glovo-dark">Motorcycle</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={localSettings.motorcycle}
                    onChange={(e) => handleInputChange('motorcycle', e.target.value)}
                    className="w-20 text-right border-0 bg-gray-100"
                  />
                  <span className="text-sm text-gray-600">RON</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white border-0">
              <div className="flex justify-between items-center">
                <span className="font-medium text-glovo-dark">Tax</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={localSettings.tax}
                    onChange={(e) => handleInputChange('tax', e.target.value)}
                    className="w-20 text-right border-0 bg-gray-100"
                  />
                  <span className="text-sm text-gray-600">RON</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white border-0">
              <div className="flex justify-between items-center">
                <span className="font-medium text-glovo-dark">Wolt fee %</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={localSettings.wolt_rate}
                    onChange={(e) => handleInputChange('wolt_rate', e.target.value)}
                    className="w-20 text-right border-0 bg-gray-100"
                  />
                  <span className="text-sm text-gray-600">%</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white border-0">
              <div className="flex justify-between items-center">
                <span className="font-medium text-glovo-dark">Monthly Target</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={monthlyTarget}
                    onChange={(e) => setMonthlyTarget(e.target.value)}
                    placeholder="3000"
                    className="w-20 text-right border-0 bg-gray-100"
                  />
                  <span className="text-sm text-gray-600">RON</span>
                </div>
              </div>
            </Card>

            <div className="space-y-3 mt-6">
              <Button 
                onClick={handleSave}
                className="w-full bg-glovo-green text-white font-bold py-4 text-lg rounded-2xl hover:bg-glovo-green/90"
              >
                Save Settings
              </Button>
              
              <Button 
                onClick={handleSetMonthlyTarget}
                disabled={!monthlyTarget}
                className="w-full bg-glovo-gold text-glovo-dark font-bold py-4 text-lg rounded-2xl hover:bg-glovo-gold/90"
              >
                Set Monthly Target
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="earnings">
            <EarningsManager />
          </TabsContent>
        </Tabs>
      </div>

      <NavigationBar />
    </div>
  );
};

export default AdminPanel;
