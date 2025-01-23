import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function PrintBillPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Access the saleData passed through state
  const saleData = location.state?.saleData;

  if (!saleData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-lg text-gray-700">No billing details available.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-500 text-white py-2 px-4 rounded mt-4"
        >
          Go Back
        </button>
      </div>
    );
  }

  const { customerDetails, shopDetails, products, totalAmount, saleDate } = saleData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto border border-gray-300 shadow-lg rounded-lg p-6 bg-white">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">{shopDetails.shopName}</h1>
          <p>{shopDetails.shopAddress}</p>
          <p>
            {shopDetails.state}, {shopDetails.country} - {shopDetails.pinCode}
          </p>
          <p>Contact: {shopDetails.contactDetails}</p>
          <p>Email: {shopDetails.shopEmail}</p>
          {shopDetails.gstNumber && <p>GST Number: {shopDetails.gstNumber}</p>}
        </div>

        {/* Customer and Date */}
        <div className="mb-6">
          <p><strong>Date:</strong> {new Date(saleDate.seconds * 1000).toLocaleDateString()}</p>
          <p><strong>Customer Name:</strong> {customerDetails.customerName}</p>
          <p><strong>Customer Address:</strong> {customerDetails.customerAddress}</p>
          <p><strong>Mobile:</strong> {customerDetails.customerMobile}</p>
          <p><strong>Email:</strong> {customerDetails.customerEmail}</p>
        </div>

        {/* Product Table */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Invoice</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">Item</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Price</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Quantity</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product: any, index: number) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">{product.product}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">₹{product.price}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">{product.quantity}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">₹{product.total}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="border border-gray-300 px-4 py-2 font-bold text-right">
                  Grand Total
                </td>
                <td className="border border-gray-300 px-4 py-2 font-bold text-right">
                  ₹{totalAmount}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <button
            onClick={handlePrint}
            className="bg-green-500 text-white py-2 px-4 rounded"
          >
            Print Bill
          </button>
          <button
            onClick={() => navigate('/billing')}
            className="bg-blue-500 text-white py-2 px-4 rounded ml-4"
          >
            Back to Sales
          </button>
        </div>
      </div>
    </div>
  );
}
