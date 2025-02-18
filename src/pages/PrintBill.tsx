import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase'; // Ensure you have Firebase setup
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

const PrintBill = () => {
  const [saleData, setSaleData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const location = useLocation();
  const navigate = useNavigate();

  // Get the saleId from the URL query string
  const searchParams = new URLSearchParams(location.search);
  const saleId = searchParams.get('saleId');

  useEffect(() => {
    if (!saleId) {
      setError('Sale ID is missing.');
      setLoading(false);
      return;
    }

    // Fetch sale data based on the saleId from Firestore
    const fetchSaleData = async () => {
      try {
        // Query the sales collection using saleId field
        const salesQuery = query(
          collection(db, 'sales'),
          where("saleId", "==", saleId)
        );
        const querySnapshot = await getDocs(salesQuery);

        if (!querySnapshot.empty) {
          // If the sale document is found, set the sale data
          querySnapshot.forEach((doc) => {
            console.log(doc.id, doc.data()); // Log the sale data
            setSaleData(doc.data());
          });
        } else {
          // If no matching document is found, set error message
          setError('No sale found with the provided Sale ID.');
        }
      } catch (error) {
        console.error('Error fetching sale data:', error);
        setError('Error fetching sale details.');
      } finally {
        setLoading(false);
      }
    };

    fetchSaleData();
  }, [saleId]);

  if (loading) {
    return <p>Loading sale details...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!saleData) {
    return <p>No sale data available.</p>;
  }

  const TAX_RATE = 0.082; // 8.2% tax rate
  const subtotal = saleData.products.reduce((sum: number, product: any) => sum + product.totalAmount, 0);
  const taxAmount = subtotal * TAX_RATE;
  const total = subtotal + taxAmount;

  const formatDate = (date: any) => {
    return new Date(date?.seconds ? date.seconds * 1000 : date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white">
      {/* Header Section */}
      <div className="flex justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
          <p className="text-gray-500 mt-1">Tax Invoice/Bill of Supply/Cash Memo</p>
          <p className="text-gray-500">(Original for Recipient)</p>
        </div>
        <div className="text-right">
          <p className="text-gray-600 font-medium">Invoice No: {saleData.saleId}</p>
          <p className="text-gray-600">Date: {formatDate(saleData.saleDate)}</p>
        </div>
      </div>

      {/* Company & Customer Details */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="space-y-2">
          <h3 className="font-bold text-gray-800">Sold By:</h3>
          <p className="text-gray-600">Your Company Name</p>
          <p className="text-gray-600">123 Business Street</p>
          <p className="text-gray-600">City, State 12345</p>
          <p className="text-gray-600">GSTIN: XX-XXXXXXXX</p>
        </div>
        <div className="space-y-2">
          <h3 className="font-bold text-gray-800">Billing Address:</h3>
          <p className="text-gray-600">{saleData.customerName}</p>
          <p className="text-gray-600">{saleData.customerAddress}</p>
          <p className="text-gray-600">Mobile: {saleData.customerMobile}</p>
          <p className="text-gray-600">Email: {saleData.customerEmail}</p>
        </div>
      </div>

      {/* Products Table */}
      <div className="mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left border border-gray-200 font-semibold">Description</th>
              <th className="px-4 py-2 text-left border border-gray-200 font-semibold">Brand</th>
              <th className="px-4 py-2 text-center border border-gray-200 font-semibold">Qty</th>
              <th className="px-4 py-2 text-center border border-gray-200 font-semibold">Unit</th>
              <th className="px-4 py-2 text-right border border-gray-200 font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {saleData.products.map((product: any, index: number) => (
              <tr key={index} className="border-b">
                <td className="px-4 py-2 border border-gray-200">{product.productName}</td>
                <td className="px-4 py-2 border border-gray-200">{product.brand}</td>
                <td className="px-4 py-2 text-center border border-gray-200">{product.quantity}</td>
                <td className="px-4 py-2 text-center border border-gray-200">{product.unit}</td>
                <td className="px-4 py-2 text-right border border-gray-200">
                  ₹ {product.totalAmount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="w-72 ml-auto space-y-2">
        <div className="flex justify-between border-b pb-2">
          <span className="font-medium">Subtotal:</span>
          <span>₹ {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="font-medium">Tax (8.2%):</span>
          <span>₹ {taxAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="font-medium">Total Amount:</span>
          <span className="font-bold">₹ {total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="font-medium">Paid Amount:</span>
          <span>₹ {saleData.paidAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Balance Due:</span>
          <span>₹ {saleData.dueAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Terms and Notes */}
      <div className="mt-8 text-sm text-gray-600">
        <p className="font-medium mb-2">Terms & Conditions:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Payment is due within 30 days</li>
          <li>Goods once sold cannot be returned</li>
          <li>This is a computer generated invoice</li>
        </ul>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-8 border-t">
        <div className="flex justify-between">
          <div className="text-gray-600">
            <p className="font-medium">Authorized Signatory</p>
            <div className="mt-16 border-t border-gray-400 w-48">
              <p className="text-sm mt-1">For Your Company Name</p>
            </div>
          </div>
          <div className="text-right text-gray-600">
            <p className="italic">Thank you for your business!</p>
          </div>
        </div>
      </div>

      {/* Print Button */}
      <div className="mt-8 text-center print:hidden">
        <button
          onClick={() => window.print()}
          className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Print Invoice
        </button>
      </div>
    </div>
  );
};

export default PrintBill;
