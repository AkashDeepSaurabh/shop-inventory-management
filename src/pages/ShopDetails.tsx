import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

// Define the type for shop details
interface Shop {
  id?: string;
  shopName: string;
  shopEmail: string;
  address: string;
  state: string;
  country: string;
  pinCode: string;
  contactDetails: string;
  authorizedOwner: string;
  gstNumber: string;
}

export default function ShopDetails() {
  const [shopDetails, setShopDetails] = useState<Shop>({
    shopName: '',
    shopEmail: '',
    address: '',
    state: '',
    country: '',
    pinCode: '',
    contactDetails: '',
    authorizedOwner: '',
    gstNumber: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [shops, setShops] = useState<Shop[]>([]);

  // Fetch shops from Firestore
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'shops'));
        const shopsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setShops(shopsList);
      } catch (error) {
        console.error('Error fetching shops:', error);
      }
    };
    fetchShops();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShopDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const areAllFieldsFilled = Object.values(shopDetails).every(
      (field) => field.trim() !== ''
    );
    if (!areAllFieldsFilled) {
      setErrorMessage('Please fill out all fields.');
      return;
    }

    setErrorMessage('');

    try {
      const shopCollectionRef = collection(db, 'shops');
      await addDoc(shopCollectionRef, shopDetails);
      alert('Shop details submitted successfully!');
      setShopDetails({
        shopName: '',
        shopEmail: '',
        address: '',
        state: '',
        country: '',
        pinCode: '',
        contactDetails: '',
        authorizedOwner: '',
        gstNumber: '',
      });

      const querySnapshot = await getDocs(collection(db, 'shops'));
      const shopsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setShops(shopsList);
    } catch (error) {
      console.error('Error adding shop details to Firestore:', error);
      setErrorMessage('Failed to submit shop details.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-4xl p-8 bg-white shadow-lg rounded-lg mb-6">
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">Shop Details</h2>
        {errorMessage && (
          <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
        )}

        {/* Table to display existing shop details */}
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Stored Shop Details</h3>
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
          <table className="min-w-full table-auto divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Shop Name</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Address</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">State</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Country</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Pin Code</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Contact Details</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Authorized Owner</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">GST Number</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shops.map((shop) => (
                <tr key={shop.id}>
                  <td className="px-4 py-2 text-sm text-gray-800">{shop.shopName}</td>
                  <td className='px-4 py-2 text-sm text-gray-800'>{shop.email}</td>
                  <td className="px-4 py-2 text-sm text-gray-800">{shop.address}</td>
                  <td className="px-4 py-2 text-sm text-gray-800">{shop.state}</td>
                  <td className="px-4 py-2 text-sm text-gray-800">{shop.country}</td>
                  <td className="px-4 py-2 text-sm text-gray-800">{shop.pinCode}</td>
                  <td className="px-4 py-2 text-sm text-gray-800">{shop.contactDetails}</td>
                  <td className="px-4 py-2 text-sm text-gray-800">{shop.authorizedOwner}</td>
                  <td className="px-4 py-2 text-sm text-gray-800">{shop.gstNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form to add new shop details */}
      {/* <form onSubmit={handleSubmit} className="w-full max-w-lg p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">Add New Shop</h2>

        <div className="space-y-6">
          <div className="form-group">
            <label htmlFor="shopName" className="block text-sm font-medium text-gray-700">Shop Name</label>
            <input
              type="text"
              id="shopName"
              name="shopName"
              value={shopDetails.shopName}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg mt-1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={shopDetails.address}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg mt-1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
            <input
              type="text"
              id="state"
              name="state"
              value={shopDetails.state}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg mt-1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
            <input
              type="text"
              id="country"
              name="country"
              value={shopDetails.country}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg mt-1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="pinCode" className="block text-sm font-medium text-gray-700">Pin Code</label>
            <input
              type="text"
              id="pinCode"
              name="pinCode"
              value={shopDetails.pinCode}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg mt-1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="contactDetails" className="block text-sm font-medium text-gray-700">Contact Details</label>
            <input
              type="text"
              id="contactDetails"
              name="contactDetails"
              value={shopDetails.contactDetails}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg mt-1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="authorizedOwner" className="block text-sm font-medium text-gray-700">Authorized Owner</label>
            <input
              type="text"
              id="authorizedOwner"
              name="authorizedOwner"
              value={shopDetails.authorizedOwner}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg mt-1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="gstNumber" className="block text-sm font-medium text-gray-700">GST Number</label>
            <input
              type="text"
              id="gstNumber"
              name="gstNumber"
              value={shopDetails.gstNumber}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg mt-1"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </div>
      </form> */}
    </div>
  );
}
