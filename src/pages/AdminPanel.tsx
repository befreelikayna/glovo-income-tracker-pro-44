
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import NavigationBar from "@/components/NavigationBar";

const AdminPanel = () => {
  const [settings, setSettings] = useState({
    rent: 400,
    motorcycle: 150,
    tax: 425,
    woltRate: 10,
  });
  const [currency, setCurrency] = useState("RON");
  const { toast } = useToast();

  useEffect(() => {
    const savedSettings = localStorage.getItem("adminSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("adminSettings", JSON.stringify(settings));
    toast({
      title: "Success",
      description: "Settings saved successfully!",
    });
  };

  const handleInputChange = (field: keyof typeof settings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

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

        <div className="space-y-4">
          <Card className="p-4 bg-white border-0">
            <div className="flex justify-between items-center">
              <span className="font-medium text-glovo-dark">Rent</span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={settings.rent}
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
                  value={settings.motorcycle}
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
                  value={settings.tax}
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
                  value={settings.woltRate}
                  onChange={(e) => handleInputChange('woltRate', e.target.value)}
                  className="w-20 text-right border-0 bg-gray-100"
                />
                <span className="text-sm text-gray-600">%</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-6">
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="bg-glovo-dark text-white border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="RON">RON</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="MAD">MAD</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleSave}
          className="w-full mt-6 bg-glovo-green text-white font-bold py-4 text-lg rounded-2xl hover:bg-glovo-green/90"
        >
          Save Settings
        </Button>
      </div>

      <NavigationBar />
    </div>
  );
};

export default AdminPanel;
