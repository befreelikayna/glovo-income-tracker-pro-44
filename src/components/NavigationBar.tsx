
import { Home, BarChart3, Settings, DollarSign } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const NavigationBar = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: BarChart3, label: "Summary", path: "/weekly-summary" },
    { icon: Settings, label: "Admin", path: "/admin" },
    { icon: DollarSign, label: "Currency", path: "/currency" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-glovo-dark rounded-t-3xl p-4">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-4 rounded-xl transition-colors ${
                isActive 
                  ? 'bg-glovo-gold text-glovo-dark' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default NavigationBar;
