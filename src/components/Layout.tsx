import { Fragment } from 'react';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { NavLink, Outlet } from 'react-router-dom';
import React from 'react';

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Products', href: '/products' },
  { name: 'Sales', href: '/sales' },
  { name: 'New Sale', href: '/sales/new' },
  { name: 'Customer Management', href: '/customers' },
  // { name: 'Firm Details', href: '/firm-details' }, // Corrected href to match the route in App.js
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Disclosure as="nav" className="bg-white shadow-sm no-print">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex">
                  <div className="flex flex-shrink-0 items-center">
                    <span className="text-xl font-bold">Shop Inventory</span>
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    {navigation.map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) =>
                          `inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                            isActive
                              ? 'border-indigo-500 text-gray-900'
                              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                          }`
                        }
                      >
                        {item.name}
                      </NavLink>
                    ))}
                  </div>
                </div>
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

            <Disclosure.Panel className="sm:hidden">
              <div className="space-y-1 pb-3 pt-2">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `block border-l-4 py-2 pl-3 pr-4 text-base font-medium ${
                        isActive
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      <div className="py-10">
        <main>
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Add the CSS for hiding elements in print mode */}
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
