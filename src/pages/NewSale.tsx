import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, SaleItem } from '../types';
import toast from 'react-hot-toast';

export default function NewSale() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedItems, setSelectedItems] = useState<SaleItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [manualProduct, setManualProduct] = useState<string>('');
  const [manualQuantity, setManualQuantity] = useState<number>(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const searchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(productsData);
      setFilteredProducts(productsData); // Initialize filtered list with all products
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    // Filter products based on the search term
    if (searchTerm) {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const handleAddItem = (product: Product) => {
    const existingItem = selectedItems.find((item) => item.productId === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.quantity) {
        toast.error('Not enough stock available');
        return;
      }
      setSelectedItems((items) =>
        items.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1, purchasePrice: item.purchasePrice || 0, sellPrice: item.sellPrice || 0 }
            : item
        )
      );
    } else {
      if (product.quantity <= 0) {
        toast.error('Not enough stock available');
        return;
      }
      setSelectedItems((items) => [
        ...items,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          price: product.price || 0,
          purchasePrice: product.purchasePrice || 0,  // Ensure purchasePrice is included
          sellPrice: product.sellPrice || 0,          // Ensure sellPrice is included
        },
      ]);
    }
  };

  const handleManualAddItem = () => {
    if (!selectedProduct) {
      toast.error('Please select a product from the dropdown');
      return;
    }

    if (selectedProduct.quantity < manualQuantity) {
      toast.error('Not enough stock available');
      return;
    }

    const existingItem = selectedItems.find((item) => item.productId === selectedProduct.id);
    if (existingItem) {
      setSelectedItems((items) =>
        items.map((item) =>
          item.productId === selectedProduct.id
            ? { ...item, quantity: item.quantity + manualQuantity, purchasePrice: item.purchasePrice || 0, sellPrice: item.sellPrice || 0 }
            : item
        )
      );
    } else {
      setSelectedItems((items) => [
        ...items,
        {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          quantity: manualQuantity,
          price: selectedProduct.price || 0,
          purchasePrice: selectedProduct.purchasePrice || 0,  // Ensure purchasePrice is included
          sellPrice: selectedProduct.sellPrice || 0,          // Ensure sellPrice is included
        },
      ]);
    }

    setManualProduct('');
    setManualQuantity(1);
    setSelectedProduct(null);
  };

  const handleRemoveItem = (productId: string) => {
    setSelectedItems((items) => items.filter((item) => item.productId !== productId));
  };

  const calculateTotal = () => {
    return selectedItems.reduce((sum, item) => sum + item.quantity * (item.price || 0), 0);
  };

  const handleProceedToCheckout = async () => {
    if (!customerName || !customerMobile || !customerAddress) {
      toast.error('Please fill in all customer details (Name, Mobile, Address)');
      return;
    }
    if (selectedItems.length === 0) {
      toast.error('Please add items to the sale');
      return;
    }

    try {
      const sale = {
        items: selectedItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
        })),
        total: calculateTotal(),
        date: new Date(),
        customerName,
        customerMobile,
        customerAddress,
        status: 'pending',
      };

      await addDoc(collection(db, 'sales'), sale);

      for (const item of selectedItems) {
        const productRef = doc(db, 'products', item.productId);
        const productSnapshot = await getDoc(productRef);
        const productData = productSnapshot.data();
        const updatedQuantity = (productData?.quantity || 0) - item.quantity;

        if (updatedQuantity < 0) {
          toast.error('Not enough stock available');
          return;
        }

        await updateDoc(productRef, {
          quantity: updatedQuantity,
          updatedAt: new Date(),
        });
      }

      toast.success('Sale pending for checkout');
      navigate('/sales');
    } catch (error) {
      toast.error('Failed to proceed to checkout');
      console.error('Checkout Error:', error);
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
      setIsDropdownVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Customer Details Form */}
      <div>
        <h1 className="text-base font-semibold leading-6 text-gray-900">New Sale</h1>
      </div>

      <div>
        <h2 className="text-lg font-medium leading-6 text-gray-900">Customer Details</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Customer Mobile</label>
            <input
              type="text"
              value={customerMobile}
              onChange={(e) => setCustomerMobile(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Customer Address</label>
            <textarea
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
        </div>
      </div>

      {/* Product Selection Section */}
      <div>
        <h2 className="text-lg font-medium leading-6 text-gray-900">Add Product</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Search Product</label>
            <input
              ref={searchRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={() => setIsDropdownVisible(true)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Search for a product..."
            />
          </div>
          {isDropdownVisible && (
            <div className="mt-2 border border-gray-300 rounded-md max-h-48 overflow-auto">
              <ul>
                {filteredProducts.map((product) => (
                  <li
                    key={product.id}
                    className="px-4 py-2 cursor-pointer hover:bg-indigo-100"
                    onClick={() => {
                      setSearchTerm(product.name);
                      setSelectedProduct(product);
                      setIsDropdownVisible(false);
                    }}
                  >
                    {product.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              value={manualQuantity}
              onChange={(e) => setManualQuantity(Number(e.target.value))}
              min={1}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <button
              onClick={handleManualAddItem}
              className="mt-2 w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            >
              Add to Sale
            </button>
          </div>
        </div>
      </div>

      {/* Selected Items Table */}
      <div>
        <h2 className="text-lg font-medium leading-6 text-gray-900">Selected Items</h2>
        <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Product Name</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-900">Quantity</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-900">Price</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-900">Total</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {selectedItems.map((item) => (
                <tr key={item.productId}>
                  <td className="px-4 py-2 text-sm text-gray-700">{item.productName}</td>
                  <td className="px-4 py-2 text-sm text-right text-gray-700">{item.quantity}</td>
                  <td className="px-4 py-2 text-sm text-right text-gray-700">{item.price}</td>
                  <td className="px-4 py-2 text-sm text-right text-gray-700">
                    {item.quantity * item.price}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleRemoveItem(item.productId)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total and Checkout */}
      <div className="mt-6 flex justify-between">
        <span className="text-lg font-semibold text-gray-900">Total:</span>
        <span className="text-lg font-semibold text-gray-900">{calculateTotal()}</span>
      </div>

      <div className="mt-4">
        <button
          onClick={handleProceedToCheckout}
          className="w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
