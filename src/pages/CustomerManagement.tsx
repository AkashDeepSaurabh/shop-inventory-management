import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { PlusCircle, Edit2, ShoppingCart, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CustomerManagement() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<{ [key: string]: any[] }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 10;

  // Create a filteredCustomers array based on the search term and sort them by name
  const filteredCustomers = customers
    .filter(customer => {
      const customerName = customer.name ? customer.name.toLowerCase() : '';
      const search = searchTerm.toLowerCase();
      return customerName.includes(search);
    })
    .sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });

  // Calculate pagination values
  const totalCustomers = filteredCustomers.length;
  const totalPages = Math.ceil(totalCustomers / customersPerPage);
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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

  // Fetch sales history data
  useEffect(() => {
    const fetchSalesHistory = async () => {
      try {
        const salesCollection = collection(db, 'sales');
        const salesSnapshot = await getDocs(salesCollection);
        const salesMap: { [key: string]: any[] } = {};
        
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
            saleDate: saleDate.toDate().toLocaleDateString(),
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

  const changePage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
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
              {currentCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {customer.customerNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => viewDetails(customer.id)}
                      className="text-sm text-indigo-600 hover:text-indigo-900 font-medium inline-flex items-center space-x-1"
                    >
                      <span>{customer.name}</span>
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Showing {indexOfFirstCustomer + 1}-{Math.min(indexOfLastCustomer, totalCustomers)} of {totalCustomers} customers</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <div className="flex items-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => changePage(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      pageNum === currentPage
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              <button
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}