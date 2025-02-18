import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { format, subDays, isSameDay, subYears, subMonths } from 'date-fns';
import { ArrowLeft, Calendar, DollarSign, FileText } from 'lucide-react';

const SalesDashboard = () => {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [lastMonthData, setLastMonthData] = useState<any>(null); // For Last Month
  const [lastYearData, setLastYearData] = useState<any>(null); // For Last Year
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setIsLoading(true);
        const salesSnapshot = await getDocs(collection(db, 'sales'));
        const sales = salesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSalesData(sales);
      } catch (error) {
        console.error('Error fetching sales data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  useEffect(() => {
    const calculateLastMonthSalesData = () => {
        const targetDate = subMonths(new Date(), 1);
        const salesForMonth = salesData.filter((sale) =>
          new Date(sale.saleDate.seconds * 1000) > targetDate
        );
  
        const totalSaleAmount = salesForMonth.reduce((sum, sale) => {
          return (
            sum +
            sale.products.reduce((productSum, product) => {
              return productSum + product.totalAmount;
            }, 0)
          );
        }, 0);
  
        const totalPaid = salesForMonth.reduce((sum, sale) => sum + sale.paidAmount, 0);
        const totalDue = salesForMonth.reduce((sum, sale) => sum + sale.dueAmount, 0);
  
        setLastMonthData({
          totalSaleAmount,
          totalPaid,
          totalDue,
        });
      };

      
    const calculateWeeklySalesData = () => {
      const salesGroupedByDay = Array.from({ length: 7 }, (_, index) => {
        const targetDate = subDays(new Date(), index);
        const salesForDay = salesData.filter((sale) =>
          isSameDay(new Date(sale.saleDate.seconds * 1000), targetDate)
        );

        const dailySaleAmount = salesForDay.reduce((sum, sale) => {
          return (
            sum +
            sale.products.reduce((productSum, product) => {
              return productSum + product.totalAmount;
            }, 0)
          );
        }, 0);

        const totalPaid = salesForDay.reduce((sum, sale) => sum + sale.paidAmount, 0);
        const totalDue = salesForDay.reduce((sum, sale) => sum + sale.dueAmount, 0);

        return {
          date: format(targetDate, 'yyyy-MM-dd'),
          dailySaleAmount,
          totalPaid,
          totalDue,
        };
      });

      setWeeklyData(salesGroupedByDay.reverse());
    };

    const calculateLastYearSalesData = () => {
      const targetDate = subYears(new Date(), 1);
      const salesForYear = salesData.filter((sale) =>
        new Date(sale.saleDate.seconds * 1000) > targetDate
      );

      const totalSaleAmount = salesForYear.reduce((sum, sale) => {
        return (
          sum +
          sale.products.reduce((productSum, product) => {
            return productSum + product.totalAmount;
          }, 0)
        );
      }, 0);

      const totalPaid = salesForYear.reduce((sum, sale) => sum + sale.paidAmount, 0);
      const totalDue = salesForYear.reduce((sum, sale) => sum + sale.dueAmount, 0);

      setLastYearData({
        totalSaleAmount,
        totalPaid,
        totalDue,
      });
    };

    if (salesData.length > 0) {
      calculateWeeklySalesData();
      calculateLastMonthSalesData();
      calculateLastYearSalesData();
    }
  }, [salesData]);

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const calculateTotalAmount = (data: any[], key: string) => {
    return data.reduce((sum, item) => sum + item[key], 0).toFixed(2);
  };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Summary Cards Section */}
          <div className="mb-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Sales Overview</h1>
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3">
              {/* Weekly Summary Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-600 hover:shadow-xl transition-shadow">
                <div className="flex items-center space-x-3 mb-4">
                  <Calendar className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-xl font-bold text-gray-900">Last Week</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700">Total Sales</div>
                    <div className="text-lg font-bold text-indigo-600">
                      ₹{calculateTotalAmount(weeklyData, 'dailySaleAmount')}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700">Amount Paid</div>
                    <div className="text-lg font-bold text-green-600">
                      ₹{calculateTotalAmount(weeklyData, 'totalPaid')}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700">Amount Due</div>
                    <div className="text-lg font-bold text-red-600">
                      ₹{calculateTotalAmount(weeklyData, 'totalDue')}
                    </div>
                  </div>
                </div>
              </div>
    
              {/* Monthly Summary Card */}
              {lastMonthData && (
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-600 hover:shadow-xl transition-shadow">
                  <div className="flex items-center space-x-3 mb-4">
                    <FileText className="w-6 h-6 text-purple-600" />
                    <h2 className="text-xl font-bold text-gray-900">Last Month</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700">Total Sales</div>
                      <div className="text-lg font-bold text-purple-600">
                        ₹{lastMonthData.totalSaleAmount.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700">Amount Paid</div>
                      <div className="text-lg font-bold text-green-600">
                        ₹{lastMonthData.totalPaid.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700">Amount Due</div>
                      <div className="text-lg font-bold text-red-600">
                        ₹{lastMonthData.totalDue.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
    
              {/* Yearly Summary Card */}
              {lastYearData && (
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600 hover:shadow-xl transition-shadow">
                  <div className="flex items-center space-x-3 mb-4">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900">Last Year</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700">Total Sales</div>
                      <div className="text-lg font-bold text-blue-600">
                        ₹{lastYearData.totalSaleAmount.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700">Amount Paid</div>
                      <div className="text-lg font-bold text-green-600">
                        ₹{lastYearData.totalPaid.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700">Amount Due</div>
                      <div className="text-lg font-bold text-red-600">
                        ₹{lastYearData.totalDue.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
    
          {/* Daily Sales Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Daily Sales Breakdown</h2>
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {weeklyData.map((dayData) => (
                <div 
                  key={dayData.date} 
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{dayData.date}</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700">Sales</div>
                      <div className="text-lg font-semibold text-indigo-600">
                        ₹{dayData.dailySaleAmount.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700">Paid</div>
                      <div className="text-lg font-semibold text-green-600">
                        ₹{dayData.totalPaid.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700">Due</div>
                      <div className="text-lg font-semibold text-red-600">
                        ₹{dayData.totalDue.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
    
          {/* Back Button - Now at the bottom */}
          <div className="flex justify-center mt-8">
            <button
              onClick={() => window.history.back()}
              className="flex items-center px-6 py-3 text-base font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Sales
            </button>
          </div>
        </div>
      );
    };
    
    export default SalesDashboard;