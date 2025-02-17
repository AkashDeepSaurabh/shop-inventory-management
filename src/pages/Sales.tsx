import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, getDoc, setDoc, updateDoc, doc, addDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';

const SalesPage = () => {
  const [saleId, setSaleId] = useState<string>('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  interface Customer {
    id: string;
    name: string;
    customerNo: string;
    mobile: string;
    email?: string;
    address?: string;
    country?: string;
    state?: string;
  }
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  interface Stock {
    id: string;
    productName: string;
    quantity: number;
    sellingPrice: number;
    productUnit: string;
    brand: string;
    nos: string;
  }

  const [stocks, setStocks] = useState<Stock[]>([]);
  const [productsInSale, setProductsInSale] = useState([
    { productId: '', productName: '', quantity: 1, totalAmount: 0, maxQuantity: 0, unit: '', brand: '', error: '' },
  ]);
  const [paidAmount, setPaidAmount] = useState(0);
  const [dueAmount, setDueAmount] = useState(0);
  const [paidAmountError, setPaidAmountError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
    fetchStocks();
    generateSaleId();
  }, []);

  const fetchCustomers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'customers'));
      const customersData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          customerNo: data.customerNo,
          mobile: data.mobile,
          email: data.email,
          address: data.address,
          country: data.country,
          state: data.state,
        };
      });
      setCustomers(customersData);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to fetch customer details');
    }
  };

  const fetchStocks = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'purchasedStocks'));
      const stocksData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          productName: data.productName,
          quantity: data.quantity,
          sellingPrice: data.sellingPrice,
          productUnit: data.productUnit,
          brand: data.brand,
          nos: data.nos,
        };
      });
      setStocks(stocksData);
    } catch (error) {
      console.error('Error fetching stocks:', error);
      toast.error('Failed to fetch stock details');
    }
  };

  const generateSaleId = async () => {
    try {
      const configDocRef = doc(db, 'config', 'saleNumber');
      const configSnapshot = await getDoc(configDocRef);

      let newSaleId = 'SO0001';
      
      if (configSnapshot.exists()) {
        const lastSaleNumber = configSnapshot.data().lastSaleNumber || 1000;
        newSaleId = `SO${(lastSaleNumber + 1).toString().padStart(4, '0')}`;
        setSaleId(newSaleId);
      } else {
        await setDoc(configDocRef, { lastSaleNumber: 1001 });
        setSaleId('SO0001');
      }
    } catch (error) {
      console.error('Error generating Sale ID:', error);
      setSaleId('SO0001');
    }
  };

  const handleProductChange = (index, selectedOption) => {
    const updatedProducts = [...productsInSale];
    const selectedProductId = selectedOption ? selectedOption.value : '';

    const productExists = productsInSale.some((product) => product.productId === selectedProductId);

    if (productExists) {
      updatedProducts[index].error = 'This product has already been added to the sale';
      setProductsInSale(updatedProducts);
      return;
    }

    updatedProducts[index].productId = selectedProductId;

    const product = stocks.find((stock) => stock.id === selectedProductId);
    if (product) {
      updatedProducts[index].maxQuantity = product.quantity ?? 0;
      updatedProducts[index].unit = product.productUnit ?? '';
      updatedProducts[index].productName = product.productName ?? '';
      updatedProducts[index].totalAmount = (product.sellingPrice ?? 0) * updatedProducts[index].quantity;
      updatedProducts[index].error = '';
      updatedProducts[index].brand = product.brand ?? '';
      setProductsInSale(updatedProducts);
    }
  };

  const handleQuantityChange = (index, e) => {
    const updatedProducts = [...productsInSale];
    const quantity = parseInt(e.target.value, 10);

    const product = stocks.find((stock) => stock.id === updatedProducts[index].productId);
    if (product) {
      const maxQuantity = product.quantity ?? 0;
      if (quantity > maxQuantity) {
        updatedProducts[index].error = `Quantity cannot exceed available stock (${maxQuantity})`;
        updatedProducts[index].quantity = maxQuantity;
        updatedProducts[index].totalAmount = (product.sellingPrice ?? 0) * maxQuantity;
      } else {
        updatedProducts[index].error = '';
        updatedProducts[index].quantity = quantity;
        updatedProducts[index].totalAmount = (product.sellingPrice ?? 0) * quantity;
      }
    }

    setProductsInSale(updatedProducts);
  };

  const handlePaidAmountChange = (e) => {
    let paid = parseFloat(e.target.value);

    if (paid < 0) paid = 0;

    const total = totalAmount;

    if (paid > total) {
      paid = total;
      setPaidAmountError('Paid amount cannot exceed the total amount');
    } else {
      setPaidAmountError('');
    }

    paid = Math.round(paid * 1000) / 1000;
    setPaidAmount(paid);

    const due = Math.max(total - paid, 0);
    setDueAmount(due);
  };

  const addProductRow = () => {
    setProductsInSale([
      ...productsInSale,
      { productId: '', productName: '', quantity: 1, totalAmount: 0, maxQuantity: 0, nos: '', brand: '', error: '' },
    ]);
  };

  const resetSalePage = () => {
    setSelectedCustomer(null);
    setProductsInSale([
      {
        productId: '', quantity: 1, totalAmount: 0, maxQuantity: 0, nos: '', brand: '', error: '',
        productName: ''
      },
    ]);
    setPaidAmount(0);
    setDueAmount(0);
    setPaidAmountError('');
  };

  const handleSale = async (e) => {
    e.preventDefault();

    if (!selectedCustomer || productsInSale.some((product) => !product.productId || product.quantity <= 0 || product.error) || paidAmountError) {
      toast.error('Please fill in all fields and ensure no errors.');
      return;
    }

    const totalAmount = productsInSale.reduce((acc, product) => acc + product.totalAmount, 0);

    const saleDetails = {
      saleId: saleId,
      customerDetails: selectedCustomer.name || 'NA',
      customerAddress: selectedCustomer.address || 'NA',
      customerCountry: selectedCustomer.country || 'NA',
      customerEmail: selectedCustomer.email || 'NA',
      customerID: selectedCustomer.id || 'NA',
      customerMobile: selectedCustomer.mobile || 'NA',
      customerName: selectedCustomer.name || 'NA',
      customerNo: selectedCustomer.customerNo || 'NA',
      customerState: selectedCustomer.state || 'NA',
      dueAmount: totalAmount - paidAmount,
      paidAmount: paidAmount,
      saleDate: new Date(),
      createdAt: new Date(),
      products: productsInSale.map((product) => ({
        productId: product.productId || 'NA',
        productName: product.productName || 'Unknown Product',
        quantity: product.quantity || 0,
        totalAmount: product.totalAmount || 0,
        unit: product.unit || 'NA',
        brand: product.brand || 'NA',
      })),
    };

    try {
      const saleDocRef = await addDoc(collection(db, 'sales'), saleDetails);

      for (const product of productsInSale) {
        const stockProduct = stocks.find((stock) => stock.id === product.productId);
        if (stockProduct) {
          const updatedQuantity = (stockProduct.quantity ?? 0) - product.quantity;
          await updateDoc(doc(db, 'purchasedStocks', product.productId), {
            quantity: updatedQuantity,
            updatedAt: new Date(),
          });
        }
      }

      toast.success('Sale completed successfully!');
      navigate('/print-bill', { state: { saleData: saleDetails } });

      const configDocRef = doc(db, 'config', 'saleNumber');
      const configSnapshot = await getDoc(configDocRef);

      if (configSnapshot.exists()) {
        const lastSaleNumber = configSnapshot.data().lastSaleNumber || 1000;
        const updatedSaleNumber = lastSaleNumber + 1;
        await updateDoc(configDocRef, { lastSaleNumber: updatedSaleNumber });
      }

      generateSaleId();
      resetSalePage();
    } catch (error) {
      console.error('Error completing sale:', error);
      toast.error('Failed to complete the sale');
    }
  };

  const totalAmount = productsInSale.reduce((acc, product) => acc + product.totalAmount, 0);

  const confirmSale = () => {
    const confirmation = window.confirm('Are you sure you want to complete the sale?');
    if (confirmation) {
      handleSale(new Event('submit'));
      resetSalePage();
    }
  };

  const productOptions = stocks.map((stock) => ({
    value: stock.id,
    label: `${stock.productName} - ${stock.brand} (NOS: ${stock.nos})`,
  }));

  const customerOptions = customers.map((customer) => ({
    value: customer.id,
    label: `${customer.name} - ${customer.customerNo} (${customer.mobile})`,
  }));

  const isFormValid = () => {
    const allProductsFilled = productsInSale.every(
      (product) => product.productId && product.quantity > 0 && !product.error
    );
    return selectedCustomer && allProductsFilled && paidAmount >= 0 && !paidAmountError;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-xl">
      <h1 className="text-3xl font-semibold text-gray-900 mb-6">New Sale</h1>
      <div className="text-xl text-indigo-600 font-medium mb-6">
        <span>Sale ID: </span><span className="font-bold">{saleId}</span>
      </div>

      <div className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Customer</label>
          <Select
            value={selectedCustomer ? customerOptions.find(option => option.value === selectedCustomer.id) : null}
            onChange={(selectedOption) => {
              const customer = selectedOption ? customers.find((cust) => cust.id === selectedOption.value) : null;
              setSelectedCustomer(customer || null);
            }}
            options={customerOptions}
            className="w-full rounded-lg border-gray-300 shadow-sm"
            placeholder="Search and Select Customer"
          />
        </div>

        {selectedCustomer && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 mt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <p className="text-sm text-gray-700"><span className="font-medium">Name:</span> {selectedCustomer.name}</p>
              <p className="text-sm text-gray-700"><span className="font-medium">Mobile:</span> {selectedCustomer.mobile}</p>
              <p className="text-sm text-gray-700"><span className="font-medium">Email:</span> {selectedCustomer.email}</p>
              <p className="text-sm text-gray-700"><span className="font-medium">Address:</span> {selectedCustomer.address}</p>
            </div>
          </div>
        )}
        
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Products in Sale</h2>

          {productsInSale.map((product, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-md mb-4">
              <div className="flex items-center space-x-4">
                <Select
                  value={product.productId ? productOptions.find(option => option.value === product.productId) : null}
                  onChange={(selectedOption) => handleProductChange(index, selectedOption)}
                  options={productOptions}
                  placeholder="Search Product"
                  className="w-full rounded-md border-gray-300 shadow-sm"
                />

                <div className="w-20">
                  <input
                    type="number"
                    value={product.quantity}
                    onChange={(e) => handleQuantityChange(index, e)}
                    className="w-full py-2 px-4 rounded-md border-gray-300 shadow-sm"
                    min="1"
                  />
                </div>
              </div>

              {product.error && (
                <p className="text-xs text-red-500 mt-2">{product.error}</p>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addProductRow}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Add More Products
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <div className="flex justify-between">
            <div className="text-lg font-semibold">Total Amount: <span className="font-bold">{totalAmount}</span></div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <div className="text-lg font-semibold">Paid Amount:</div>
              <input
                type="number"
                value={paidAmount}
                onChange={handlePaidAmountChange}
                className="w-32 px-4 py-2 border rounded-md"
                placeholder="Enter Paid Amount"
              />
            </div>

            {paidAmountError && (
              <div className="text-sm text-red-500">{paidAmountError}</div>
            )}
          </div>

          <div className="flex justify-between">
            <div className="text-lg font-semibold">Due Amount:</div>
            <div className="font-bold">{dueAmount}</div>
          </div>

          <div className="mt-6">
            <button
              onClick={confirmSale}
              className={`px-6 py-2 text-sm font-medium text-white rounded-lg ${
                !isFormValid() ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
              }`}
              disabled={!isFormValid()}
            >
              Proceed to Pay
            </button>

            <button
              onClick={resetSalePage}
              className="ml-4 px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
            >
              Reset Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesPage;
