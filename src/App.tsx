import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import CustomerManagement from './pages/CustomerManagement';
import React, { useState, useEffect } from 'react';
import CustomerDetails from './pages/CustomerDetails';
import ShopDetails from './pages/ShopDetails';
import PurchaseOrder from './pages/Purchaseorder';
import StockDetailsPage from './pages/StockDetailsPage';
import AddProduct from './pages/AddProduct';
import CustomerSalesPage from './pages/CustomerSalesPage';
import PrintBill from './pages/PrintBill';
import LowStockPage from './pages/LowStockPage';
import PaymentMethodPage from './pages/PaymentMethodPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check for authentication status when the app loads
  useEffect(() => {
    const user = localStorage.getItem('user'); // Check if user exists in localStorage
    if (user) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user'); // Remove user from localStorage on logout
    setIsAuthenticated(false); // Update state to reflect logout
  };

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Redirect to login page if not authenticated */}
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
        />
        
        {/* Login route */}
        <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={isAuthenticated ? <Layout handleLogout={handleLogout} /> : <Navigate to="/login" />}
        >
          <Route path="/signup" element={<SignupPage />} /> {/* Signup page */}
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="sales" element={<Sales />} />
          <Route path="customers" element={<CustomerManagement />} />
          <Route path="customers/:id" element={<CustomerDetails />} />
          <Route path="customers/new/edit" element={<CustomerDetails />} />
          <Route path="customers/:id/edit" element={<CustomerDetails />} />
          <Route path="firm-details" element={<ShopDetails />} />
          <Route path="print-bill" element={<PrintBill />} />
          <Route path="customer-sales" element={<CustomerSalesPage />} />
          <Route path="customer/:id" element={<CustomerDetails />} />
          <Route path="purchase-order" element={<PurchaseOrder />} />
          <Route path="stocks" element={<StockDetailsPage />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="low-stock-products" element={<LowStockPage />} />
          <Route path="payment-method" element={<PaymentMethodPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
