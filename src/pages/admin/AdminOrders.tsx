import React, { useState } from 'react';
import { Search, Eye, XCircle } from 'lucide-react';
import { Order, OrderStatus, PaymentStatus } from '../../types/ecommerce';
import { ApiService } from '../../services/api';

interface AdminOrdersProps {
  orders: Order[];
  onRefreshOrders: () => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ orders, onRefreshOrders }) => {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(o => {
    const matchSearch = 
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.fullName.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.mobileNumber.includes(search);

    const matchStatus = selectedStatus === 'All' || o.orderStatus === selectedStatus;
    return matchSearch && matchStatus;
  });

  const handleUpdateOrderStatus = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await ApiService.updateAdminOrderStatus(orderId, newStatus, selectedOrder?.paymentStatus || 'Pending');
      onRefreshOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update order status.');
    }
  };

  const handleUpdatePaymentStatus = async (orderId: number, newPaymentStatus: PaymentStatus) => {
    try {
      await ApiService.updateAdminOrderStatus(orderId, selectedOrder?.orderStatus || 'New', newPaymentStatus);
      onRefreshOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, paymentStatus: newPaymentStatus });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update payment status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-neutral-900">Customer Order Management</h1>
          <p className="text-xs text-neutral-500">Track shipments, update order fulfillment, and verify Razorpay/COD payments in MySQL.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by order #, customer or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-neutral-300 rounded-lg pl-3 pr-8 py-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['All', 'New', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg border transition shrink-0 ${
                selectedStatus === st ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase tracking-wider border-b border-neutral-200">
              <tr>
                <th className="p-3.5">Order Receipt</th>
                <th className="p-3.5">Customer Details</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5">Fulfillment Status</th>
                <th className="p-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500">
                    No orders match the search criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(o => (
                  <tr key={o.id} className="hover:bg-neutral-50/80">
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-neutral-900">{o.orderNumber}</div>
                      <div className="text-[10px] text-neutral-500">{o.createdAt.substring(0, 16)}</div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-neutral-900">{o.customer.fullName}</div>
                      <div className="text-[10px] text-neutral-500">{o.customer.mobileNumber} • {o.customer.city}</div>
                    </td>

                    <td className="p-3.5 font-mono font-bold text-neutral-900">
                      ₹{o.totalAmount.toLocaleString('en-IN')}
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        o.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {o.paymentStatus} ({o.paymentMethod})
                      </span>
                    </td>

                    <td className="p-3.5">
                      <select
                        value={o.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                        className="bg-neutral-50 border border-neutral-300 rounded px-2 py-1 text-xs font-bold text-neutral-800"
                      >
                        <option value="New">New</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="p-1.5 text-neutral-700 hover:text-black hover:bg-neutral-100 rounded"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-neutral-200">
              <div>
                <h2 className="text-base font-serif font-bold text-neutral-900">
                  Order Details — {selectedOrder.orderNumber}
                </h2>
                <div className="text-[11px] text-neutral-500">Placed on {selectedOrder.createdAt}</div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 text-neutral-400 hover:text-black">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Control */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-neutral-50 p-3 rounded-xl border">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Order Status</label>
                <select
                  value={selectedOrder.orderStatus}
                  onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value as OrderStatus)}
                  className="w-full bg-white border border-neutral-300 rounded p-1.5 font-bold text-neutral-900"
                >
                  <option value="New">New</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Payment Status</label>
                <select
                  value={selectedOrder.paymentStatus}
                  onChange={(e) => handleUpdatePaymentStatus(selectedOrder.id, e.target.value as PaymentStatus)}
                  className="w-full bg-white border border-neutral-300 rounded p-1.5 font-bold text-neutral-900"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-1 text-xs">
              <h3 className="font-bold uppercase tracking-wider text-neutral-400 text-[10px]">Customer & Address</h3>
              <div className="p-3 bg-neutral-50 rounded-lg space-y-1">
                <div className="font-bold text-neutral-900">{selectedOrder.customer.fullName} ({selectedOrder.customer.mobileNumber})</div>
                <div className="text-neutral-600">{selectedOrder.customer.address}</div>
                <div className="text-neutral-600">{selectedOrder.customer.city}, {selectedOrder.customer.state} - {selectedOrder.customer.pinCode}</div>
                {selectedOrder.customer.orderNotes && (
                  <div className="text-amber-800 font-medium pt-1">Note: {selectedOrder.customer.orderNotes}</div>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2 text-xs">
              <h3 className="font-bold uppercase tracking-wider text-neutral-400 text-[10px]">Purchased Items</h3>
              <div className="divide-y border rounded-lg">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="p-2.5 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-neutral-900">{it.productName}</div>
                      <div className="text-[10px] text-neutral-500 font-mono">
                        {it.quantity} units x ₹{it.unitPrice.toLocaleString('en-IN')} ({it.itemType})
                      </div>
                    </div>
                    <div className="font-mono font-bold">₹{it.subtotal.toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-neutral-900 text-white font-bold rounded-lg text-xs"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
