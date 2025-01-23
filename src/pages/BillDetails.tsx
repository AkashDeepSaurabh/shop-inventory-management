import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function BillDetails() {
  const { saleId } = useParams<{ saleId: string }>();
  const [billData, setBillData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBillData = async () => {
      if (saleId) {
        try {
          const saleDoc = doc(db, 'sales', saleId);
          const saleSnap = await getDoc(saleDoc);

          if (saleSnap.exists()) {
            setBillData(saleSnap.data());
          } else {
            setError('Bill not found!');
          }
        } catch (error) {
          console.error('Error fetching bill data:', error);
          setError('Error fetching bill data!');
        }
      }
    };

    fetchBillData();
  }, [saleId]);

  if (error) {
    return <div>{error}</div>;
  }

  // Ensure `billData` is available before rendering
  if (!billData) {
    return <div>Loading...</div>;
  }

  // Table rendering for sales data
  const renderSalesData = () => {
    return (
      <table className="w-full mt-4">
        <thead>
          <tr>
            <th className="text-left p-2">Item</th>
            <th className="text-left p-2">Price</th>
            <th className="text-left p-2">Quantity</th>
            <th className="text-left p-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {billData.products.map((product: any, index: number) => (
            <tr key={index}>
              <td className="p-2">{product.product}</td>
              <td className="p-2">₹{product.price}</td>
              <td className="p-2">{product.quantity}</td>
              <td className="p-2">₹{product.total}</td>
            </tr>
          ))}
          <tr>
            <td className="p-2 font-semibold" colSpan={3}>
              Grand Total
            </td>
            <td className="p-2 font-semibold">₹{billData.totalAmount}</td>
          </tr>
        </tbody>
      </table>
    );
  };

  const handlePrint = () => {
    window.print(); // Trigger print functionality
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Bill Details</h1>

      {/* Customer Details (Row View) */}
      <div className="flex mb-6">
        <div className="w-1/2 pr-4">
          <h3 className="font-semibold">Customer Details</h3>
          <p><strong>Name:</strong> {billData.customerDetails.customerName}</p>
          <p><strong>Address:</strong> {billData.customerDetails.customerAddress}</p>
          <p><strong>Mobile:</strong> {billData.customerDetails.customerMobile}</p>
          <p><strong>Email:</strong> {billData.customerDetails.customerEmail}</p>
          <p><strong>Country:</strong> {billData.customerDetails.customerCountry}</p>
          <p><strong>State:</strong> {billData.customerDetails.customerState}</p>
        </div>

        {/* Shop Details (Row View) */}
        <div className="w-1/2 pl-4">
          <h3 className="font-semibold">Shop Details</h3>
          <p><strong>Shop Name:</strong> {billData.shopDetails.shopName}</p>
          <p><strong>Address:</strong> {billData.shopDetails.shopAddress}</p>
          <p><strong>Pin Code:</strong> {billData.shopDetails.pinCode}</p>
          <p><strong>Owner:</strong> {billData.shopDetails.authorizedOwner}</p>
          <p><strong>Contact:</strong> {billData.shopDetails.contactDetails}</p>
          <p><strong>Email:</strong> {billData.shopDetails.shopEmail}</p>
          <p><strong>GST Number:</strong> {billData.shopDetails.gstNumber}</p>
        </div>
      </div>

      {/* Sales Data (Table View) */}
      {renderSalesData()}

      {/* Print Button */}
      <div className="text-center mt-6">
        <button
          onClick={handlePrint}
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          Print Bill
        </button>
      </div>

      {/* CSS for print styling */}
      <style>
        {`
          @media print {
            .no-print {
              display: none;
            }
            /* Add any other print-specific styles here */
          }
        `}
      </style>
    </div>
  );
}
