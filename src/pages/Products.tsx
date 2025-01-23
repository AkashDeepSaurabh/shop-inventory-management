import { useEffect, useState } from 'react';
import { collection, addDoc, updateDoc, doc, getDocs, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import toast from 'react-hot-toast';
import React from 'react';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    quantity: 0,
    category: '',
    brand: '',
    purchasePrice: 0,
    sellPrice: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      console.log('Fetched products:', productsData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newProduct.name ||
      !newProduct.description ||
      newProduct.price <= 0 ||
      newProduct.quantity < 0 ||
      !newProduct.category ||
      !newProduct.brand ||
      newProduct.purchasePrice <= 0 ||
      newProduct.sellPrice <= 0
    ) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      await addDoc(collection(db, 'products'), {
        ...newProduct,
        price: parseFloat(newProduct.price.toString()),
        quantity: parseInt(newProduct.quantity.toString(), 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      setIsAddingProduct(false);
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        quantity: 0,
        category: '',
        brand: '',
        purchasePrice: 0,
        sellPrice: 0,
      });
      toast.success('Product added successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    }
  };

  const handleEditProduct = (product: Product) => {
    setIsEditingProduct(true);
    setProductToEdit(product);
    setNewProduct({
      name: product.name || '',
      description: product.description || '',
      price: Number(product.price) || 0,
      quantity: Number(product.quantity) || 0,
      category: product.category || '',
      brand: product.brand || '',
      purchasePrice: Number(product.purchasePrice) || 0,
      sellPrice: Number(product.sellPrice) || 0,
    });
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newProduct.name ||
      !newProduct.description ||
      newProduct.price <= 0 ||
      newProduct.quantity < 0 ||
      !newProduct.category ||
      !newProduct.brand ||
      newProduct.purchasePrice <= 0 ||
      newProduct.sellPrice <= 0
    ) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      const productRef = doc(db, 'products', productToEdit!.id);
      const productDoc = await getDoc(productRef);

      if (!productDoc.exists()) {
        toast.error('Product not found to update');
        return;
      }

      await updateDoc(productRef, {
        ...newProduct,
        updatedAt: new Date(),
      });

      setIsEditingProduct(false);
      setProductToEdit(null);
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        quantity: 0,
        category: '',
        brand: '',
        purchasePrice: 0,
        sellPrice: 0,
      });
      toast.success('Product updated successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    setProducts((prevProducts) => prevProducts.filter((product) => product.id !== productId));

    try {
      await deleteDoc(doc(db, 'products', productId));
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
      fetchProducts();
    }
  };

  const handleUpdateStock = async (productId: string, newQuantity: number) => {
    try {
      await updateDoc(doc(db, 'products', productId), {
        quantity: newQuantity,
        updatedAt: new Date(),
      });
      toast.success('Stock updated successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
    }
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Products</h1>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => {
              // Toggle the form visibility
              if (isEditingProduct) {
                setIsEditingProduct(false);
              } else {
                setIsAddingProduct(!isAddingProduct);
              }
            }}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-500"
          >
            {isAddingProduct || isEditingProduct ? 'Close Form' : 'Add Product'}
          </button>
        </div>
      </div>

      {(isAddingProduct || isEditingProduct) && (
        <form
          onSubmit={isEditingProduct ? handleUpdateProduct : handleAddProduct}
          className="space-y-4 bg-white p-6 rounded-lg shadow mt-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              required
              value={newProduct.name}
              onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              required
              value={newProduct.description}
              onChange={(e) => setNewProduct((prev) => ({ ...prev, description: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={newProduct.price}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, price: parseFloat(e.target.value) }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity</label>
              <input
                type="number"
                required
                min="0"
                value={newProduct.quantity}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, quantity: parseInt(e.target.value, 10) }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <input
                type="text"
                required
                value={newProduct.category}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, category: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Brand</label>
              <input
                type="text"
                required
                value={newProduct.brand}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, brand: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Purchase Price</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={newProduct.purchasePrice}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, purchasePrice: parseFloat(e.target.value) }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sell Price</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={newProduct.sellPrice}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, sellPrice: parseFloat(e.target.value) }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              type="submit"
              className="inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              {isEditingProduct ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6">
        <table className="min-w-full table-auto">
          <thead>
            <tr>
              <th className="py-3 px-6 text-left text-sm font-medium text-gray-500">Name</th>
              <th className="py-3 px-6 text-left text-sm font-medium text-gray-500">Price</th>
              <th className="py-3 px-6 text-left text-sm font-medium text-gray-500">Quantity</th>
              <th className="py-3 px-6 text-left text-sm font-medium text-gray-500">Category</th>
              <th className="py-3 px-6 text-left text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b">
                <td className="py-3 px-6 text-sm text-gray-900">{product.name}</td>
                <td className="py-3 px-6 text-sm text-gray-900">₹ {product.price}</td>
                <td className="py-3 px-6 text-sm text-gray-900">{product.quantity}</td>
                <td className="py-3 px-6 text-sm text-gray-900">{product.category}</td>
                <td className="py-3 px-6 text-sm text-gray-900">
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
