import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { db } from '../lib/firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  query,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import { CircleX, PencilLine, ShoppingCart } from 'lucide-react';

interface Sale {
  id: string;
  saleDate: { toDate: () => Date };
  totalAmount: number;
  status: string;
  paidAmount: number;
}

export default function CustomerDetails() {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();
  const isNewCustomer = id === 'new';

  const [form, setForm] = useState({
    name: '',
    address: '',
    mobile: '',
    customerNo: '',
    countryCode: '+91',
    pinCode: '',
    state: 'Bihar',
    country: 'India',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
              countryCode: customerData.countryCode || '+91',
              pinCode: customerData.pinCode || '',
              state: customerData.state || 'Bihar',
              country: customerData.country || 'India',
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

      fetchCustomerData();
    } else if (isNewCustomer) {
      const generateCustomerNo = async () => {
        try {
          const customersCollection = collection(db, 'customers');
          const customerQuery = query(customersCollection, orderBy('customerNo', 'desc'), limit(1));
          const customerSnapshot = await getDocs(customerQuery);

          if (customerSnapshot.empty) {
            console.log("No customers found. Setting customerNo to 1000");
            setForm((prev) => ({ ...prev, customerNo: '1000' }));
          } else {
            const lastCustomer = customerSnapshot.docs[0].data();
            const newCustomerNo = parseInt(lastCustomer.customerNo, 10) + 1;
            console.log("Generated new customerNo:", newCustomerNo);
            setForm((prev) => ({ ...prev, customerNo: String(newCustomerNo) }));
          }
        } catch (error) {
          console.error('Error generating customer number:', error);
          setForm((prev) => ({ ...prev, customerNo: '1000' }));
        }
      };

      generateCustomerNo();
    }
}, [id, isNewCustomer, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateMobileNumber = (mobile: string) => {
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(mobile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!validateMobileNumber(form.mobile)) {
      setError('Mobile number must be 10 digits long.');
      setIsSubmitting(false);
      return;
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaleClick = () => {
    navigate(`/billing`, {
      state: { customerDetails: form },
    });
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-semibold text-indigo-700 mb-6">
        {isNewCustomer ? 'Add New Customer' : `Edit Customer Details`}
      </h1>

      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-700">
          Customer No: <span className="font-semibold text-indigo-600">{form.customerNo || 'Loading...'}</span>
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium text-gray-600">Customer Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-gray-600">Customer No</label>
            <input
              type="text"
              name="customerNo"
              value={form.customerNo}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-md bg-gray-100 cursor-not-allowed"
              disabled
            />
          </div>

          <div>
            <label className="block font-medium text-gray-600">Mobile No.</label>
            <div className="flex items-center space-x-2">
              <select
                name="countryCode"
                value={form.countryCode}
                onChange={handleChange}
                className="w-1/4 border border-gray-300 px-4 py-2 rounded-md"
                disabled
              >
                <option value="+91">+91 (India)</option>
              </select>
              <input
                type="text"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                className="w-3/4 border border-gray-300 px-4 py-2 rounded-md"
                required
              />
            </div>
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          </div>

          <div>
            <label className="block font-medium text-gray-600">Address</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-gray-600">Pin Code</label>
            <input
              type="text"
              name="pinCode"
              value={form.pinCode}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-gray-600">State</label>
            <select
              name="state"
              value={form.state}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
              required
            >
              <option value="Bihar">Bihar</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Maharashtra">Maharashtra</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-gray-600">Country</label>
            <select
              name="country"
              value={form.country}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
              required
            >
              <option value="India">India</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
            </select>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className={`flex items-center justify-center w-full px-6 py-3 rounded-md text-white font-medium focus:outline-none transition duration-200 ${isSubmitting ? 'bg-gray-500' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            disabled={isSubmitting}
          >
            {isNewCustomer ? (
              <>
                <PencilLine className="w-5 h-5 mr-2" />
                Add Customer
              </>
            ) : (
              <>
                <PencilLine className="w-5 h-5 mr-2" />
                Update Customer
              </>
            )}
          </button>

          <Link
            to="/customers"
            className="flex items-center justify-center w-full px-6 py-3 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition duration-150"
          >
            <CircleX className="w-5 h-5 mr-2" />
            Cancel
          </Link>
        </div>

        <div className="mt-4 flex justify-end">
          <Link
            to="/sales"
            className="flex items-center px-6 py-3 rounded-md bg-green-600 text-white hover:bg-green-700 transition duration-150"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Sale
          </Link>
        </div>
      </form>
    </div>
  );
}
