import { Fragment, useState } from 'react';
import { Disclosure, Transition } from '@headlessui/react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, X, Home, ShoppingBag, DollarSign, Users, Box, Plus, ShoppingCart, LogOut } from 'lucide-react';
import React from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: <Home className="w-5 h-5" /> },
  { name: 'Add New Customers', href: '/customers/new', icon: <Users className="w-5 h-5" /> },
  { name: 'Sales', href: '/sales', icon: <DollarSign className="w-5 h-5" /> },
  { name: 'Billing Management', href: '/customer-sales', icon: <ShoppingBag className="w-5 h-5" /> },
  { name: 'Customer Management', href: '/customers', icon: <Users className="w-5 h-5" /> },
  { name: 'Stocks', href: '/stocks', icon: <Box className="w-5 h-5" /> },
];

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

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
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-grow bg-gradient-to-b from-indigo-600 to-indigo-800 overflow-y-auto">
            <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-indigo-500">
              <Link to="/" className="flex items-center space-x-2">
                <ShoppingCart className="w-8 h-8 text-white" />
                <h1 className="text-2xl font-bold text-white">Shop Inventory</h1>
              </Link>
            </div>
            <nav className="mt-8 flex-1 px-2 space-y-1 mb-16">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-white/10 text-white shadow-sm'
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
                className="w-full mt-8 flex items-center px-4 py-3 text-sm font-medium rounded-lg text-red-200 hover:bg-red-500/20 hover:text-red-100 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5" />
                  Logout
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:pl-72 w-full">
          <Disclosure as="nav" className="bg-white shadow-sm lg:hidden sticky top-0 z-10">
            {({ open }) => (
              <>
                <div className="mx-auto px-4 sm:px-6">
                  <div className="flex justify-between h-16">
                    <div className="flex items-center">
                      <Link to="/dashboard" className="flex items-center space-x-2">
                        <ShoppingCart className="w-6 h-6 text-indigo-600" />
                        <h1 className="text-xl font-semibold text-gray-900">Shop Inventory</h1>
                      </Link>
                    </div>
                    <div className="flex items-center lg:hidden">
                      <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                        <span className="sr-only">Open main menu</span>
                        {open ? (
                          <X className="block h-6 w-6" />
                        ) : (
                          <Menu className="block h-6 w-6" />
                        )}
                      </Disclosure.Button>
                    </div>
                  </div>
                </div>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-150"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Disclosure.Panel className="lg:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                      {navigation.map((item) => (
                        <NavLink
                          key={item.name}
                          to={item.href}
                          className={({ isActive }) =>
                            `block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                              isActive
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-700 hover:bg-indigo-500 hover:text-white'
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
                        className="w-full mt-2 flex items-center px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <LogOut className="w-5 h-5" />
                          Logout
                        </div>
                      </button>
                    </div>
                  </Disclosure.Panel>
                </Transition>
              </>
            )}
          </Disclosure>

          {/* Main Content */}
          <main className="py-6">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}