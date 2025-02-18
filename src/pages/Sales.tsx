import * as React from 'react';
import { useState, useEffect } from 'react';
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
    { productId: '', productName: '', quantity: 1, totalAmount: 0, maxQuantity: 0, unit: '', brand: '', nos: '', error: '' },
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
      ...productsInSale.map(product => ({ ...product, nos: product.nos || '' })),
      {
        productId: '', productName: '', quantity: 1, totalAmount: 0, maxQuantity: 0, unit: '', brand: '', error: '',
        nos: ''
      },
    ]);
  };

  const resetSalePage = () => {
    setSelectedCustomer(null);
    setProductsInSale([
      {
        productId: '', productName: '', quantity: 1, totalAmount: 0, maxQuantity: 0, unit: '', brand: '', nos: '', error: ''
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
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg">
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">New Sale</h1>
                <div className="px-4 py-2 bg-gray-100 rounded-full">
                  <span className="text-gray-600">Sale ID: </span>
                  <span className="font-bold text-gray-900">{saleId}</span>
                </div>
              </div>
            </div>
    
            <div className="p-6 space-y-8">
              {/* Customer Selection */}
              <div className="bg-gray-50 p-6 rounded-lg border">
                <label className="text-lg font-semibold text-gray-900 mb-4 block">
                  Customer Information
                </label>
                <Select
                  value={selectedCustomer ? customerOptions.find(option => option.value === selectedCustomer.id) : null}
                  onChange={(selectedOption) => {
                    const customer = selectedOption ? customers.find((cust) => cust.id === selectedOption.value) : null;
                    setSelectedCustomer(customer || null);
                  }}
                  options={customerOptions}
                  className="w-full"
                  placeholder="Search and Select Customer"
                />
    
                {selectedCustomer && (
                  <div className="mt-4 bg-white rounded-lg p-6 shadow-sm">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <span className="text-sm text-gray-500 block">Name</span>
                        <span className="font-medium text-gray-900">{selectedCustomer.name}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 block">Mobile</span>
                        <span className="font-medium text-gray-900">{selectedCustomer.mobile}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 block">Email</span>
                        <span className="font-medium text-gray-900">{selectedCustomer.email}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 block">Address</span>
                        <span className="font-medium text-gray-900">{selectedCustomer.address}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
    
              {/* Products */}
              <div className="bg-gray-50 p-6 rounded-lg border">
                <label className="text-lg font-semibold text-gray-900 mb-4 block">
                  Products
                </label>
                <div className="space-y-4">
                  {productsInSale.map((product, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex-grow">
                          <label className="text-sm text-gray-600 mb-2 block">Product</label>
                          <Select
                            value={product.productId ? productOptions.find(option => option.value === product.productId) : null}
                            onChange={(selectedOption) => handleProductChange(index, selectedOption)}
                            options={productOptions}
                            placeholder="Search Product"
                            className="w-full"
                          />
                        </div>
                        <div className="w-32">
                          <label className="text-sm text-gray-600 mb-2 block">Quantity</label>
                          <input
                            type="number"
                            value={product.quantity}
                            onChange={(e) => handleQuantityChange(index, e)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min="1"
                          />
                        </div>
                      </div>
                      {product.error && (
                        <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                          {product.error}
                        </div>
                      )}
                    </div>
                  ))}
    
                  <button
                    type="button"
                    onClick={addProductRow}
                    className="w-full px-4 py-3 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 border-2 border-dashed border-blue-200 transition-colors"
                  >
                    + Add Another Product
                  </button>
                </div>
              </div>
    
              {/* Payment Details */}
              <div className="bg-gray-50 p-6 rounded-lg border">
                <label className="text-lg font-semibold text-gray-900 mb-4 block">
                  Payment Details
                </label>
                <div className="space-y-6">
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="text-2xl font-bold text-gray-900">{totalAmount}</span>
                  </div>
    
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Paid Amount</span>
                    <input
                      type="number"
                      value={paidAmount}
                      onChange={handlePaidAmountChange}
                      className="w-48 px-4 py-2 border rounded-lg text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
    
                  {paidAmountError && (
                    <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                      {paidAmountError}
                    </div>
                  )}
    
                  <div className="flex justify-between items-center py-3 border-t">
                    <span className="text-gray-600">Due Amount</span>
                    <span className="text-2xl font-bold text-red-600">{dueAmount}</span>
                  </div>
                </div>
              </div>
    
              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <button
                  onClick={resetSalePage}
                  className="px-6 py-3 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Reset Sale
                </button>
                <button
                  onClick={confirmSale}
                  className={`px-8 py-3 text-sm font-medium text-white rounded-lg transition-colors ${
                    !isFormValid() 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                  disabled={!isFormValid()}
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    };
    
    export default SalesPage;