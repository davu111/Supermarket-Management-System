import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  CreditCard,
  Package,
  User,
  RefreshCw,
  Calendar,
  Filter,
} from "lucide-react";
import axios from "../../contexts/axios";
import Header from "../../components/all/Header";

const CustomerHistory = () => {
  const [expandedDates, setExpandedDates] = useState({});
  const [expandedCustomers, setExpandedCustomers] = useState({});
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const [transactionData, setTransactionData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize with default date range and fetch data
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    setDateRange({
      endDate: formatDateForInput(today),
      startDate: formatDateForInput(thirtyDaysAgo),
    });

    // Fetch initial data (last 90 days)
    fetchAllTransactions();
  }, []);

  const formatDateForInput = (date) => {
    return date.toISOString().split("T")[0];
  };

  // Fetch all transactions (last 90 days)
  const fetchAllTransactions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get("/transactions/history/all");

      setTransactionData(response.data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching transactions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch transactions by date range
  const fetchTransactionsByDateRange = async (startDate, endDate) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `/transactions/history?startDate=${startDate}&endDate=${endDate}`
      );

      setTransactionData(response.data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching transactions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle apply filter button
  const handleApplyFilter = () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      alert("Please select both start and end dates");
      return;
    }

    if (new Date(dateRange.startDate) > new Date(dateRange.endDate)) {
      alert("Start date must be before end date");
      return;
    }

    fetchTransactionsByDateRange(dateRange.startDate, dateRange.endDate);
  };

  // Handle refresh button - reload all data
  const handleRefresh = () => {
    fetchAllTransactions();
  };

  // Handle reset - reset to default date range and fetch
  const handleReset = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const newDateRange = {
      endDate: formatDateForInput(today),
      startDate: formatDateForInput(thirtyDaysAgo),
    };

    setDateRange(newDateRange);
    fetchTransactionsByDateRange(newDateRange.startDate, newDateRange.endDate);
  };

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
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
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
    <>
      <Header currentPage="History" menu="marketing" />
      <div className="min-h-screen bg-linear-to-br from-red-50 to-orange-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    Transaction History
                  </h1>
                  <p className="text-gray-500 text-sm">
                    View all customer transactions organized by date
                  </p>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 bg-linear-to-r from-red-600 to-rose-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>

            {/* Date Range Filter */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  disabled={isLoading}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  disabled={isLoading}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleApplyFilter}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-red-600 to-rose-600 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Filter className="w-4 h-4" />
                      Apply Filter
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
                <span className="font-medium">Error:</span>
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoading && transactionData.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <RefreshCw className="w-16 h-16 text-red-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Loading Transactions...
              </h3>
              <p className="text-gray-500">
                Please wait while we fetch your data.
              </p>
            </div>
          )}

          {/* Transaction History */}
          {!isLoading && transactionData.length > 0 && (
            <div className="space-y-4">
              {transactionData.map((dateGroup) => {
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
                      className="w-full px-6 py-4 bg-linear-to-r from-red-600 to-red-500 hover:from-red-600 hover:to-red-700 text-white flex items-center justify-between transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        {isDateExpanded ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
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
                          const isCustomerExpanded =
                            expandedCustomers[customerKey];
                          const customerTotal = getCustomerTotal(
                            customer.transactions
                          );

                          return (
                            <div key={customerKey} className="bg-gray-50">
                              {/* Customer Header */}
                              <button
                                onClick={() => toggleCustomer(customerKey)}
                                className="w-full px-8 py-3 hover:bg-gray-100 flex items-center justify-between transition-colors cursor-pointer"
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
                                    Customer ID: {customer.customerId}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
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
                                            #ID: {transaction.id}
                                          </div>
                                          <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <CreditCard className="w-4 h-4" />
                                            <span>
                                              {transaction.paymentMethod.toUpperCase()}
                                            </span>
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
                                                {formatCurrency(
                                                  item.priceAtTime
                                                )}
                                              </div>
                                              <div className="text-xs text-gray-500">
                                                ={" "}
                                                {formatCurrency(
                                                  item.quantity *
                                                    item.priceAtTime
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
          )}

          {/* Empty State */}
          {!isLoading && transactionData.length === 0 && !error && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Transactions Found
              </h3>
              <p className="text-gray-500">
                There are no transaction records for the selected date range.
              </p>
              <button
                onClick={handleReset}
                className="mt-4 bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-2 rounded-lg font-medium transition-all"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CustomerHistory;
