import { useEffect, useState } from 'react';
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulated fetching data for products and sales
        setProducts([]); // Set products data
        setSalesData([]); // Set sales data
        setTotalProducts(products.length);
        setTotalSales(0); // Example total sales count
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
  }, []);

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
          borderColor: label === 'Sales' ? 'blue' : 'green',
          backgroundColor: label === 'Sales' ? 'rgba(0, 0, 255, 0.2)' : 'rgba(0, 255, 0, 0.2)',
        },
      ],
    };
  };

  return (
    <div className="space-y-6 relative">


      {/* Shop Details Section */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="p-6">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Shop Details</h3>
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full table-auto divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Shop Name</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Address</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">State</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Country</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Pin Code</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Contact</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Owner</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">GST Number</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {shops.map((shop) => (
                  <tr key={shop.id}>
                    <td className="px-4 py-2 text-sm text-gray-800">{shop.shopName}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{shop.address}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{shop.state}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{shop.country}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{shop.pinCode}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{shop.contactDetails}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{shop.authorizedOwner}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{shop.gstNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Total Products and Sales Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Total Products</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {totalProducts}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Total Sales</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {totalSales}
          </dd>
        </div>
      </div>

      {/* Graphs Section: Sales and Profit Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Sales Overview</h3>
            <Line data={getChartData(salesData, 'Sales')} />
          </div>
        </div>
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Profit Overview</h3>
            <Line data={getChartData(salesData, 'Profit')} />
          </div>
        </div>
      </div>
    </div>
  );
}
