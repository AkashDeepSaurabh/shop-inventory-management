import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Sales from './pages/Sales';
import NewSale from './pages/NewSale';
import CustomerManagement from './pages/CustomerManagement';
import React from 'react';
import CustomerDetails from './pages/CustomerDetails';
import BillingPage from './pages/BillingPage';
import ShopDetails from './pages/ShopDetails';
import PrintBillPage from './pages/PrintBillPage';
import BillDetails from './pages/BillDetails';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="sales" element={<Sales />} />
          <Route path="sales/new" element={<NewSale />} />
          <Route path="/customers" element={<CustomerManagement />} />
          <Route path="customers/:id" element={<CustomerDetails />} />
          <Route path="/customers/new/edit" element={<CustomerDetails />} />
          <Route path="/customers/:id" element={<CustomerDetails />} />
          <Route path="/customers/:id/edit" element={<CustomerDetails />} />
          <Route path="/billing" element={<BillingPage />} />
          {/* <Route path="/firm-details" element={<ShopDetails />} /> Updated the path */}
          <Route path="/" element={<BillingPage />} />
          <Route path="/print-bill" element={<PrintBillPage />} />
          <Route path="/bill/:saleId" element={<BillDetails />} /> {/* This route for displaying bills */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
