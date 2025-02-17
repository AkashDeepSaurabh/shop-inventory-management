import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { PlusCircle, Edit2, ShoppingCart, Eye } from 'lucide-react';

export default function CustomerManagement() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<{ [key: string]: any[] }>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Create a filteredCustomers array based on the search term and sort them by name
  const filteredCustomers = customers
    .filter(customer => {
      const customerName = customer.name ? customer.name.toLowerCase() : '';
      const search = searchTerm.toLowerCase();
      return customerName.includes(search);
    })
    .sort((a, b) => {
      // Sort customers by name (case-insensitive)
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });

  // Fetch customers from Firestore
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const customersCollection = collection(db, 'customers');
        const customersSnapshot = await getDocs(customersCollection);
        const customersList = customersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCustomers(customersList);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    fetchCustomers();
  }, []);

  // Fetch sales history data for each customer from Firestore based on CustomerNo
  useEffect(() => {
    const fetchSalesHistory = async () => {
      try {
        const salesCollection = collection(db, 'sales');
        const salesSnapshot = await getDocs(salesCollection);

        // Initialize an object to hold sales for each customer by CustomerNo
        const salesMap: { [key: string]: any[] } = {};

        // Iterate through the sales data and group them by CustomerNo
        salesSnapshot.docs.forEach((doc) => {
          const sale = doc.data();
          const { customerNo, paidAmount, dueAmount, saleDate } = sale;

          if (!salesMap[customerNo]) {
            salesMap[customerNo] = [];
          }

          salesMap[customerNo].push({
            saleId: doc.id,
            paidAmount,
            dueAmount,
            saleDate: saleDate.toDate().toLocaleDateString(), // Convert Firestore timestamp to a human-readable date
          });
        });

        setSalesData(salesMap);
      } catch (error) {
        console.error('Error fetching sales data:', error);
      }
    };

    fetchSalesHistory();
  }, []);

  const handleEdit = (id: string) => {
    navigate(`/customers/${id}/edit`);
  };

  const handleSale = (id: string) => {
    navigate(`/sales?customerId=${id}`);
  };

  const viewDetails = (id: string) => {
    navigate(`/customers/${id}`);
  };

  const addCustomer = () => {
    navigate(`/customers/new`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="mt-2 text-sm text-gray-600">Manage your customers and their sales history</p>
        </div>
        <button
          onClick={addCustomer}
          className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors duration-200"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Add Customer
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium">Customer No</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Name</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Address</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Mobile</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Total Sales</th>
                <th className="px-6 py-4 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {customer.customerNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => viewDetails(customer.id)}
                      className="text-sm text-indigo-600 hover:text-indigo-900 font-medium inline-flex items-center space-x-1"
                    >
                      <span>{customer.name}</span> {/* Ensure this is 'name' */}
                      <Eye className="w-4 h-4 opacity-70" />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {customer.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {customer.mobile}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{(salesData[customer.customerNo]?.reduce((total, sale) => total + sale.paidAmount, 0) || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-3">
                    <button
                      onClick={() => handleEdit(customer.id)}
                      className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors duration-200"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleSale(customer.id)}
                      className="inline-flex items-center px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 text-sm font-medium rounded-lg transition-colors duration-200"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      <span>Sale</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
