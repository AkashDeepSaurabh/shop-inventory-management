import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import {
  Box, 
  ShoppingCart, 
  Users, 
  FileText, 
  DollarSign, 
  ShoppingBag,
  Plus,
  X,
  AlertTriangle
} from 'lucide-react';
import { format, subDays, startOfYear, isWithinInterval, startOfMonth } from 'date-fns';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import React from 'react';

// Interfaces
interface Shop {
  id?: string;
  shopName: string;
  address: string;
  state: string;
  country: string;
  pinCode: string;
  contactDetails: string;
  authorizedOwner: string;
  gstNumber: string;
}

const TimeFrameSelector = ({ selected, onChange }) => (
  <div className="flex space-x-2 mb-4">
    {['Daily', 'Monthly', 'Yearly'].map((timeframe) => (
      <button
        key={timeframe}
        onClick={() => onChange(timeframe)}
        className={`px-4 py-2 rounded-lg transition-all ${
          selected === timeframe
            ? 'bg-indigo-600 text-white'
            : 'bg-white text-gray-600 hover:bg-indigo-50'
        }`}
      >
        {timeframe}
      </button>
    ))}
  </div>
);

export default function Dashboard() {
  interface Product {
    id: string;
    name: string;
    quantity: number;
    minimumRequired: number;
    sellPrice: number;
    purchasePrice: number;
  }
  
  interface Sale {
    id: string;
    date: Date;
    items: {
      quantity: number;
      sellPrice: number;
      purchasePrice: number;
    }[];
  }
  
  const [dashboardData, setDashboardData] = useState<{
    products: Product[];
    sales: Sale[];
    shops: Shop[];
    lowStockProducts: Product[];
    totalProducts: number;
    totalSales: number;
  }>({
    products: [],
    sales: [],
    shops: [],
    lowStockProducts: [],
    totalProducts: 0,
    totalSales: 0
  });

  const [lowStockItems, setLowStockItems] = useState<Product[]>([]);
  const [timeframe, setTimeframe] = useState('Monthly');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch low stock products
        const fetchLowStockItems = async () => {
          try {
            setIsLoading(true);
    
            // Fetch all stock data
            const stocksSnapshot = await getDocs(collection(db, 'ProductNames'));
            const stocksData = stocksSnapshot.docs.map((doc) => ({
              id: doc.id,
              name: doc.data().name,
              quantity: doc.data().quantity,
            })) as Product[];
    
            // Filter low stock items (quantity less than 10)
            const lowStock = stocksData.filter((stock) => stock.quantity < 10);
            setLowStockItems(lowStock);
          } catch (error) {
            console.error('Error fetching low stock items:', error);
          } finally {
            setIsLoading(false);
          }
        };
        // fetchLowStockItems();

        // Fetch other data...
        const [productsSnapshot, salesSnapshot, shopsSnapshot] = await Promise.all([
          getDocs(collection(db, 'ProductNames')),
          getDocs(collection(db, 'sales')),
          getDocs(collection(db, 'shops'))
        ]);

        const productsData = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().ProductNames,
          quantity: doc.data().quantity,
          minimumRequired: doc.data().minimumRequired,
          sellPrice: doc.data().sellPrice,
          purchasePrice: doc.data().purchasePrice
        }));

        const salesData = salesSnapshot.docs.map(doc => ({
          id: doc.id,
          date: doc.data().date?.toDate() || new Date(),
          items: doc.data().items || []
        }));

        const shopsData = shopsSnapshot.docs.map(doc => ({
          id: doc.id,
          shopName: doc.data().shopName,
          address: doc.data().address,
          state: doc.data().state,
          country: doc.data().country,
          pinCode: doc.data().pinCode,
          contactDetails: doc.data().contactDetails,
          authorizedOwner: doc.data().authorizedOwner,
          gstNumber: doc.data().gstNumber
        }));

        setDashboardData({
          products: productsData,
          sales: salesData,
          shops: shopsData,
          lowStockProducts: lowStockItems,
          totalProducts: productsData.length,
          totalSales: calculateTotalSales(salesData)
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [lowStockItems]);

  const calculateTotalSales = (sales) => {
    return sales.reduce((acc, sale) => {
      return acc + (sale.items?.reduce((sum, item) => 
        sum + (item.quantity * item.sellPrice), 0) || 0);
    }, 0);
  };

  const getFilteredData = (sales, timeframe) => {
    const now = new Date();
    const filtered = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      switch (timeframe) {
        case 'Daily':
          return isWithinInterval(saleDate, {
            start: subDays(now, 30),
            end: now
          });
        case 'Monthly':
          return isWithinInterval(saleDate, {
            start: startOfMonth(subDays(now, 365)),
            end: now
          });
        case 'Yearly':
          return isWithinInterval(saleDate, {
            start: startOfYear(subDays(now, 1095)), // 3 years
            end: now
          });
        default:
          return true;
      }
    });

    return aggregateData(filtered, timeframe);
  };

  const aggregateData = (sales, timeframe) => {
    const aggregated = sales.reduce((acc, sale) => {
      const dateKey = format(new Date(sale.date), 
        timeframe === 'Daily' ? 'MMM dd' :
        timeframe === 'Monthly' ? 'MMM yyyy' : 'yyyy'
      );

      if (!acc[dateKey]) {
        acc[dateKey] = { sales: 0, profit: 0 };
      }

      sale.items.forEach(item => {
        const saleAmount = item.quantity * item.sellPrice;
        const profitAmount = item.quantity * (item.sellPrice - item.purchasePrice);
        acc[dateKey].sales += saleAmount;
        acc[dateKey].profit += profitAmount;
      });

      return acc;
    }, {});

    return Object.entries(aggregated).map(([date, data]) => ({
      date,
      sales: (data as { sales: number; profit: number }).sales,
      profit: (data as { sales: number; profit: number }).profit
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const chartData = getFilteredData(dashboardData.sales, timeframe);

  // Handle click for low stock items
  const handleLowStockClick = () => {
    if (lowStockItems.length > 2) {
      navigate('/low-stock-products');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your business at a glance.</p>
      </div>

      {/* Shop Details Section */}
      {dashboardData.shops.length > 0 && (
        <div className="mb-8 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Shop Details</h2>
            <span className="text-sm text-gray-500">{dashboardData.shops.length} Active Shops</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  {['Shop Name', 'Address', 'Contact', 'Owner', 'GST Number'].map((header) => (
                    <th key={header} className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {dashboardData.shops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{shop.shopName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{`${shop.address}, ${shop.state}, ${shop.country} - ${shop.pinCode}`}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{shop.contactDetails}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{shop.authorizedOwner}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{shop.gstNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-indigo-500">
          <div className="flex justify-between">
            <div className="text-lg font-semibold text-gray-800">Total Products</div>
            <ShoppingBag className="w-8 h-8 text-indigo-500" />
            </div>
          <div className="mt-4 text-2xl font-bold text-gray-900">{dashboardData.totalProducts}</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-emerald-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Sales</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">₹{dashboardData.totalSales.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-full">
              <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9l4 4-4 4m14-8l4 4-4 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-red-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-gray-800">Low Stock Products</div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <div className="mt-4 text-2xl font-bold text-gray-900">{lowStockItems.length}</div>
          <div className="mt-4 text-sm font-medium text-gray-600 cursor-pointer" onClick={handleLowStockClick}>
            {lowStockItems.length > 2 ? 'View Low Stock Products' : 'Few Low Stock Items'}
          </div>
        </div>
      </div>

      {/* Timeframe Selector */}
      <TimeFrameSelector selected={timeframe} onChange={setTimeframe} />

      {/* Sales Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="sales"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            dataKey="profit"
            stroke="#82ca9d"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
