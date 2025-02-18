import React from 'react';
import { Calendar, FileText } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  borderColor?: string;
  data?: {
    totalSaleAmount?: number;
    totalPaid?: number;
    totalDue?: number;
  };
  loading?: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ 
  title, 
  icon: Icon = Calendar,
  borderColor = "indigo",
  data = {},
  loading = false 
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 border-${borderColor}-600 hover:shadow-xl transition-shadow`}>
      <div className="flex items-center space-x-3 mb-4">
        <Icon className={`w-6 h-6 text-${borderColor}-600`} />
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      
      <div className="space-y-4">
        {/* Total Sales */}
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">Total Sales</div>
          <div className={`text-lg font-bold text-${borderColor}-600`}>
            ₹{loading ? "..." : data.totalSaleAmount?.toFixed(2) || "0.00"}
          </div>
        </div>

        {/* Amount Paid */}
        <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">Amount Paid</div>
          <div className="text-lg font-bold text-green-600">
            ₹{loading ? "..." : data.totalPaid?.toFixed(2) || "0.00"}
          </div>
        </div>

        {/* Amount Due */}
        <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">Amount Due</div>
          <div className="text-lg font-bold text-red-600">
            ₹{loading ? "..." : data.totalDue?.toFixed(2) || "0.00"}
          </div>
        </div>
      </div>
    </div>
  );
};

// Example usage component showing how to use the cards independently
const DashboardCards = () => {
  // Sample data - in a real app, this would come from your data source
  const weeklyData = {
    totalSaleAmount: 25000,
    totalPaid: 20000,
    totalDue: 5000
  };

  const monthlyData = {
    totalSaleAmount: 100000,
    totalPaid: 85000,
    totalDue: 15000
  };

  const yearlyData = {
    totalSaleAmount: 1200000,
    totalPaid: 1000000,
    totalDue: 200000
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3">
        {/* Weekly Summary */}
        <SummaryCard
          title="Last Week"
          icon={Calendar}
          borderColor="indigo"
          data={weeklyData}
        />

        {/* Monthly Summary */}
        <SummaryCard
          title="Last Month"
          icon={FileText}
          borderColor="purple"
          data={monthlyData}
        />

        {/* Yearly Summary */}
        <SummaryCard
          title="Last Year"
          icon={FileText}
          borderColor="blue"
          data={yearlyData}
        />
      </div>
    </div>
  );
};

export { SummaryCard, DashboardCards };