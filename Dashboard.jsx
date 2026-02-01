import { useQuery, useAction, getAlerts, getSalesReport, generateLowStockAlerts } from 'wasp/client/operations';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const { data: salesReport, isLoading: salesLoading, error: salesError } = useQuery(
    getSalesReport,
    { startDate: dateRange.startDate, endDate: dateRange.endDate }
  );

  const { data: alerts, isLoading: alertsLoading, refetch: refetchAlerts } = useQuery(
    getAlerts,
    { isRead: false }
  );

  const generateAlerts = useAction(generateLowStockAlerts);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAlerts = async () => {
    setIsGenerating(true);
    try {
      await generateAlerts();
      await refetchAlerts();
    } catch (error) {
      console.error('Error generating alerts:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={handleGenerateAlerts}
          disabled={isGenerating}
          className="btn-primary disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Generate Alerts'}
        </button>
      </div>

      {/* Alerts Section */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <span className="mr-2">🔔</span>
          Active Alerts
        </h2>
        
        {alertsLoading ? (
          <p className="text-gray-500">Loading alerts...</p>
        ) : alerts && alerts.length > 0 ? (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-md ${
                  alert.type === 'LOW_STOCK'
                    ? 'bg-yellow-50 border-l-4 border-yellow-500'
                    : alert.type === 'NEAR_EXPIRY'
                    ? 'bg-orange-50 border-l-4 border-orange-500'
                    : 'bg-red-50 border-l-4 border-red-500'
                }`}
              >
                <div className="flex items-start">
                  <span className="text-2xl mr-3">
                    {alert.type === 'LOW_STOCK' ? '⚠️' : alert.type === 'NEAR_EXPIRY' ? '⏰' : '🚫'}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(alert.createdAt).toLocaleDateString()} at{' '}
                      {new Date(alert.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No active alerts</p>
        )}
      </div>

      {/* Sales Report Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Sales Report</h2>
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="form-input text-sm"
            />
            <span className="self-center text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="form-input text-sm"
            />
          </div>
        </div>

        {salesLoading ? (
          <p className="text-gray-500">Loading sales data...</p>
        ) : salesError ? (
          <p className="text-red-500">Error loading sales data</p>
        ) : salesReport ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Total Sales Amount</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">
                  {formatCurrency(salesReport.totalSalesAmount)}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Number of Sales</p>
                <p className="text-3xl font-bold text-green-900 mt-1">
                  {salesReport.totalSalesCount}
                </p>
              </div>
            </div>

            {/* Product Breakdown */}
            {salesReport.productBreakdown && salesReport.productBreakdown.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold mb-3">Top Selling Products</h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>Quantity Sold</th>
                        <th>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesReport.productBreakdown
                        .sort((a, b) => b.quantitySold - a.quantitySold)
                        .slice(0, 10)
                        .map((product) => (
                          <tr key={product.id}>
                            <td className="font-medium">{product.name}</td>
                            <td>{product.category}</td>
                            <td>{product.quantitySold} units</td>
                            <td>{formatCurrency(product.revenue)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No sales data for this period</p>
            )}
          </div>
        ) : (
          <p className="text-gray-500">No sales data available</p>
        )}
      </div>
    </div>
  );
}
