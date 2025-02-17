import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { Package, Plus, ShoppingCart, Loader } from 'lucide-react';

const StockDetailsPage = () => {
  interface Stock {
    id: string;
    productName: string;
    quantity: number;
    purchasePrice: number;
    sellingPrice: number;
    brand: string;
    nos: string;
  }

  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      setIsLoading(true);
      const querySnapshot = await getDocs(collection(db, 'purchasedStocks'));
      const stocksData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Stock[];
      setStocks(stocksData);
    } catch (error) {
      console.error('Error fetching stocks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStocks = stocks.filter(stock => {
    const productName = stock.productName ? stock.productName.toLowerCase() : '';
    const brand = stock.brand ? stock.brand.toLowerCase() : '';
    const search = searchTerm.toLowerCase();

    return productName.includes(search) || brand.includes(search);
  });

  // Low stock filter: Show products with quantity less than 10
  const lowStockProducts = stocks.filter(stock => stock.quantity < 10);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-8">
            <div className="flex items-center space-x-3">
              <Package className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Stock Inventory</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your products and inventory</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <Link
                to="/purchase-order"
                className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-sm font-medium text-white rounded-md hover:bg-indigo-700 transition-colors duration-150"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                New Purchase Order
              </Link>
              <Link
                to="/add-product"
                className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-sm font-medium text-white rounded-md hover:bg-green-700 transition-colors duration-150"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Link>
              <Link
                to="/low-stock-products"
                className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-sm font-medium text-white rounded-md hover:bg-red-700 transition-colors duration-150 mt-4"
              >
                View Low Stock Products
              </Link>
            </div>
          </div>

          {/* Low Stock Products Section */}
          <div className="mb-6">
            {lowStockProducts.length > 0 && (
              <div className="bg-yellow-100 border-l-4 border-yellow-600 p-4 mb-6">
                <h3 className="text-lg font-semibold text-yellow-600">Low Stock Products</h3>
                <ul className="mt-2 space-y-2">
                  {lowStockProducts.map((stock) => (
                    <li key={stock.id} className="text-sm text-gray-700">
                      <span className="font-semibold">{stock.productName}</span> - Quantity: {stock.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by product name or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Table Section */}
          <div className="relative overflow-x-auto rounded-lg border border-gray-200">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Brand</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">NOS</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Purchase Price</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Selling Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredStocks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No products found
                      </td>
                    </tr>
                  ) : (
                    filteredStocks.map((stock) => (
                      <tr key={stock.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {stock.productName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {stock.brand}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                          {stock.quantity.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                          {stock.nos}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                          ₹{stock.purchasePrice.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                          ₹{stock.sellingPrice.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetailsPage;
