import { Fragment, useState } from 'react';
import { Disclosure, Transition } from '@headlessui/react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, X, Home, ShoppingBag, DollarSign, Users, Box, Plus, ShoppingCart, LogOut, Edit, ChevronRight } from 'lucide-react';
import React from 'react';
import Dashboard from '../pages/Dashboard';
import SalesDashboard from '../pages/SalesDashboard';

const navigation = [
  { name: 'Dashboard', href: '/', icon: <Home className="w-5 h-5" /> },
  { name: 'Add New Customers', href: '/customers/new', icon: <Users className="w-5 h-5" /> },
  { name: 'Sales Management', href: '/sales', icon: <DollarSign className="w-5 h-5" /> },
  { name: 'Billing Management', href: '/customer-sales', icon: <ShoppingBag className="w-5 h-5" /> },
  { name: 'Customer Management', href: '/customers', icon: <Users className="w-5 h-5" /> },
  { name: 'Stocks Management', href: '/stocks', icon: <Box className="w-5 h-5" /> },
  { name: 'Sales Dashboard', href: '/sales-dashboard', icon: <DollarSign className="w-5 h-5" /> },
  { name: 'Shop Management', href: '/shop-details', icon: <ShoppingCart className="w-5 h-5" /> },
];

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Main Content Wrapper */}
        <div className="w-full">
          {/* Header */}
          <div className="bg-white shadow-sm sticky top-0 z-20">
            <div className="px-4 sm:px-6">
              <div className="flex items-center h-16">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="inline-flex items-center justify-center p-2 mr-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                >
                  {menuOpen ? (
                    <X className="block h-6 w-6" />
                  ) : (
                    <Menu className="block h-6 w-6" />
                  )}
                </button>
                <Link to="/" className="flex items-center space-x-2">
                  <ShoppingCart className="w-6 h-6 text-indigo-600" />
                  <h1 className="text-xl font-semibold text-gray-900">Shop Inventory</h1>
                </Link>
              </div>
            </div>

            {/* Navigation Menu */}
            <div
              className={`fixed inset-0 z-10 transform ${
                menuOpen ? 'translate-x-0' : '-translate-x-full'
              } transition-transform duration-300 ease-in-out`}
              onClick={() => setMenuOpen(false)}
            >
              <div
                className="fixed inset-y-0 left-0 w-full max-w-xs bg-white shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="h-full flex flex-col bg-gradient-to-b from-indigo-600 to-indigo-800">
                  <div className="flex items-center justify-between h-16 px-4 border-b border-indigo-500">
                    <Link to="/" className="flex items-center space-x-2" onClick={() => setMenuOpen(false)}>
                      <ShoppingCart className="w-6 h-6 text-white" />
                      <h1 className="text-xl font-bold text-white">Shop Inventory</h1>
                    </Link>
                    <button
                      onClick={() => setMenuOpen(false)}
                      className="p-2 rounded-md text-white hover:bg-white/10"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="flex-1 px-2 pt-4 pb-3 space-y-1 overflow-y-auto">
                    {navigation.map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={({ isActive }) =>
                          `block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                            isActive
                              ? 'bg-white/10 text-white'
                              : 'text-indigo-100 hover:bg-white/5 hover:text-white'
                          }`
                        }
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          {item.name}
                        </div>
                      </NavLink>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="w-full mt-4 flex items-center px-3 py-2 rounded-lg text-base font-medium text-red-200 hover:bg-red-500/20 hover:text-red-100 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <LogOut className="w-5 h-5" />
                        Logout
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <main className="py-6">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Floating Icon - FAB */}
      <div
        className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 cursor-pointer"
        onClick={() => setDrawerOpen(true)}
      >
        <Plus className="w-6 h-6" />
      </div>

      {/* Drawer for Sales and Add New Customer */}
      <Transition
        show={drawerOpen}
        enter="transition ease-in-out duration-300"
        enterFrom="transform opacity-0 translate-x-full"
        enterTo="transform opacity-100 translate-x-0"
        leave="transition ease-in-out duration-300"
        leaveFrom="transform opacity-100 translate-x-0"
        leaveTo="transform opacity-0 translate-x-full"
      >
        <div className="fixed inset-0 z-20 bg-gray-900 bg-opacity-50" onClick={() => setDrawerOpen(false)}></div>
      </Transition>

      <Transition
        show={drawerOpen}
        enter="transition ease-in-out duration-300"
        enterFrom="transform opacity-0 translate-x-full"
        enterTo="transform opacity-100 translate-x-0"
        leave="transition ease-in-out duration-300"
        leaveFrom="transform opacity-100 translate-x-0"
        leaveTo="transform opacity-0 translate-x-full"
      >
        <div className="fixed inset-y-0 right-0 w-72 bg-white shadow-lg z-30">
          <div className="h-full flex flex-col py-6 px-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Quick Actions</h3>
              <button onClick={() => setDrawerOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mt-6 space-y-4">
              <button
                onClick={() => handleNavigation('/sales')}
                className="flex items-center text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-md"
              >
                <DollarSign className="w-5 h-5 mr-3" />
                Sales
              </button>
              <button
                onClick={() => handleNavigation('/customers/new')}
                className="flex items-center text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-md"
              >
                <Plus className="w-5 h-5 mr-3" />
                Add New Customer
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  );
}
