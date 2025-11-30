import { useState, useEffect } from "react";
import axios from "../../contexts/axios";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Filter,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Box,
  RefreshCw,
} from "lucide-react";

import Header from "../../components/all/Header";

function TransactionHistory() {
  const [transactions, setTransactions] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedDates, setExpandedDates] = useState({});
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const res = await axios.get("/inventory/transactions/getAllGrouped", {
        params,
      });
      setTransactions(res.data);

      // Auto expand first date
      const firstDate = Object.keys(res.data)[0];
      if (firstDate) {
        setExpandedDates({ [firstDate]: true });
      }
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    fetchTransactions();
  };

  const toggleDate = (date) => {
    setExpandedDates((prev) => ({ ...prev, [date]: !prev[date] }));
  };

  const calculateStats = (date) => {
    let totalExport = 0;
    let totalImport = 0;
    let transactionCount = 0;

    const dateTransactions = transactions[date] || [];
    dateTransactions.forEach((t) => {
      if (t.type === "EXPORT") totalExport += t.quantity;
      if (t.type === "IMPORT") totalImport += t.quantity;
      transactionCount++;
    });

    return { totalExport, totalImport, transactionCount };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Header currentPage="History" menu="warehouse" />
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-red-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    Transaction History
                  </h1>
                  <p className="text-gray-500 text-sm">
                    Import and export inventory records
                  </p>
                </div>
              </div>
              <button
                onClick={fetchTransactions}
                className="flex items-center gap-2 bg-linear-to-r from-red-600 to-rose-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                <RefreshCw className="w-4 h-4" />
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
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
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
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleApplyFilter}
                  className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-red-600 to-rose-600 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <Filter className="w-4 h-4" />
                  Apply Filter
                </button>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCw className="w-12 h-12 text-red-600 animate-spin mb-4" />
              <p className="text-gray-500 font-medium">
                Loading transactions...
              </p>
            </div>
          ) : Object.keys(transactions).length > 0 ? (
            <div className="space-y-4">
              {Object.keys(transactions)
                .sort((a, b) => new Date(b) - new Date(a))
                .map((date) => {
                  const dateStats = calculateStats(date);
                  const isDateExpanded = expandedDates[date];
                  const dateTransactions = transactions[date] || [];

                  return (
                    <div
                      key={date}
                      className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
                    >
                      {/* Date Header */}
                      <button
                        onClick={() => toggleDate(date)}
                        className="w-full bg-linear-to-r from-red-600 to-rose-600 p-6 flex items-center justify-between hover:from-red-500 hover:to-rose-500 transition-all duration-200"
                      >
                        <div className="flex items-center gap-4 text-white">
                          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                            <Calendar className="w-6 h-6" />
                          </div>
                          <div className="text-left">
                            <h2 className="text-xl font-bold">
                              {formatDate(date)}
                            </h2>
                            <p className="text-sm opacity-90">
                              {dateStats.transactionCount} transactions
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-white">
                          <div className="text-right bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                            <p className="text-xs opacity-90">Import</p>
                            <p className="text-lg font-bold flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              {dateStats.totalImport.toFixed(1)}
                            </p>
                          </div>
                          <div className="text-right bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                            <p className="text-xs opacity-90">Export</p>
                            <p className="text-lg font-bold flex items-center gap-1">
                              <TrendingDown className="w-4 h-4" />
                              {dateStats.totalExport.toFixed(1)}
                            </p>
                          </div>
                          {isDateExpanded ? (
                            <ChevronUp className="w-6 h-6" />
                          ) : (
                            <ChevronDown className="w-6 h-6" />
                          )}
                        </div>
                      </button>

                      {/* Transactions */}
                      {isDateExpanded && (
                        <div className="p-6 space-y-2">
                          {dateTransactions.map((transaction) => (
                            <TransactionCard
                              key={transaction.id}
                              transaction={transaction}
                              formatTime={formatTime}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-xl">
              <div className="bg-gray-100 rounded-full p-8 mb-6">
                <Package className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                No Transactions Found
              </h3>
              <p className="text-gray-500">
                Try adjusting your date range filter
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function TransactionCard({ transaction, formatTime }) {
  const isExport = transaction.type === "EXPORT";

  return (
    <div className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-red-300 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div
            className={`${
              isExport ? "bg-red-100" : "bg-green-100"
            } p-2 rounded-lg shadow-sm group-hover:scale-110 transition-transform`}
          >
            {isExport ? (
              <TrendingDown className={`w-5 h-5 text-red-600`} />
            ) : (
              <TrendingUp className={`w-5 h-5 text-green-600`} />
            )}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                  isExport
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {isExport ? (
                  <TrendingDown className="w-3 h-3" />
                ) : (
                  <TrendingUp className="w-3 h-3" />
                )}
                {transaction.type}
              </span>
              <span className="text-2xl font-bold bg-gray-600 bg-clip-text text-transparent">
                {transaction.quantity.toFixed(1)} units
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Box className="w-4 h-4 text-gray-400" />
                <span className="font-medium">Product:</span>
                <span className="truncate" title={transaction.productId}>
                  {transaction.productId.slice(0, 8)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="font-medium">Time:</span>
                <span>{formatTime(transaction.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionHistory;
