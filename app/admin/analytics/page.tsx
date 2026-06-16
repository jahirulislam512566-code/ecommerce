"use client";

import { useState, useEffect, useCallback } from "react";
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Eye, RefreshCw } from "lucide-react";

interface AnalyticsData {
  revenue: { total: number; change: number };
  orders: { total: number; change: number };
  customers: { total: number; change: number };
  conversion: { rate: number; change: number };
  topProducts: Array<{ id: string; name: string; sold: number; revenue: number }>;
  salesByDay: Array<{ date: string; sales: number }>;
  categoryBreakdown: Array<{ name: string; value: number }>;
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("month");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const analytics = await response.json();
      setData(analytics);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch analytics");
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  const metrics = [
    {
      title: "Total Revenue",
      value: `$${(data?.revenue?.total ?? 0).toLocaleString()}`,
      change: data?.revenue?.change ?? 0,
      icon: DollarSign,
      color: "bg-green-500",
    },
    {
      title: "Total Orders",
      value: (data?.orders?.total ?? 0).toLocaleString(),
      change: data?.orders?.change ?? 0,
      icon: ShoppingBag,
      color: "bg-blue-500",
    },
    {
      title: "New Customers",
      value: (data?.customers?.total ?? 0).toLocaleString(),
      change: data?.customers?.change ?? 0,
      icon: Users,
      color: "bg-purple-500",
    },
    {
      title: "Conversion Rate",
      value: `${data?.conversion?.rate ?? 0}%`,
      change: data?.conversion?.change ?? 0,
      icon: Eye,
      color: "bg-orange-500",
    },
  ];

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={() => fetchAnalytics()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your store performance</p>
          {lastUpdated && (
            <p className="text-xs text-gray-400 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="quarter">Last 90 days</option>
            <option value="year">Last 12 months</option>
          </select>
          <button
            onClick={() => fetchAnalytics()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const isPositive = metric.change >= 0;
          return (
            <div
              key={metric.title}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`${metric.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {metric.change !== 0 && (
                  <div
                    className={`flex items-center gap-1 text-sm ${
                      isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {Math.abs(metric.change)}%
                  </div>
                )}
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {metric.title}
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {metric.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Sales Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Sales Overview
          </h3>
          <span className="text-sm text-gray-500">
            {data?.salesByDay?.length || 0} days of data
          </span>
        </div>
        <div className="h-80 flex items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          {data?.salesByDay && data.salesByDay.length > 0 ? (
            <div className="text-center">
              <p className="mb-2">📊 Sales Chart Placeholder</p>
              <p className="text-sm">Last 7 days sales: ${data.salesByDay.slice(-7).reduce((sum, d) => sum + d.sales, 0).toLocaleString()}</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="mb-2">📊 No sales data available</p>
              <p className="text-sm">Complete some orders to see analytics</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Products & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top Selling Products
            </h3>
            <span className="text-sm text-gray-500">
              {data?.topProducts?.length || 0} products
            </span>
          </div>
          <div className="space-y-4">
            {data?.topProducts && data.topProducts.length > 0 ? (
              data.topProducts.slice(0, 5).map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center font-semibold text-gray-700 dark:text-gray-300">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500">{product.sold} sold</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    ${product.revenue.toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No product sales data available</p>
                <p className="text-sm mt-1">Complete orders to see top products</p>
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Category Breakdown
          </h3>
          <div className="space-y-4">
            {data?.categoryBreakdown && data.categoryBreakdown.length > 0 ? (
              data.categoryBreakdown.map((category) => (
                <div key={category.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{category.name}</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {category.value}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(category.value, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No category data available</p>
                <p className="text-sm mt-1">Categorize products to see breakdown</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Sales Activity */}
      {data?.salesByDay && data.salesByDay.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Sales Activity
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Date
                  </th>
                  <th className="text-right py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Sales
                  </th>
                 </tr>
              </thead>
              <tbody>
                {data.salesByDay.slice(-7).reverse().map((day) => (
                  <tr key={day.date} className="border-b dark:border-gray-700">
                    <td className="py-3 text-gray-900 dark:text-white">
                      {new Date(day.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right font-semibold text-gray-900 dark:text-white">
                      ${day.sales.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}