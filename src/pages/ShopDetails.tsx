import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchShops = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'shops'));
        const shopsList = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            shopName: data.shopName,
            shopEmail: data.shopEmail,
            address: data.address,
            state: data.state,
            country: data.country,
            pinCode: data.pinCode,
            contactDetails: data.contactDetails,
            authorizedOwner: data.authorizedOwner,
            gstNumber: data.gstNumber,
          };
        });
        setShops(shopsList);
      } catch (error) {
        console.error('Error fetching shops:', error);
      }
      setIsLoading(false);
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
    setIsLoading(true);

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

      // Re-fetch the list of shops after submission
      const querySnapshot = await getDocs(collection(db, 'shops'));
      const shopsList = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          shopName: data.shopName,
          shopEmail: data.shopEmail,
          address: data.address,
          state: data.state,
          country: data.country,
          pinCode: data.pinCode,
          contactDetails: data.contactDetails,
          authorizedOwner: data.authorizedOwner,
          gstNumber: data.gstNumber,
        };
      });
      setShops(shopsList);
    } catch (error) {
      console.error('Error adding shop details to Firestore:', error);
      setErrorMessage('Failed to submit shop details.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 via-indigo-200 to-purple-300 py-12 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Existing Shops Section */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">Shop Details</h2>
          
          {errorMessage && (
            <div className="mb-4 p-4 bg-red-50 rounded-md">
              <p className="text-red-600 text-base">{errorMessage}</p>
            </div>
          )}
  
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-indigo-500 to-purple-600">
                  <tr>
                    {['Shop Name', 'Shop Email', 'Address', 'State', 'Country', 'Pin Code', 'Contact Details', 'Authorized Owner', 'GST Number'].map((header) => (
                      <th key={header} className="px-6 py-4 text-left text-base font-medium text-white uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shops.map((shop) => (
                    <tr key={shop.id} className="hover:bg-gray-50 transition-all duration-200">
                      {Object.entries(shop)
                        .filter(([key]) => key !== 'id')
                        .map(([key, value]) => (
                          <td key={key} className="px-6 py-4 whitespace-nowrap text-base text-gray-700">
                            {value}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
  
        {/* Add New Shop Form */}
        <div className="bg-white rounded-xl shadow-xl p-8">
  <h2 className="text-3xl font-semibold text-gray-800 mb-6">Add a New Shop to Your Network</h2>
  <p className="text-lg text-gray-600 mb-6">Fill in the details below to add a new shop. Make sure all required fields are completed before submitting.</p>
  <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Object.keys(shopDetails).map((field) => {
        // Determine the placeholder for each field
        const placeholders = {
          shopName: "Hanuman Hardware",
          shopEmail: "example@domain.com",
          address: "123 Main Street",
          state: "Karnataka",
          country: "India",
          pinCode: "560001",
          contactDetails: "+91 9876543210",
          authorizedOwner: "Ravi Kumar",
          gstNumber: "29ABCDE1234F1Z5"
        };

        return (
          <div key={field} className="space-y-2">
            <label 
              htmlFor={field}
              className="block text-lg font-medium text-gray-700"
            >
              {field
                .replace(/([A-Z])/g, ' $1')  // Add a space before each capital letter
                .replace(/^./, (str) => str.toUpperCase()) // Capitalize the first letter
              }
            </label>
            <input
              type="text"
              id={field}
              name={field}
              value={shopDetails[field as keyof Shop]}
              onChange={handleChange}
              placeholder={placeholders[field]} // Set the placeholder dynamically
              className={`block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-3 px-4 transition-all ${
                errorMessage && (shopDetails[field as keyof Shop] ?? '').trim() === ''
                  ? 'border-red-500'
                  : ''
              }`}
              required
            />
            {errorMessage && shopDetails[field as keyof Shop]?.trim() === '' && (
              <p className="text-sm text-red-600">This field is required</p>
            )}
          </div>
        );
      })}
    </div>

    <div className="mt-8">
      <button
        type="submit"
        className={`w-full md:w-auto px-8 py-4 text-lg ${
          isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
        } text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all`}
        disabled={isLoading}
      >
        {isLoading ? 'Submitting...' : 'Submit Shop Details'}
      </button>
    </div>
  </form>
</div>

      </div>
    </div>
  );
}  