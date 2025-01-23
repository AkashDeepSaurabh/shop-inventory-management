import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function CustomerManagement() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<{ [key: string]: number }>({});

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

  // Fetch sales data from Firestore
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const salesCollection = collection(db, 'sales');
        const salesSnapshot = await getDocs(salesCollection);

        const salesMap: { [key: string]: number } = {};
        salesSnapshot.docs.forEach((doc) => {
          const sale = doc.data();
          const { customerId, paid, duesAmount } = sale;

          if (!salesMap[customerId]) {
            salesMap[customerId] = 0;
          }
          salesMap[customerId] += paid + duesAmount;
        });

        setSalesData(salesMap);
      } catch (error) {
        console.error('Error fetching sales:', error);
      }
    };

    fetchSales();
  }, []);

  const handleEdit = (id: string) => {
    navigate(`/customers/${id}/edit`);
  };

  const handleSale = (id: string) => {
    navigate(`/billing?customerId=${id}`);
  };

  const viewDetails = (id: string) => {
    navigate(`/customers/${id}`);
  };

  const addCustomer = () => {
    navigate(`/customers/new`);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Customer Management</h1>
      <button
        onClick={addCustomer}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Add Customer
      </button>
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 border">Customer No.</th>
            <th className="px-4 py-2 border">Customer Name</th>
            <th className="px-4 py-2 border">Address</th>
            <th className="px-4 py-2 border">Mobile No.</th>
            <th className="px-4 py-2 border">Total Sales (₹)</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id} className="hover:bg-gray-100">
              <td className="px-4 py-2 border">{customer.customerNo}</td>
              <td
                className="px-4 py-2 border text-blue-600 cursor-pointer"
                onClick={() => viewDetails(customer.id)}
              >
                {customer.name}
              </td>
              <td className="px-4 py-2 border">{customer.address}</td>
              <td className="px-4 py-2 border">{customer.mobile}</td>
              <td className="px-4 py-2 border">
                ₹{salesData[customer.id]?.toFixed(2) || '0.00'}
              </td>
              <td className="px-4 py-2 border space-x-2">
                <button
                  onClick={() => handleEdit(customer.id)}
                  className="bg-indigo-500 text-white px-4 py-2 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleSale(customer.id)}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Sale
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
