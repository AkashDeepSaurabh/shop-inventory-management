import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';

// Define interface for Sale type
interface Sale {
  id: string;
  saleDate: { toDate: () => Date };
  totalAmount: number;
  status: string;
  paidAmount: number; // Add paidAmount to Sale interface
}

export default function CustomerDetails() {
  const { id } = useParams<{ id: string }>(); // Destructuring assignment
  const navigate = useNavigate();
  const isNewCustomer = id === 'new';

  const [form, setForm] = useState({
    name: '',
    address: '',
    mobile: '',
    customerNo: '',
    countryCode: '+91', // Default country code set to India
    pinCode: '',
    state: 'Bihar', // Default state set to Bihar
    country: 'India', // Default country set to India
  });

  // Specify the type of sales state
  const [sales, setSales] = useState<Sale[]>([]); // Correct type for sales state
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isNewCustomer && id) {
      const fetchCustomerData = async () => {
        try {
          const customerDoc = doc(db, 'customers', id);
          const customerSnap = await getDoc(customerDoc);

          if (customerSnap.exists()) {
            const customerData = customerSnap.data();
            setForm({
              name: customerData.name,
              address: customerData.address,
              mobile: customerData.mobile,
              customerNo: customerData.customerNo,
              countryCode: customerData.countryCode || '+91', // Ensure countryCode is set
              pinCode: customerData.pinCode || '',
              state: customerData.state || 'Bihar', // Ensure state is set
              country: customerData.country || 'India', // Ensure country is set
            });
          } else {
            alert('Customer not found!');
            navigate('/customers');
          }
        } catch (error) {
          console.error('Error fetching customer data:', error);
          alert('Error fetching customer data!');
        }
      };

      const fetchSalesData = async () => {
        if (id || form.customerNo) {
          try {
            const salesCollection = collection(db, 'sales');

            // Start with querying by customerId
            let salesQuery = query(
              salesCollection,
              where('customerId', '==', id), // Check by customerId
              orderBy('saleDate', 'desc')
            );

            // If customerId is missing, use customerNo instead
            if (!id && form.customerNo) {
              salesQuery = query(
                salesCollection,
                where('customerNo', '==', form.customerNo), // Check by customerNo
                orderBy('saleDate', 'desc')
              );
            }

            console.log('Sales Query:', salesQuery); // Log the query for debugging

            const salesSnapshot = await getDocs(salesQuery);
            const salesData = salesSnapshot.docs.map((doc) => ({
              id: doc.id, // Capture sale ID
              ...doc.data()
            }));
            console.log('Sales Data:', salesData); // Log the fetched data for debugging
            setSales(salesData);

            // Check if no sales data returned
            if (salesData.length === 0) {
              console.log('No sales data found for this customer.');
            }
          } catch (error) {
            console.error('Error fetching sales data:', error);
            setSales([]);
          }
        }
      };

      fetchCustomerData();
      fetchSalesData();
    } else if (isNewCustomer) {
      const generateCustomerNo = async () => {
        try {
          const customersCollection = collection(db, 'customers');
          const customerQuery = query(customersCollection, orderBy('customerNo', 'desc'), limit(1));
          const customerSnapshot = await getDocs(customerQuery);

          if (customerSnapshot.empty) {
            setForm((prev) => ({ ...prev, customerNo: '1000' })); // Start from 1000
          } else {
            const lastCustomer = customerSnapshot.docs[0].data();
            const newCustomerNo = parseInt(lastCustomer.customerNo, 10) + 1;
            setForm((prev) => ({ ...prev, customerNo: String(newCustomerNo) }));
          }
        } catch (error) {
          console.error('Error generating customer number:', error);
          setForm((prev) => ({ ...prev, customerNo: '1000' })); // Fallback to 1000
        }
      };

      generateCustomerNo();
    }
  }, [id, form.customerNo, isNewCustomer, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateMobileNumber = (mobile: string) => {
    // Check if the mobile number is exactly 10 digits
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(mobile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Reset error message

    // Check if the mobile number is valid
    if (!validateMobileNumber(form.mobile)) {
      setError('Mobile number must be 10 digits long.');
      return; // Early return if validation fails
    }

    try {
      if (isNewCustomer) {
        const newCustomerRef = doc(collection(db, 'customers'));
        await setDoc(newCustomerRef, { ...form, countryCode: form.countryCode });

        alert('New customer added!');
      } else {
        const customerRef = doc(db, 'customers', id!);
        await setDoc(customerRef, { ...form, countryCode: form.countryCode }, { merge: true });

        alert(`Customer ${id} details updated!`);
      }

      navigate('/customers');
    } catch (error) {
      console.error('Error saving customer data:', error);
      alert('Error saving customer data!');
    }
  };

  const handleSaleClick = () => {
    navigate(`/billing`, {
      state: { customerDetails: form }, // Pass customer details to SalesPage
    });
  };

  // Function to print the sale bill (This part can be improved for better printing functionality)
  const printBill = (sale: Sale) => {
    const printWindow = window.open('', '', 'width=600,height=600');
    printWindow?.document.write(`
      <html>
      <head><title>Invoice</title></head>
      <body>
        <h1>Invoice</h1>
        <p><strong>Customer Name:</strong> ${form.name}</p>
        <p><strong>Customer No:</strong> ${form.customerNo}</p>
        <p><strong>Sale Date:</strong> <span class="math-inline">\{sale\.saleDate?\.toDate\(\)\.toLocaleString\(\)\}</p\>
        <p\><strong\>Total Amount\:</strong\> ₹</span>{sale.totalAmount}</p>
        <p><strong>Status:</strong> ${sale.status || 'Completed'}</p>
        <hr />
        <button onclick="window.print()">Print this page</button>
      </body>
      </html>
    `);
    printWindow?.document.close();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        {isNewCustomer ? 'Add New Customer' : `Edit Customer Details`}
      </h1>

      {/* Display Customer Number */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold">{`Customer No: ${form.customerNo || 'Loading...'}`}</h2>
      </div>
      {/* Form for adding/editing customer */}
      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="mb-4">
          <label className="block font-medium mb-1">Customer Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Customer No</label>
          <input
            type="text"
            name="customerNo"
            value={form.customerNo}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            disabled
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Mobile No.</label>
          <div className="flex space-x-2">
            <select
              name="countryCode"
              value={form.countryCode}
              onChange={handleChange}
              className="border px-3 py-2 rounded w-1/4"
              disabled
            >
              <option value="+91">+91 (India)</option>
            </select>
            <input
              type="text"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              className="w-3/4 border px-3 py-2 rounded"
              required
            />
          </div>
          {error && <p className="text-red-500 mt-1">{error}</p>}
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Address</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Pin Code</label>
          <input
            type="text"
            name="pinCode"
            value={form.pinCode}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">State</label>
          <select
            name="state"
            value={form.state}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="Bihar">Bihar</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Maharashtra">Maharashtra</option>
            {/* Add other states as needed */}
          </select>
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Country</label>
          <select
            name="country"
            value={form.country}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="India">India</option>
            <option value="USA">USA</option>
            <option value="UK">UK</option>
            {/* Add other countries as needed */}
          </select>
        </div>

        <div className="flex space-x-4">
           <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
            {isNewCustomer ? 'Add Customer' : 'Update Customer'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/customers')}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          {/* Sale Button */}
          <button
            type="button"
            onClick={handleSaleClick}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Sale
          </button>
        </div>
      </form>

       {/* Sales History Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Sales History</h2>
        {sales.length > 0 ? (
          <table className="w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border px-4 py-2">Sale Date</th>
                <th className="border px-4 py-2">Amount</th>
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Paid Amount</th>
                <th className="border px-4 py-2">Due Amount</th>
                <th className="border px-4 py-2">Total Amount</th>
                <th className="border px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{sale.saleDate?.toDate().toLocaleString()}</td>
                  <td className="border px-4 py-2">₹{sale.totalAmount}</td>
                  <td className="border px-4 py-2">{sale.status || 'Completed'}</td>
                  <td className="border px-4 py-2">₹{sale.paidAmount || 0}</td>
                  <td className="border px-4 py-2">₹{sale.totalAmount - (sale.paidAmount || 0)}</td>
                  <td className="border px-4 py-2">₹{sale.totalAmount}</td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => navigate(`/bill/${sale.id}`)}
                      className="bg-purple-500 text-white px-4 py-2 rounded"
                    >
                      View Bill
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No sales found for this customer.</p>
        )}
      </div>
    </div>
  );
}