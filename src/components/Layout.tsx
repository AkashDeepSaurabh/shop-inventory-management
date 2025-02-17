import { Fragment } from 'react';
import { Disclosure, Transition } from '@headlessui/react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Menu, X, Home, ShoppingBag, DollarSign, Users, Store, Box, Plus, ShoppingCart } from 'lucide-react';
import React, { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: <Home className="w-5 h-5" /> },
  {name: 'Add New Customers', href: '/customers/new/edit', icon: <Users className="w-5 h-5" /> },
  { name: 'Sales', href: '/sales', icon: <DollarSign className="w-5 h-5" /> },
  { name: 'Billing Management', href: '/customer-sales', icon: <ShoppingBag className="w-5 h-5" /> },
  { name: 'Customer Management', href: '/customers', icon: <Users className="w-5 h-5" /> },
  // { name: 'Shop Details', href: '/firm-details', icon: <Store className="w-5 h-5" /> },
  { name: 'Stocks', href: '/stocks', icon: <Box className="w-5 h-5" /> },
  { name: 'Payment Method', href: '/payment-method', icon: <DollarSign className="w-5 h-5" /> },
  
];

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-grow bg-indigo-600 overflow-y-auto">
            <div className="flex items-center h-16 flex-shrink-0 px-4">
              <h1 className="text-2xl font-bold text-white">Shop Inventory</h1>
            </div>
            <nav className="mt-8 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-700 text-white'
                        : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    {item.name}
                  </div>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:pl-72 w-full">
          <Disclosure as="nav" className="bg-white shadow-sm lg:hidden">
            {({ open }) => (
              <>
                <div className="mx-auto px-4 sm:px-6">
                  <div className="flex justify-between h-16">
                    <div className="flex items-center">
                      <h1 className="text-xl font-semibold text-gray-900">Shop Inventory</h1>
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
          {/* Floating Action Button */}
          <div className="fixed bottom-6 right-6">
          <button
            onClick={() => setMenuOpen(!menuOpen)}

            className="bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 transition-all duration-300"
          >
            {menuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Plus className="w-6 h-6" />
            )}
          </button>       
          {menuOpen && (
          <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl w-56 overflow-hidden">
              {[
                { path: '/firm-details', name: 'Shop Details', icon: <ShoppingCart className="w-5 h-5" /> },
                { path: '/add-product', name: 'Add Product', icon: <ShoppingBag className="w-5 h-5" /> },
                { path: '/add-sale', name: 'Add Sale', icon: <DollarSign className="w-5 h-5" /> },
                {path: '/purchase-order', name: 'Update Stocks', icon: <Box className="w-5 h-5" /> },
                {name: 'Add New Customers', href: '/customers/new/edit', icon: <Users className="w-5 h-5" /> }
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path ?? ''}
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}