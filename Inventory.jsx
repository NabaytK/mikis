import { useQuery, useAction, getInventory, getProducts, updateInventory } from 'wasp/client/operations';
import { useState } from 'react';

export default function Inventory() {
  const { data: inventory, isLoading, error, refetch } = useQuery(getInventory);
  const { data: products } = useQuery(getProducts);
  const updateInventoryAction = useAction(updateInventory);

  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    productId: '',
    branchId: 1, // Default branch
    quantityOnHand: '',
    thresholdMin: 10,
    expiryDate: '',
    batchNumber: '',
    status: 'AVAILABLE'
  });
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      await updateInventoryAction(formData);
      setShowForm(false);
      setFormData({
        productId: '',
        branchId: 1,
        quantityOnHand: '',
        thresholdMin: 10,
        expiryDate: '',
        batchNumber: '',
        status: 'AVAILABLE'
      });
      await refetch();
    } catch (err) {
      setFormError(err.message || 'Failed to update inventory');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredInventory = inventory?.filter((item) => {
    const matchesSearch = item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'LOW_STOCK':
        return 'bg-yellow-100 text-yellow-800';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      case 'DISCONTINUED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : '+ Add/Update Stock'}
        </button>
      </div>

      {/* Add/Update Inventory Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Add/Update Inventory</h2>
          
          {formError && (
            <div className="alert-error mb-4">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="productId" className="form-label">
                  Product *
                </label>
                <select
                  id="productId"
                  name="productId"
                  required
                  className="form-input"
                  value={formData.productId}
                  onChange={handleInputChange}
                >
                  <option value="">Select a product</option>
                  {products?.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="quantityOnHand" className="form-label">
                  Quantity *
                </label>
                <input
                  id="quantityOnHand"
                  name="quantityOnHand"
                  type="number"
                  required
                  min="0"
                  className="form-input"
                  value={formData.quantityOnHand}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="thresholdMin" className="form-label">
                  Minimum Threshold *
                </label>
                <input
                  id="thresholdMin"
                  name="thresholdMin"
                  type="number"
                  required
                  min="0"
                  className="form-input"
                  value={formData.thresholdMin}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="expiryDate" className="form-label">
                  Expiry Date
                </label>
                <input
                  id="expiryDate"
                  name="expiryDate"
                  type="date"
                  className="form-input"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="batchNumber" className="form-label">
                  Batch Number
                </label>
                <input
                  id="batchNumber"
                  name="batchNumber"
                  type="text"
                  className="form-input"
                  value={formData.batchNumber}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="status" className="form-label">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  required
                  className="form-input"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="LOW_STOCK">Low Stock</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="DISCONTINUED">Discontinued</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : 'Update Inventory'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Controls */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <select
              className="form-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="EXPIRED">Expired</option>
              <option value="DISCONTINUED">Discontinued</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card">
        {isLoading ? (
          <p className="text-gray-500 text-center py-8">Loading inventory...</p>
        ) : error ? (
          <p className="text-red-500 text-center py-8">Error loading inventory</p>
        ) : filteredInventory && filteredInventory.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Branch</th>
                  <th>Quantity</th>
                  <th>Threshold</th>
                  <th>Batch</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => {
                  const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);
                  const isLowStock = item.quantityOnHand <= item.thresholdMin;
                  const isNearExpiry = daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0;
                  
                  return (
                    <tr key={item.id} className={isLowStock || isNearExpiry ? 'bg-yellow-50' : ''}>
                      <td className="font-medium">{item.product.name}</td>
                      <td className="font-mono text-xs">{item.product.sku}</td>
                      <td>{item.branch.name}</td>
                      <td>
                        <span className={`font-semibold ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                          {item.quantityOnHand}
                        </span>
                      </td>
                      <td>{item.thresholdMin}</td>
                      <td className="font-mono text-xs">{item.batchNumber || '-'}</td>
                      <td>
                        {item.expiryDate ? (
                          <div>
                            <div>{new Date(item.expiryDate).toLocaleDateString()}</div>
                            {daysUntilExpiry !== null && (
                              <div className={`text-xs ${
                                daysUntilExpiry < 0 ? 'text-red-600' : 
                                daysUntilExpiry <= 7 ? 'text-orange-600' : 'text-gray-500'
                              }`}>
                                {daysUntilExpiry < 0 
                                  ? `Expired ${Math.abs(daysUntilExpiry)} days ago` 
                                  : `${daysUntilExpiry} days left`
                                }
                              </div>
                            )}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="text-sm text-gray-500">
                        {new Date(item.lastUpdated).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No inventory records found</p>
        )}
      </div>
    </div>
  );
}
