import { useQuery, useAction, getSales, getProducts, createSale } from 'wasp/client/operations';
import { useState } from 'react';

export default function Sales() {
  const { data: sales, isLoading, error, refetch } = useQuery(getSales);
  const { data: products } = useQuery(getProducts);
  const createSaleAction = useAction(createSale);

  const [showForm, setShowForm] = useState(false);
  const [saleItems, setSaleItems] = useState([{ productId: '', quantity: '' }]);
  const [paymentType, setPaymentType] = useState('CASH');
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addSaleItem = () => {
    setSaleItems([...saleItems, { productId: '', quantity: '' }]);
  };

  const removeSaleItem = (index) => {
    const newItems = saleItems.filter((_, i) => i !== index);
    setSaleItems(newItems.length > 0 ? newItems : [{ productId: '', quantity: '' }]);
  };

  const updateSaleItem = (index, field, value) => {
    const newItems = [...saleItems];
    newItems[index][field] = value;
    setSaleItems(newItems);
  };

  const calculateTotal = () => {
    let total = 0;
    saleItems.forEach((item) => {
      if (item.productId && item.quantity) {
        const product = products?.find(p => p.id === parseInt(item.productId));
        if (product) {
          total += product.unitPrice * parseInt(item.quantity);
        }
      }
    });
    return total;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    const validItems = saleItems.filter(item => item.productId && item.quantity > 0);
    
    if (validItems.length === 0) {
      setFormError('Please add at least one item to the sale');
      setIsSubmitting(false);
      return;
    }

    try {
      await createSaleAction({
        items: validItems.map(item => ({
          productId: parseInt(item.productId),
          quantity: parseInt(item.quantity)
        })),
        paymentType
      });
      
      setShowForm(false);
      setSaleItems([{ productId: '', quantity: '' }]);
      setPaymentType('CASH');
      await refetch();
    } catch (err) {
      setFormError(err.message || 'Failed to create sale');
    } finally {
      setIsSubmitting(false);
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
        <h1 className="text-3xl font-bold text-gray-900">Sales</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : '+ New Sale'}
        </button>
      </div>

      {/* Create Sale Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Create New Sale</h2>
          
          {formError && (
            <div className="alert-error mb-4">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sale Items */}
            <div>
              <h3 className="text-lg font-medium mb-3">Items</h3>
              <div className="space-y-3">
                {saleItems.map((item, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="flex-1">
                      <select
                        className="form-input"
                        value={item.productId}
                        onChange={(e) => updateSaleItem(index, 'productId', e.target.value)}
                        required
                      >
                        <option value="">Select product</option>
                        {products?.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} - {formatCurrency(product.unitPrice)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-32">
                      <input
                        type="number"
                        min="1"
                        className="form-input"
                        placeholder="Quantity"
                        value={item.quantity}
                        onChange={(e) => updateSaleItem(index, 'quantity', e.target.value)}
                        required
                      />
                    </div>
                    {item.productId && item.quantity && (
                      <div className="w-32 flex items-center justify-end">
                        <span className="font-semibold">
                          {formatCurrency(
                            products?.find(p => p.id === parseInt(item.productId))?.unitPrice * parseInt(item.quantity) || 0
                          )}
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeSaleItem(index)}
                      className="text-red-600 hover:text-red-800 px-2"
                      disabled={saleItems.length === 1}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              
              <button
                type="button"
                onClick={addSaleItem}
                className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + Add another item
              </button>
            </div>

            {/* Payment Type */}
            <div>
              <label className="form-label">Payment Type *</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentType"
                    value="CASH"
                    checked={paymentType === 'CASH'}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="mr-2"
                  />
                  Cash
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentType"
                    value="CARD"
                    checked={paymentType === 'CARD'}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="mr-2"
                  />
                  Card
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentType"
                    value="MOBILE"
                    checked={paymentType === 'MOBILE'}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="mr-2"
                  />
                  Mobile Payment
                </label>
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total Amount:</span>
                <span className="text-blue-600">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : 'Complete Sale'}
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

      {/* Sales History */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Sales History</h2>
        
        {isLoading ? (
          <p className="text-gray-500 text-center py-8">Loading sales...</p>
        ) : error ? (
          <p className="text-red-500 text-center py-8">Error loading sales</p>
        ) : sales && sales.length > 0 ? (
          <div className="space-y-4">
            {sales.map((sale) => (
              <div key={sale.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-sm text-gray-500">
                      Sale #{sale.id} • {new Date(sale.saleDate).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Cashier: {sale.user.name || sale.user.username} • Branch: {sale.branch.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(sale.totalAmount)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {sale.paymentType}
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">Items:</div>
                  <div className="space-y-1">
                    {sale.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.product.name} × {item.quantity}</span>
                        <span className="font-medium">{formatCurrency(item.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No sales recorded yet</p>
        )}
      </div>
    </div>
  );
}
