import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import CustomerManagement from './pages/CustomerManagement';
import React from 'react';
import CustomerDetails from './pages/CustomerDetails';
import ShopDetails from './pages/ShopDetails';
import PurchaseOrder from './pages/Purchaseorder';
import StockDetailsPage from './pages/StockDetailsPage';
import AddProduct from './pages/AddProduct';
import CustomerSalesPage from './pages/CustomerSalesPage';
import PrintBill from './pages/PrintBill';
import LowStockPage from './pages/LowStockPage';
function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="sales" element={<Sales />} />
          <Route path="/customers" element={<CustomerManagement />} />
          <Route path="customers/:id" element={<CustomerDetails />} />
          <Route path="/customers/new/edit" element={<CustomerDetails />} />
          <Route path="/customers/:id/edit" element={<CustomerDetails />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/firm-details" element={<ShopDetails />} />
          <Route path="/print-bill" element={<PrintBill />} />
          
          {/* Customer List Page route */}
          <Route path="/customer-sales" element={<CustomerSalesPage />} />
          <Route path="/customer/:id" element={<CustomerDetails />} />
          {/* <Route path="/customer-bill/:customerId" element={<CustomerBill />} />

          <Route path="/edit-customer/:customerId" element={<CustomerBill />} /> */}

          {/* Add the PurchaseOrder route */}
          <Route path="/purchase-order" element={<PurchaseOrder />} />
          <Route path='/stocks' element={<StockDetailsPage />} />
          <Route path='/add-product' element={<AddProduct />} />
          <Route path="/low-stock-products" element={<LowStockPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
