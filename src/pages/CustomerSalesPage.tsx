import React, { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Printer, Eye, EyeOff } from "lucide-react";

interface Sale {
  saleId: string;
  customerName: string;
  dueAmount: number;
  paidAmount: number;
  saleDate: Timestamp;
}

interface Customer {
  customerNo: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  customerAddress: string;
  customerCountry: string;
  customerState: string;
  sales: Sale[];
  totalDueAmount: number;
  totalPaidAmount: number;
  isOpen?: boolean;
}

const CustomerSalesPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const customerQuery = collection(db, "customers");
        const customerSnapshot = await getDocs(customerQuery);
        const customersData = customerSnapshot.docs.map((doc) => doc.data());

        const salesQuery = collection(db, "sales");
        const salesSnapshot = await getDocs(salesQuery);
        const salesData = salesSnapshot.docs.map((doc) => doc.data());

        const customerData: Customer[] = customersData.map((customer: any) => {
          const customerSales = salesData.filter(
            (sale: any) => sale.customerNo === customer.customerNo
          );

          const totalDueAmount = customerSales.reduce(
            (acc: number, sale: any) => acc + sale.dueAmount,
            0
          );
          const totalPaidAmount = customerSales.reduce(
            (acc: number, sale: any) => acc + sale.paidAmount,
            0
          );

          return {
            customerNo: customer.customerNo || "Unknown",
            customerName: customer.name || "Unknown",
            customerEmail: customer.email || "Unknown",
            customerMobile: customer.mobile || "Unknown",
            customerAddress: customer.address || "Unknown",
            customerCountry: customer.country || "Unknown",
            customerState: customer.state || "Unknown",
            sales: customerSales.map((sale: any) => ({
              saleId: sale.saleId || `fallback-${Math.random()}`,
              customerName: sale.customerName,
              dueAmount: sale.dueAmount || 0,
              paidAmount: sale.paidAmount || 0,
              saleDate: sale.saleDate,
            })),
            totalDueAmount,
            totalPaidAmount,
          };
        });

        setCustomers(customerData);
      } catch (error) {
        setError("Error fetching customer and sales data.");
        console.error("Error fetching customer and sales data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, []);

  const formatDate = (timestamp: Timestamp): string => {
    const date = timestamp.toDate();
    return date.toLocaleDateString();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };


  const handlePrintBill = (customerNo: string, saleId?: string) => {
    // Navigate to the print bill page with customerNo and optionally saleId
    const url = saleId ? `/print-bill?customerNo=${customerNo}&saleId=${saleId}` : `/print-bill?customerNo=${customerNo}`;
    navigate(url); // Navigate to the print bill page
  };
  

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 text-red-800 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Customer Sales Overview</h1>
          <p className="mt-2 text-sm text-gray-600">Manage and view all customer sales information</p>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-600 to-indigo-700">
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Address</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-white uppercase tracking-wider">Due Amount</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-white uppercase tracking-wider">Paid Amount</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customers.map((customer) => (
                  <React.Fragment key={customer.customerNo}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{customer.customerName}</div>
                        <div className="text-sm text-gray-500">#{customer.customerNo}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{customer.customerEmail}</div>
                        <div className="text-sm text-gray-500">{customer.customerMobile}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">{customer.customerAddress}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm font-medium text-red-600">
                          {formatCurrency(customer.totalDueAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm font-medium text-green-600">
                          {formatCurrency(customer.totalPaidAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center space-x-3">
                          <button
                            onClick={() => {
                              const updatedCustomers = customers.map((c) => ({
                                ...c,
                                isOpen: c.customerNo === customer.customerNo ? !c.isOpen : c.isOpen
                              }));
                              setCustomers(updatedCustomers);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          >
                            {customer.isOpen ? 
                              <EyeOff className="h-5 w-5" /> :
                              <Eye className="h-5 w-5" />
                            }
                          </button>
                          <button
                            onClick={() => handlePrintBill(customer.customerNo)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          >
                            <Printer className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {customer.isOpen && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 bg-gray-50">
                          <div className="rounded-lg overflow-hidden border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sale ID</th>
                                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Due Amount</th>
                                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Paid Amount</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sale Date</th>
                                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {customer.sales.map((sale) => (
                                  <tr key={sale.saleId} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-sm text-gray-900">{sale.saleId}</td>
                                    <td className="px-4 py-3 text-sm text-right text-red-600">{formatCurrency(sale.dueAmount)}</td>
                                    <td className="px-4 py-3 text-sm text-right text-green-600">{formatCurrency(sale.paidAmount)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(sale.saleDate)}</td>
                                    <td className="px-4 py-3 text-center">
                                      <button
                                        onClick={() => handlePrintBill(customer.customerNo, sale.saleId)}
                                        className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                      >
                                        <Printer className="h-4 w-4 inline" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSalesPage;