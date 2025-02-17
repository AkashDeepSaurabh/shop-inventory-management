import { Fragment } from 'react';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, ShoppingBag, DollarSign, Users, Store, Box } from 'lucide-react'; // Import icons
import React from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: <Home className="w-5 h-5 mr-3" /> },
  { name: 'Customer Sales', href: '/customer-sales', icon: <ShoppingBag className="w-5 h-5 mr-3" /> },
  { name: 'Sales', href: '/sales', icon: <DollarSign className="w-5 h-5 mr-3" /> },
  { name: 'Customer Management', href: '/customers', icon: <Users className="w-5 h-5 mr-3" /> },
  { name: 'Shop Details', href: '/firm-details', icon: <Store className="w-5 h-5 mr-3" /> },
  { name: 'Stocks', href: '/stocks', icon: <Box className="w-5 h-5 mr-3" /> },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Sidebar for Desktop and Mobile */}
      <div className="flex flex-1">
        {/* Sidebar (Desktop) */}
        <div className="hidden lg:flex flex-col w-64 bg-indigo-600 text-white">
          <div className="p-6 text-2xl font-bold">Shop Inventory</div>
          <nav className="mt-8 flex-1 space-y-4">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center py-2.5 px-6 text-lg font-medium rounded-md ${
                    isActive
                      ? 'bg-indigo-700 text-white'
                      : 'text-gray-300 hover:bg-indigo-700 hover:text-white'
                  }`
                }
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white">
          {/* Navigation (Mobile) */}
          <Disclosure as="nav" className="bg-white shadow-sm lg:hidden">
            {({ open }) => (
              <>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="flex h-16 justify-between">
                    <div className="flex">
                      <div className="flex flex-shrink-0 items-center">
                        <span className="text-xl font-bold">Shop Inventory</span>
                      </div>
                    </div>
                    {/* Mobile Menu Button */}
                    <div className="-mr-2 flex items-center sm:hidden">
                      <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500">
                        <span className="sr-only">Open main menu</span>
                        {open ? (
                          <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                        ) : (
                          <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                        )}
                      </Disclosure.Button>
                    </div>
                  </div>
                </div>

                {/* Mobile Menu */}
                <Disclosure.Panel className="sm:hidden">
                  <div className="space-y-1 pb-3 pt-2 bg-gray-50">
                    {navigation.map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) =>
                          `flex items-center py-2.5 pl-6 pr-4 text-base font-medium rounded-md ${
                            isActive
                              ? 'bg-indigo-700 text-white'
                              : 'text-gray-600 hover:bg-indigo-700 hover:text-white'
                          }`
                        }
                      >
                        {item.icon}
                        {item.name}
                      </NavLink>
                    ))}
                  </div>
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>

          {/* Main Content */}
          <div className="py-10">
            <main>
              <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Print Mode CSS */}
      <style>
        {`
          @media print {
            .no-print {
              display: none;
            }
          }
        `}
      </style>
    </div>
  );
}
