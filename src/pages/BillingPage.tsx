import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, setDoc, Timestamp } from 'firebase/firestore';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';

interface Product {
  label: string;
  value: string; // Product ID
  price: number;
}

interface BillingRow {
  product: Product | null;
  unit: number;
  total: number;
}

export default function BillingPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [billingDetails, setBillingDetails] = useState({
    customerName: '',
    customerAddress: '',
    customerMobile: '',
    customerEmail: '',
    customerCountry: 'India',
    customerState: 'Bihar',
    customerNo: '', // Field for customer number
    customerID: '', // Field for customer ID
  });

  const [shopDetails, setShopDetails] = useState({
    shopName: '',
    shopAddress: '',
    authorizedOwner: '',
    state: '',
    country: '',
    pinCode: '',
    contactDetails: '',
    shopEmail: '',
    gstNumber: '',
    shopWebsite: '',
  });

  const [billingRows, setBillingRows] = useState<BillingRow[]>([
    { product: null, unit: 1, total: 0 },
  ]);

  const [paidAmount, setPaidAmount] = useState(0);

  // Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productCollection = collection(db, 'products');
        const productSnapshot = await getDocs(productCollection);
        const productList = productSnapshot.docs.map((doc) => {
          const productData = doc.data();
          return {
            label: productData.name,
            value: productData.id,
            price: productData.price,
          };
        });
        setProducts(productList);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  // Fetch customer details from Firestore
  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        const customerCollection = collection(db, 'customers');
        const customerSnapshot = await getDocs(customerCollection);
        if (!customerSnapshot.empty) {
          const customerDoc = customerSnapshot.docs[0]; // Assuming the first customer
          const customerData = customerDoc.data();

          console.log('Customer Document ID:', customerDoc.id); // Log document ID
          console.log('Customer Data:', customerData); // Log full customer data

          setBillingDetails((prevDetails) => ({
            ...prevDetails,
            customerName: customerData.name || '',
            customerAddress: customerData.address || '',
            customerMobile: customerData.mobile || '',
            customerEmail: customerData.email || '',
            customerCountry: customerData.country || 'India',
            customerState: customerData.state || 'Bihar',
            customerNo: customerData.customerNo || 'N/A', // Correct field for customer number
            customerID: customerDoc.id, // Customer ID (document ID)
          }));
        } else {
          console.log('No customers found.');
        }
      } catch (error) {
        console.error('Error fetching customer details:', error);
      }
    };

    fetchCustomerDetails();
  }, []);

  // Fetch shop details from Firestore
  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        const shopCollection = collection(db, 'shops');
        const shopSnapshot = await getDocs(shopCollection);
        if (!shopSnapshot.empty) {
          const shopData = shopSnapshot.docs[0].data();
          setShopDetails({
            shopName: shopData.shopName || '',
            shopAddress: shopData.address || '',
            authorizedOwner: shopData.authorizedOwner || '',
            contactDetails: shopData.contactDetails || '',
            shopEmail: shopData.email || '',
            shopWebsite: shopData.website || '',
            state: shopData.state || '',
            country: shopData.country || '',
            pinCode: shopData.pinCode || '',
            gstNumber: shopData.gstNumber || '',
          });
        }
      } catch (error) {
        console.error('Error fetching shop details:', error);
      }
    };

    fetchShopDetails();
  }, []);

  const handleProductChange = (selectedOption: Product | null, index: number) => {
    const newRows = [...billingRows];
    newRows[index].product = selectedOption;
    newRows[index].total = selectedOption ? selectedOption.price * newRows[index].unit : 0;
    setBillingRows(newRows);
  };

  const handleUnitChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newRows = [...billingRows];
    const unit = parseInt(event.target.value) || 1;
    newRows[index].unit = unit;

    if (newRows[index].product) {
      newRows[index].total = newRows[index].product.price * unit;
    }
    setBillingRows(newRows);
  };

  const getAvailableProducts = (index: number) => {
    const selectedProducts = billingRows.map((row) => row.product?.value);
    return products.filter((product) => !selectedProducts.includes(product.value));
  };

  const addRow = () => {
    setBillingRows([...billingRows, { product: null, unit: 1, total: 0 }]);
  };

  const calculateGrandTotal = () => {
    return billingRows.reduce((sum, row) => sum + row.total, 0);
  };

  const calculateDueAmount = () => {
    return Math.max(calculateGrandTotal() - paidAmount, 0);
  };

  const confirmSale = async () => {
    if (window.confirm('Are you sure you want to complete the sale?')) {
      try {
        const saleData = {
          customerDetails: {
            customerName: billingDetails.customerName,
            customerAddress: billingDetails.customerAddress,
            customerMobile: billingDetails.customerMobile,
            customerEmail: billingDetails.customerEmail,
            customerCountry: billingDetails.customerCountry,
            customerState: billingDetails.customerState,
            customerNo: billingDetails.customerNo,
            customerID: billingDetails.customerID,
          },
          shopDetails: shopDetails,
          products: billingRows
            .filter((row) => row.product !== null)
            .map((row) => ({
              product: row.product?.label,
              price: row.product?.price,
              quantity: row.unit,
              total: row.total,
            })),
          totalAmount: calculateGrandTotal(),
          paidAmount: paidAmount,
          dueAmount: calculateDueAmount(),
          saleDate: Timestamp.now(),
        };

        const salesRef = collection(db, 'sales');
        await setDoc(doc(salesRef), saleData);

        navigate('/print-bill', { state: { saleData } });
      } catch (error) {
        console.error('Error completing sale:', error);
        alert('There was an error completing the sale.');
      }
    }
  };

  return (
    <div className="flex">
      <div className="w-1/2 p-4">
        <h2 className="text-2xl font-semibold mb-4">Billing Details</h2>
        <div className="text-sm text-gray-600 mb-6">
          <h3 className="font-semibold">Customer Details</h3>
          <p><strong>Name:</strong> {billingDetails.customerName}</p>
          <p><strong>Address:</strong> {billingDetails.customerAddress}</p>
          <p><strong>Mobile:</strong> {billingDetails.customerMobile}</p>
          <p><strong>Email:</strong> {billingDetails.customerEmail}</p>
          <p><strong>Country:</strong> {billingDetails.customerCountry}</p>
          <p><strong>State:</strong> {billingDetails.customerState}</p>
          <p><strong>Customer No:</strong> {billingDetails.customerNo || 'N/A'}</p>
        </div>
        <div className="text-sm text-gray-600">
          <h3 className="font-semibold">Shop Details</h3>
          <p><strong>Name:</strong> {shopDetails.shopName}</p>
          <p><strong>Address:</strong> {shopDetails.shopAddress}</p>
          <p><strong>Pin Code:</strong> {shopDetails.pinCode || 'N/A'}</p>
          <p><strong>Owner:</strong> {shopDetails.authorizedOwner}</p>
          <p><strong>Contact:</strong> {shopDetails.contactDetails}</p>
          <p><strong>Email:</strong> {shopDetails.shopEmail || 'N/A'}</p>
        </div>
      </div>
      <div className="w-1/2 p-4">
        <button onClick={addRow} className="bg-blue-500 text-white py-2 px-4 rounded mb-4">
          Add Product
        </button>
        <div className="border-t border-gray-300 pt-4">
          <h3 className="text-lg font-semibold">Billing Table</h3>
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
              {billingRows.map((row, index) => (
                <tr key={index}>
                  <td className="p-2">
                    <Select
                      options={products}
                      onChange={(selectedOption) => handleProductChange(selectedOption, index)}
                      value={row.product}
                      getOptionLabel={(e) => e.label}
                      getOptionValue={(e) => e.value}
                      isClearable
                      placeholder="Select Product"
                    />
                  </td>
                  <td className="p-2">{row.product ? `₹${row.product.price}` : '₹0'}</td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={row.unit}
                      onChange={(e) => handleUnitChange(e, index)}
                      className="w-16 p-1 border border-gray-300"
                      min="0"
                      disabled={!row.product}
                    />
                  </td>
                  <td className="p-2">{row.product ? `₹${row.total}` : '₹0'}</td>
                </tr>
              ))}
              <tr>
                <td className="p-2 font-semibold" colSpan={3}>Grand Total</td>
                <td className="p-2 font-semibold">₹{calculateGrandTotal()}</td>
              </tr>
              <tr>
                <td className="p-2 font-semibold" colSpan={3}>Paid Amount</td>
                <td className="p-2">
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(parseInt(e.target.value) || 0)}
                    className="w-20 p-1 border border-gray-300"
                    min="0"
                  />
                </td>
              </tr>
              <tr>
                <td className="p-2 font-semibold" colSpan={3}>Due Amount</td>
                <td className="p-2 font-semibold">₹{calculateDueAmount()}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button onClick={confirmSale} className="bg-green-500 text-white py-2 px-4 rounded mt-4">
          Confirm Sale
        </button>
      </div>
    </div>
  );
}
