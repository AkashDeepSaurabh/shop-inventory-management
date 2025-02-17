import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { ShoppingBag, Package, Store, AlertCircle, CheckCircle, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PurchaseOrder() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [purchaseOrder, setPurchaseOrder] = useState({
    productName: '',
    productId: '',
    purchasePrice: 0,
    sellingPrice: 0,
    brand: '',
    nos: '',
    vendorId: '',
    quantity: 1,
    purchaseDate: new Date(),
  });

  useEffect(() => {
    fetchVendors();
    fetchProducts();
  }, []);

  const fetchVendors = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'vendors'));
      const vendorsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVendors(vendorsData);
    } catch (error) {
      setError('Failed to fetch vendors');
    }
  };

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'ProductNames'));
      const productsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsData);
    } catch (error) {
      setError('Failed to fetch products');
    }
  };

  const handleProductSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productName = e.target.value;
    const product = products.find((p) => p.productName === productName);
    setSelectedProduct(product);
    setError('');

    if (product) {
      setPurchaseOrder({
        ...purchaseOrder,
        productName: product.productName,
        productId: product.id,
        purchasePrice: product.purchasePrice || 0,
        sellingPrice: product.sellingPrice || 0,
        brand: product.brand || '',
        nos: product.nos || '',
      });
    }
  };

  const handleVendorUpdate = async (vendorId: string, vendorDetails: any) => {
    const vendorDocRef = doc(db, 'vendors', vendorId);
    try {
      const vendorDoc = await getDocs(vendorDocRef);
      if (vendorDoc.exists()) {
        await updateDoc(vendorDocRef, vendorDetails);
      } else {
        await addDoc(collection(db, 'vendors'), vendorDetails);
      }
    } catch (error) {
      setError('Failed to update or add vendor');
    }
  };

  const handleAddPurchaseOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const purchaseOrderId = `PO${('0000' + (Math.floor(Math.random() * 10000) + 1)).slice(-4)}`;
      const selectedVendor = vendors.find((v) => v.id === purchaseOrder.vendorId);
      if (selectedVendor) {
        await handleVendorUpdate(purchaseOrder.vendorId, {
          name: selectedVendor.name,
          address: selectedVendor.address,
          contact: selectedVendor.contact,
        });
      }

      const productRef = collection(db, 'purchasedStocks');
      const productQuery = query(
        productRef,
        where("productId", "==", purchaseOrder.productId),
        where("vendorId", "==", purchaseOrder.vendorId)
      );

      const existingProductRef = await getDocs(productQuery);

      if (!existingProductRef.empty) {
        const existingProduct = existingProductRef.docs[0];
        const updatedQuantity = existingProduct.data().quantity + purchaseOrder.quantity;

        await updateDoc(doc(db, 'purchasedStocks', existingProduct.id), {
          purchasePrice: purchaseOrder.purchasePrice,
          sellingPrice: purchaseOrder.sellingPrice,
          quantity: updatedQuantity,
          updatedAt: new Date(),
        });
      } else {
        await addDoc(collection(db, 'purchasedStocks'), {
          productId: purchaseOrder.productId,
          productName: purchaseOrder.productName,
          purchasePrice: purchaseOrder.purchasePrice,
          sellingPrice: purchaseOrder.sellingPrice,
          brand: purchaseOrder.brand,
          nos: purchaseOrder.nos,
          vendorId: purchaseOrder.vendorId,
          quantity: purchaseOrder.quantity,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      await addDoc(collection(db, 'purchaseOrders'), {
        purchaseOrderId,
        productId: purchaseOrder.productId,
        productName: purchaseOrder.productName,
        purchasePrice: purchaseOrder.purchasePrice,
        sellingPrice: purchaseOrder.sellingPrice,
        brand: purchaseOrder.brand,
        nos: purchaseOrder.nos,
        vendorId: purchaseOrder.vendorId,
        quantity: purchaseOrder.quantity,
        purchaseDate: purchaseOrder.purchaseDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      setSuccessMessage('Purchase order and stock updated successfully!');
      setPurchaseOrder({
        productName: '',
        productId: '',
        purchasePrice: 0,
        sellingPrice: 0,
        brand: '',
        nos: '',
        vendorId: '',
        quantity: 1,
        purchaseDate: new Date(),
      });
      setSelectedProduct(null);
      setTimeout(() => setSuccessMessage(''), 5000);

    } catch (error) {
      setError('Failed to create or update purchase order');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-3 bg-indigo-50 rounded-lg">
              <ShoppingBag className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Purchase Order</h1>
              <p className="text-sm text-gray-500 mt-1">Add new purchase orders to your inventory</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-600">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleAddPurchaseOrder} className="space-y-8">
            {/* Product Details */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Package className="w-5 h-5 text-gray-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Product Details</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Product</label>
                  <select
                    value={purchaseOrder.productName}
                    onChange={handleProductSelection}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                    required
                  >
                    <option value="">Choose a product...</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.productName}>
                        {product.productName}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedProduct && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                      <input
                        type="text"
                        value={purchaseOrder.brand}
                        onChange={(e) => setPurchaseOrder({ ...purchaseOrder, brand: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">NOS</label>
                      <input
                        type="text"
                        value={purchaseOrder.nos}
                        onChange={(e) => setPurchaseOrder({ ...purchaseOrder, nos: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Price (₹)</label>
                      <input
                        type="number"
                        value={purchaseOrder.purchasePrice}
                        onChange={(e) => setPurchaseOrder({ ...purchaseOrder, purchasePrice: parseFloat(e.target.value) })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price (₹)</label>
                      <input
                        type="number"
                        value={purchaseOrder.sellingPrice}
                        onChange={(e) => setPurchaseOrder({ ...purchaseOrder, sellingPrice: parseFloat(e.target.value) })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Store className="w-5 h-5 text-gray-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    value={purchaseOrder.quantity}
                    onChange={(e) => setPurchaseOrder({ ...purchaseOrder, quantity: parseInt(e.target.value, 10) })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Vendor</label>
                  <select
                    value={purchaseOrder.vendorId}
                    onChange={(e) => setPurchaseOrder({ ...purchaseOrder, vendorId: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                    required
                  >
                    <option value="">Choose a vendor...</option>
                    {vendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button Section */}
            <div className="flex justify-between pt-6">
              <Link
                to="/stocks"
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Back to Stocks
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className={`inline-flex items-center px-6 py-3 bg-indigo-600 text-sm font-medium text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-sm
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Creating Order...' : 'Create Purchase Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}