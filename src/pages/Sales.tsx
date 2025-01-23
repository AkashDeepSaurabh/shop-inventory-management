import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Sale } from '../types';
import { format } from 'date-fns';
import React from 'react';

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // Fetch sales data from Firestore
  useEffect(() => {
    const fetchSales = async () => {
      const querySnapshot = await getDocs(collection(db, 'sales'));
      const salesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
      })) as Sale[];
      setSales(salesData.sort((a, b) => b.date.getTime() - a.date.getTime()));
    };

    fetchSales();
  }, []);

  // Toggle the dropdown or modal for the selected sale
  const handleBillClick = (sale: Sale) => {
    setSelectedSale(sale);
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Sales History</h1>
        </div>
      </div>

      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                Customer No.
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Customer
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Mobile No.
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Address
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Paid
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Dues Amount
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Total
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Bill
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {sales.map((sale, index) => (
              <tr key={sale.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-6">
                  {index + 1}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {sale.customerName}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {sale.customerMobile}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {sale.customerAddress}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  ${sale.paid.toFixed(2)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  ${sale.duesAmount.toFixed(2)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  ${(sale.paid + sale.duesAmount).toFixed(2)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <button
                    onClick={() => handleBillClick(sale)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View Bill
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedSale && (
        <div className="mt-6 p-6 bg-white border border-gray-200 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold">Sale Details</h2>
          <p><strong>Customer:</strong> {selectedSale.customerName}</p>
          <p><strong>Mobile No.:</strong> {selectedSale.customerMobile}</p>
          <p><strong>Address:</strong> {selectedSale.customerAddress}</p>
          <p><strong>Date:</strong> {format(selectedSale.date, 'MMM d, yyyy HH:mm')}</p>
          <p><strong>Paid:</strong> ${selectedSale.paid.toFixed(2)}</p>
          <p><strong>Dues Amount:</strong> ${selectedSale.duesAmount.toFixed(2)}</p>
          <p><strong>Total:</strong> ${(selectedSale.paid + selectedSale.duesAmount).toFixed(2)}</p>

          <h3 className="mt-4 font-semibold">Items</h3>
          <ul className="list-disc ml-6">
            {selectedSale.items.map((item, index) => (
              <li key={index}>{item.productName} x {item.quantity}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
