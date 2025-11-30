import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  CreditCard,
} from "lucide-react";
import axios from "../../contexts/axios";
import Header from "../../components/all/Header";

const Report = () => {
  const [timeFilter, setTimeFilter] = useState("month");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const [reportData, setReportData] = useState({
    summary: {
      totalRevenue: 0,
      totalTransactions: 0,
      totalProducts: 0,
      averageOrderValue: 0,
    },
    revenueChart: [],
    topProducts: [],
    paymentMethods: [],
  });

  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
  ];

  useEffect(() => {
    fetchReportData();
  }, [timeFilter, selectedMonth, selectedYear]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        filterType: timeFilter,
        month: selectedMonth.toString(),
        year: selectedYear.toString(),
      });

      const response = await axios.get(`/transactions/dashboard?${params}`);
      const data = response.data;
      // Sắp xếp revenueChart theo thứ tự thời gian
      if (data.revenueChart) {
        data.revenueChart.sort((a, b) => {
          if (timeFilter === "month") {
            // Sắp xếp theo ngày: "Day 1", "Day 2", ...
            const dayA = parseInt(a.period.replace("Day ", ""));
            const dayB = parseInt(b.period.replace("Day ", ""));
            return dayA - dayB;
          } else {
            // Sắp xếp theo tháng: "Jan", "Feb", ...
            const months = [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ];
            return months.indexOf(a.period) - months.indexOf(b.period);
          }
        });
      }

      setReportData(data);
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const StatCard = ({ icon: Icon, title, value, color, subtext }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <div
          className={`p-3 rounded-full ${color
            .replace("text", "bg")
            .replace("600", "100")}`}
        >
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  return (
    <>
      <Header currentPage="Report" menu="marketing" />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Sales Report Dashboard
              </h1>
              <p className="text-gray-600">
                Comprehensive overview of your supermarket performance
              </p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Time Filter:
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setTimeFilter("month")}
                  className={`px-4 py-2 rounded-lg cursor-pointer font-medium transition-all ${
                    timeFilter === "month"
                      ? "bg-red-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setTimeFilter("year")}
                  className={`px-4 py-2 rounded-lg cursor-pointer font-medium transition-all ${
                    timeFilter === "year"
                      ? "bg-red-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Yearly
                </button>
              </div>

              {timeFilter === "month" && (
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <button
                onClick={fetchReportData}
                className="ml-auto px-6 py-2 bg-red-600 text-white rounded-lg cursor-pointer hover:bg-red-700 transition-colors font-medium shadow-md"
              >
                Refresh Data
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard
                  icon={DollarSign}
                  title="Total Revenue"
                  value={formatCurrency(reportData.summary.totalRevenue)}
                  color="text-green-600"
                />
                <StatCard
                  icon={ShoppingCart}
                  title="Total Transactions"
                  value={reportData.summary.totalTransactions.toLocaleString()}
                  color="text-blue-600"
                />
                <StatCard
                  icon={TrendingUp}
                  title="Products Sold"
                  value={reportData.summary.totalProducts.toLocaleString()}
                  color="text-purple-600"
                />
                <StatCard
                  icon={CreditCard}
                  title="Avg Order Value"
                  value={formatCurrency(reportData.summary.averageOrderValue)}
                  color="text-orange-600"
                />
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Revenue Trend
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.revenueChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #ccc",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="revenue"
                        fill="#3b82f6"
                        name="Revenue"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Payment Methods Chart */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Payment Methods Distribution
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reportData.paymentMethods}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name.toUpperCase()}: ${(percent * 100).toFixed(
                            0
                          )}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {reportData.paymentMethods.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Top 10 Best Selling Products
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                            Rank
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                            Product Name
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                            Quantity Sold
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                            Revenue
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.topProducts.map((product, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
                                  index === 0
                                    ? "bg-yellow-500"
                                    : index === 1
                                    ? "bg-gray-400"
                                    : index === 2
                                    ? "bg-orange-600"
                                    : "bg-blue-500"
                                }`}
                              >
                                {index + 1}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-medium text-gray-800">
                              {product.productName}
                            </td>
                            <td className="py-3 px-4 text-right text-gray-700">
                              {product.totalQuantity.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right font-semibold text-green-600">
                              {formatCurrency(product.totalRevenue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Report;
