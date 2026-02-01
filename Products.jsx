import { useQuery, useAction, getProducts, createProduct } from 'wasp/client/operations';
import { useState } from 'react';

export default function Products() {
  const { data: products, isLoading, error, refetch } = useQuery(getProducts);
  const createProductAction = useAction(createProduct);

  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    barcode: '',
    sku: '',
    category: '',
    brand: '',
    unitPrice: '',
    costPrice: '',
    supplier: ''
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
      await createProductAction(formData);
      setShowForm(false);
      setFormData({
        name: '',
        description: '',
        barcode: '',
        sku: '',
        category: '',
        brand: '',
        unitPrice: '',
        costPrice: '',
        supplier: ''
      });
      await refetch();
    } catch (err) {
      setFormError(err.message || 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products?.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? product.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(products?.map(p => p.category) || [])];

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
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {/* Add Product Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
          
          {formError && (
            <div className="alert-error mb-4">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="form-label">
                  Product Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="form-input"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="sku" className="form-label">
                  SKU *
                </label>
                <input
                  id="sku"
                  name="sku"
                  type="text"
                  required
                  className="form-input"
                  value={formData.sku}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="barcode" className="form-label">
                  Barcode
                </label>
                <input
                  id="barcode"
                  name="barcode"
                  type="text"
                  className="form-input"
                  value={formData.barcode}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="category" className="form-label">
                  Category *
                </label>
                <input
                  id="category"
                  name="category"
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g., Vegetables, Fruits, Grains"
                  value={formData.category}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="brand" className="form-label">
                  Brand
                </label>
                <input
                  id="brand"
                  name="brand"
                  type="text"
                  className="form-input"
                  value={formData.brand}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="supplier" className="form-label">
                  Supplier
                </label>
                <input
                  id="supplier"
                  name="supplier"
                  type="text"
                  className="form-input"
                  value={formData.supplier}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="costPrice" className="form-label">
                  Cost Price (ETB) *
                </label>
                <input
                  id="costPrice"
                  name="costPrice"
                  type="number"
                  step="0.01"
                  required
                  className="form-input"
                  value={formData.costPrice}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="unitPrice" className="form-label">
                  Unit Price (ETB) *
                </label>
                <input
                  id="unitPrice"
                  name="unitPrice"
                  type="number"
                  step="0.01"
                  required
                  className="form-input"
                  value={formData.unitPrice}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="form-input"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Product'}
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

      {/* Filter and Search */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or SKU..."
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <select
              className="form-input"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card">
        {isLoading ? (
          <p className="text-gray-500 text-center py-8">Loading products...</p>
        ) : error ? (
          <p className="text-red-500 text-center py-8">Error loading products</p>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Cost Price</th>
                  <th>Unit Price</th>
                  <th>Profit Margin</th>
                  <th>Stock Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const totalStock = product.inventory?.reduce((sum, inv) => sum + inv.quantityOnHand, 0) || 0;
                  const profitMargin = ((product.unitPrice - product.costPrice) / product.costPrice * 100).toFixed(1);
                  
                  return (
                    <tr key={product.id}>
                      <td className="font-mono text-xs">{product.sku}</td>
                      <td className="font-medium">{product.name}</td>
                      <td>{product.category}</td>
                      <td>{product.brand || '-'}</td>
                      <td>{formatCurrency(product.costPrice)}</td>
                      <td>{formatCurrency(product.unitPrice)}</td>
                      <td>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          profitMargin > 20 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {profitMargin}%
                        </span>
                      </td>
                      <td>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          totalStock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {totalStock > 0 ? `${totalStock} units` : 'Out of stock'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No products found</p>
        )}
      </div>
    </div>
  );
}
