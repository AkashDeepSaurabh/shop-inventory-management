import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  
  const [timeframe, setTimeframe] = useState('Monthly');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch low stock products
        const lowStockSnapshot = await getDocs(collection(db, 'low-stock-products'));
        const lowStockData = lowStockSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          quantity: doc.data().quantity,
          minimumRequired: doc.data().minimumRequired,
          sellPrice: doc.data().sellPrice,
          purchasePrice: doc.data().purchasePrice
        }));

        // Fetch other data...
        const [productsSnapshot, salesSnapshot, shopsSnapshot] = await Promise.all([
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'sales')),
          getDocs(collection(db, 'shops'))
        ]);

        const productsData = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
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
          lowStockProducts: lowStockData,
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
  }, []);

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

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 bg-gray-50 min-h-screen">
       {/* Shop Details Card */}
       {dashboardData.shops.length > 0 && (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-indigo-600 mb-4">Shop Details</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  {['Shop Name', 'Address', 'Contact', 'Owner', 'GST Number'].map((header) => (
                    <th key={header} className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dashboardData.shops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">{shop.shopName}</td>
                    <td className="px-4 py-3">{`${shop.address}, ${shop.state}, ${shop.country} - ${shop.pinCode}`}</td>
                    <td className="px-4 py-3">{shop.contactDetails}</td>
                    <td className="px-4 py-3">{shop.authorizedOwner}</td>
                    <td className="px-4 py-3">{shop.gstNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-indigo-500">
          <dt className="text-sm font-medium text-gray-500">Total Products</dt>
          <dd className="mt-2 text-3xl font-bold text-gray-900">
            {dashboardData.totalProducts.toLocaleString()}
          </dd>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-emerald-500">
          <dt className="text-sm font-medium text-gray-500">Total Sales</dt>
          <dd className="mt-2 text-3xl font-bold text-gray-900">
            ₹{dashboardData.totalSales.toLocaleString()}
          </dd>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-red-500">
          <dt className="text-sm font-medium text-gray-500">Low Stock Items</dt>
          <dd className="mt-2 text-3xl font-bold text-gray-900">
            {dashboardData.lowStockProducts.length}
          </dd>
        </div>
      </div>

      {/* Low Stock Products
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Low Stock Products</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Minimum Required</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardData.lowStockProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.minimumRequired}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.quantity === 0
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {product.quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div> */}

      {/* Sales and Profit Charts */}
      <div className="space-y-6">
        <TimeFrameSelector selected={timeframe} onChange={setTimeframe} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Sales Overview</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#4F46E5" 
                    name="Sales"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Profit Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Profit Overview</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#10B981" 
                    name="Profit"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}