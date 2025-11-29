import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  CreditCard,
  Package,
  User,
} from "lucide-react";

const CustomerHistory = () => {
  const [expandedDates, setExpandedDates] = useState({});
  const [expandedCustomers, setExpandedCustomers] = useState({});

  // Sample data structure matching your backend models
  const mockData = [
    {
      date: "2024-11-29",
      customers: [
        {
          customerId: 1001,
          customerName: "John Smith",
          transactions: [
            {
              id: 1,
              customerId: 1001,
              total: 150.5,
              paymentMethod: "Credit Card",
              createdAt: "2024-11-29",
              items: [
                {
                  id: 1,
                  transactionId: 1,
                  productId: "P001",
                  productName: "Fresh Milk",
                  quantity: 2,
                  priceAtTime: 3.5,
                },
                {
                  id: 2,
                  transactionId: 1,
                  productId: "P002",
                  productName: "Bread",
                  quantity: 3,
                  priceAtTime: 2.5,
                },
                {
                  id: 3,
                  transactionId: 1,
                  productId: "P003",
                  productName: "Coffee Beans",
                  quantity: 1,
                  priceAtTime: 15.0,
                },
              ],
            },
            {
              id: 2,
              customerId: 1001,
              total: 45.0,
              paymentMethod: "Cash",
              createdAt: "2024-11-29",
              items: [
                {
                  id: 4,
                  transactionId: 2,
                  productId: "P004",
                  productName: "Orange Juice",
                  quantity: 2,
                  priceAtTime: 5.5,
                },
                {
                  id: 5,
                  transactionId: 2,
                  productId: "P005",
                  productName: "Eggs",
                  quantity: 1,
                  priceAtTime: 4.0,
                },
              ],
            },
          ],
        },
        {
          customerId: 1002,
          customerName: "Emma Wilson",
          transactions: [
            {
              id: 3,
              customerId: 1002,
              total: 89.99,
              paymentMethod: "Debit Card",
              createdAt: "2024-11-29",
              items: [
                {
                  id: 6,
                  transactionId: 3,
                  productId: "P006",
                  productName: "Chicken Breast",
                  quantity: 2,
                  priceAtTime: 12.99,
                },
                {
                  id: 7,
                  transactionId: 3,
                  productId: "P007",
                  productName: "Rice 5kg",
                  quantity: 1,
                  priceAtTime: 18.0,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      date: "2024-11-28",
      customers: [
        {
          customerId: 1003,
          customerName: "Michael Chen",
          transactions: [
            {
              id: 4,
              customerId: 1003,
              total: 234.75,
              paymentMethod: "Credit Card",
              createdAt: "2024-11-28",
              items: [
                {
                  id: 8,
                  transactionId: 4,
                  productId: "P008",
                  productName: "Beef Steak",
                  quantity: 3,
                  priceAtTime: 25.5,
                },
                {
                  id: 9,
                  transactionId: 4,
                  productId: "P009",
                  productName: "Wine Bottle",
                  quantity: 2,
                  priceAtTime: 35.0,
                },
              ],
            },
          ],
        },
        {
          customerId: 1001,
          customerName: "John Smith",
          transactions: [
            {
              id: 5,
              customerId: 1001,
              total: 67.3,
              paymentMethod: "Cash",
              createdAt: "2024-11-28",
              items: [
                {
                  id: 10,
                  transactionId: 5,
                  productId: "P010",
                  productName: "Tomatoes",
                  quantity: 2,
                  priceAtTime: 4.5,
                },
                {
                  id: 11,
                  transactionId: 5,
                  productId: "P011",
                  productName: "Lettuce",
                  quantity: 3,
                  priceAtTime: 2.8,
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  const toggleDate = (date) => {
    setExpandedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  const toggleCustomer = (dateCustomerKey) => {
    setExpandedCustomers((prev) => ({
      ...prev,
      [dateCustomerKey]: !prev[dateCustomerKey],
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDailyTotal = (customers) => {
    return customers.reduce((total, customer) => {
      return (
        total +
        customer.transactions.reduce((sum, trans) => sum + trans.total, 0)
      );
    }, 0);
  };

  const getCustomerTotal = (transactions) => {
    return transactions.reduce((sum, trans) => sum + trans.total, 0);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 to-orange-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-linear-to-r from-red-600 to-red-700 rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Calendar className="w-8 h-8" />
            Transaction History
          </h1>
          <p className="text-red-100 mt-2">
            View all customer transactions organized by date
          </p>
        </div>

        {/* Transaction History */}
        <div className="space-y-4">
          {mockData.map((dateGroup) => {
            const isDateExpanded = expandedDates[dateGroup.date];
            const dailyTotal = getDailyTotal(dateGroup.customers);

            return (
              <div
                key={dateGroup.date}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                {/* Date Header */}
                <button
                  onClick={() => toggleDate(dateGroup.date)}
                  className="w-full px-6 py-4 bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3">
                    {isDateExpanded ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                    <Calendar className="w-5 h-5" />
                    <span className="font-semibold text-lg">
                      {formatDate(dateGroup.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                      {dateGroup.customers.length}{" "}
                      {dateGroup.customers.length === 1
                        ? "Customer"
                        : "Customers"}
                    </span>
                    <span className="font-bold text-xl">
                      {formatCurrency(dailyTotal)}
                    </span>
                  </div>
                </button>

                {/* Customers List */}
                {isDateExpanded && (
                  <div className="divide-y divide-gray-100">
                    {dateGroup.customers.map((customer) => {
                      const customerKey = `${dateGroup.date}-${customer.customerId}`;
                      const isCustomerExpanded = expandedCustomers[customerKey];
                      const customerTotal = getCustomerTotal(
                        customer.transactions
                      );

                      return (
                        <div key={customerKey} className="bg-gray-50">
                          {/* Customer Header */}
                          <button
                            onClick={() => toggleCustomer(customerKey)}
                            className="w-full px-8 py-3 hover:bg-gray-100 flex items-center justify-between transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {isCustomerExpanded ? (
                                <ChevronDown className="w-4 h-4 text-red-600" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-red-600" />
                              )}
                              <User className="w-4 h-4 text-red-600" />
                              <span className="font-medium text-gray-800">
                                {customer.customerName}
                              </span>
                              <span className="text-xs text-gray-500">
                                ID: {customer.customerId}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                {customer.transactions.length}{" "}
                                {customer.transactions.length === 1
                                  ? "Transaction"
                                  : "Transactions"}
                              </span>
                              <span className="font-semibold text-red-600">
                                {formatCurrency(customerTotal)}
                              </span>
                            </div>
                          </button>

                          {/* Transactions List */}
                          {isCustomerExpanded && (
                            <div className="px-8 pb-4 space-y-3">
                              {customer.transactions.map((transaction) => (
                                <div
                                  key={transaction.id}
                                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                                >
                                  {/* Transaction Header */}
                                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                      <div className="bg-linear-to-br from-red-500 to-red-600 text-white px-3 py-1 rounded-md text-sm font-medium">
                                        #{transaction.id}
                                      </div>
                                      <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <CreditCard className="w-4 h-4" />
                                        <span>{transaction.paymentMethod}</span>
                                      </div>
                                    </div>
                                    <div className="text-lg font-bold text-red-600">
                                      {formatCurrency(transaction.total)}
                                    </div>
                                  </div>

                                  {/* Transaction Items */}
                                  <div className="space-y-2">
                                    {transaction.items.map((item) => (
                                      <div
                                        key={item.id}
                                        className="flex items-center justify-between py-2 hover:bg-gray-50 rounded px-2 transition-colors"
                                      >
                                        <div className="flex items-center gap-3">
                                          <Package className="w-4 h-4 text-gray-400" />
                                          <div>
                                            <div className="font-medium text-gray-800">
                                              {item.productName}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              Product ID: {item.productId}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className="text-sm font-medium text-gray-800">
                                            {item.quantity} ×{" "}
                                            {formatCurrency(item.priceAtTime)}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            ={" "}
                                            {formatCurrency(
                                              item.quantity * item.priceAtTime
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {mockData.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Transactions Found
            </h3>
            <p className="text-gray-500">
              There are no transaction records to display.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerHistory;
