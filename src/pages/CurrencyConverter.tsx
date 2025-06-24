
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";
import NavigationBar from "@/components/NavigationBar";

const CurrencyConverter = () => {
  const [exchangeRates] = useState({
    RON: 1,
    USD: 0.20,
    EUR: 0.19,
    MAD: 1.95,
  });

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toFixed(2)} ${currency}`;
  };

  return (
    <div className="min-h-screen bg-glovo-green">
      {/* Header */}
      <div className="bg-glovo-green p-4 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <Link to="/">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <MoreVertical className="w-6 h-6 text-white" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-8">Currency</h1>
        <h1 className="text-2xl font-bold text-white mb-8">Conversion</h1>

        <Card className="p-6 bg-white border-0 rounded-3xl">
          <div className="space-y-4">
            <div className="text-center mb-6">
              <p className="text-3xl font-bold text-glovo-dark">1 RON =</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-xl font-bold text-glovo-dark">{formatCurrency(exchangeRates.USD, 'USD')}</span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-xl font-bold text-glovo-dark">{formatCurrency(exchangeRates.EUR, 'EUR')}</span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-xl font-bold text-glovo-dark">{formatCurrency(exchangeRates.MAD, 'MAD')}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <NavigationBar />
    </div>
  );
};

export default CurrencyConverter;
