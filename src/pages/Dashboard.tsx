import { useState, useEffect } from 'react';
import { Product, Sale } from '../types';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import React from 'react';
import { ChevronDown, ChevronUp, Printer, Eye, EyeOff, PlusIcon, Box, ShoppingCart, Users, FileText, DollarSign, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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

export default function Dashboard() {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [salesData, setSalesData] = useState<Sale[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [showSales, setShowSales] = useState(true); // For toggling between sales/profit view
  const [menuOpen, setMenuOpen] = useState(false); // To toggle the dropdown menu visibility

  // Fetching products, sales data, and shop details from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        setProducts([]);
        setSalesData([]);
        setTotalProducts(products.length);
        setTotalSales(
          salesData.reduce((acc, sale) => {
            return acc + sale.items.reduce((sum, item) => sum + item.quantity * item.sellPrice, 0);
          }, 0)
        );
        setLowStock(products.filter((p) => p.quantity < 10));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const fetchShops = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'shops'));
        const shopList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Shop[];
        setShops(shopList);
      } catch (error) {
        console.error('Error fetching shop details:', error);
      }
    };

    fetchData();
    fetchShops();
  }, [products, salesData]);

  // Chart data for sales or profit overview
  const getChartData = (salesData: Sale[], label: string) => {
    const salesGroupedByMonth = salesData.reduce((acc, sale) => {
      const month = format(sale.date, 'MMM yyyy');
      const saleAmount = sale.items.reduce((sum, item) => sum + item.quantity * item.sellPrice, 0);

      if (!acc[month]) acc[month] = { sales: 0, profit: 0 };
      acc[month].sales += saleAmount;

      sale.items.forEach((item) => {
        const purchaseAmount = item.quantity * item.purchasePrice;
        acc[month].profit += saleAmount - purchaseAmount;
      });

      return acc;
    }, {} as Record<string, { sales: number; profit: number }>);

    const labels = Object.keys(salesGroupedByMonth);
    const data = label === 'Sales'
      ? labels.map((key) => salesGroupedByMonth[key].sales)
      : labels.map((key) => salesGroupedByMonth[key].profit);

    return {
      labels,
      datasets: [
        {
          label,
          data,
          borderColor: label === 'Sales' ? '#3498db' : '#2ecc71', // Colors for Sales and Profit
          backgroundColor: label === 'Sales' ? 'rgba(52, 152, 219, 0.2)' : 'rgba(46, 204, 113, 0.2)', 
          tension: 0.4, // Smooth the line
        },
      ],
    };
  };

  // Icon mapping based on page name
  const pageIcons = {
    'add-product': <Box className="h-5 w-5 mr-2" />,
    'stocks': <ShoppingBag className="h-5 w-5 mr-2" />,
    'purchase-order': <FileText className="h-5 w-5 mr-2" />,
    'customer-sales': <ShoppingCart className="h-5 w-5 mr-2" />,
    'customers': <Users className="h-5 w-5 mr-2" />,
    'sales': <DollarSign className="h-5 w-5 mr-2" />,
  };

  return (
    <div className="space-y-8 relative p-8 bg-gray-50">
      {/* Shop Details Section */}
      <div className="overflow-hidden rounded-lg bg-white shadow-xl border-l-4 border-indigo-500 transition-all hover:shadow-2xl hover:scale-105">
        <div className="p-8">
          <h3 className="text-xl font-semibold text-indigo-600 transition-colors duration-300">Shop Details</h3>
          <div className="overflow-x-auto mt-6">
            <table className="min-w-full table-auto divide-y divide-gray-200">
              <thead className="bg-gray-100 text-sm font-medium text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">Shop Name</th>
                  <th className="px-4 py-3 text-left">Address</th>
                  <th className="px-4 py-3 text-left">State</th>
                  <th className="px-4 py-3 text-left">Country</th>
                  <th className="px-4 py-3 text-left">Pin Code</th>
                  <th className="px-4 py-3 text-left">Contact</th>
                  <th className="px-4 py-3 text-left">Owner</th>
                  <th className="px-4 py-3 text-left">GST Number</th>
                </tr>
              </thead>
              <tbody className="text-sm font-normal text-gray-700">
                {shops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-gray-50 transition-all duration-300 hover:bg-indigo-50">
                    <td className="px-4 py-3">{shop.shopName}</td>
                    <td className="px-4 py-3">{shop.address}</td>
                    <td className="px-4 py-3">{shop.state}</td>
                    <td className="px-4 py-3">{shop.country}</td>
                    <td className="px-4 py-3">{shop.pinCode}</td>
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

      {/* Total Products and Sales Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white p-6 shadow-lg border-l-4 border-yellow-500 transition-all hover:shadow-2xl hover:scale-105">
          <dt className="truncate text-sm font-medium text-gray-500">Total Products</dt>
          <dd className="mt-1 text-4xl font-bold text-gray-900">{totalProducts}</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white p-6 shadow-lg border-l-4 border-green-500 transition-all hover:shadow-2xl hover:scale-105">
          <dt className="truncate text-sm font-medium text-gray-500">Total Sales</dt>
          <dd className="mt-1 text-4xl font-bold text-gray-900">{totalSales}</dd>
        </div>
      </div>

      {/* Graphs Section: Sales and Profit Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg bg-white shadow-lg border-l-4 border-blue-500 transition-all hover:shadow-2xl hover:scale-105">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-blue-600 transition-colors duration-300">Sales Overview</h3>
            {salesData.length > 0 ? (
              <Line data={getChartData(salesData, 'Sales')} options={{ maintainAspectRatio: false }} />
            ) : (
              <p>No sales data available</p>
            )}
          </div>
        </div>
        <div className="overflow-hidden rounded-lg bg-white shadow-lg border-l-4 border-green-500 transition-all hover:shadow-2xl hover:scale-105">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-green-600 transition-colors duration-300">Profit Overview</h3>
            {salesData.length > 0 ? (
              <Line data={getChartData(salesData, 'Profit')} options={{ maintainAspectRatio: false }} />
            ) : (
              <p>No profit data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Floating + Button with Smooth Hover Transition */}
      <div className="fixed bottom-6 right-6 transition-all duration-300">
        <button
          onClick={() => setMenuOpen(!menuOpen)} // Toggle the dropdown menu visibility
          className="p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300"
        >
          <PlusIcon className="h-6 w-6" />
        </button>
        {menuOpen && (
          <div className="absolute bottom-16 right-0 bg-white shadow-lg rounded-lg w-48 mt-2 transition-all duration-300">
            <ul className="text-gray-700">
              <li>
                <Link to="/add-product" className="block px-4 py-2 text-gray-700 hover:bg-indigo-600 flex items-center transition-all">
                  {pageIcons['add-product']} Add Product
                </Link>
              </li>
              <li>
                <Link to="/stocks" className="block px-4 py-2 text-gray-700 hover:bg-indigo-600 flex items-center transition-all">
                  {pageIcons['stocks']} Stocks
                </Link>
              </li>
              <li>
                <Link to="/purchase-order" className="block px-4 py-2 text-gray-700 hover:bg-indigo-600 flex items-center transition-all">
                  {pageIcons['purchase-order']} Purchase Order
                </Link>
              </li>
              <li>
                <Link to="/customer-sales" className="block px-4 py-2 text-gray-700 hover:bg-indigo-600 flex items-center transition-all">
                  {pageIcons['customer-sales']} Customer Sales
                </Link>
              </li>
              <li>
                <Link to="/customers" className="block px-4 py-2 text-gray-700 hover:bg-indigo-600 flex items-center transition-all">
                  {pageIcons['customers']} Customers
                </Link>
              </li>
              <li>
                <Link to="/sales" className="block px-4 py-2 text-gray-700 hover:bg-indigo-600 flex items-center transition-all">
                  {pageIcons['sales']} Sales
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
