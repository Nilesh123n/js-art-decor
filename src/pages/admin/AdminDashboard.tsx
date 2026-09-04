import React from 'react';
import { Package, ShoppingBag, DollarSign, AlertTriangle, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { Product, Order } from '../../types/ecommerce';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  onNavigateTab
}) => {
  const activeProducts = products.filter(p => p.is_active).length;
  const lowStockProducts = products.filter(p => p.stock_quantity <= 10);
  const paidOrders = orders.filter(o => o.paymentStatus === 'Paid');
  const codOrders = orders.filter(o => o.paymentMethod === 'COD');
  const newOrders = orders.filter(o => o.orderStatus === 'New');

  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'Paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-neutral-900">Admin Metrics Overview</h1>
        <p className="text-xs text-neutral-500">Real-time statistics for JSArt&Decor inventory and sales.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-400">
            <span>Paid Revenue</span>
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-neutral-500">From {paidOrders.length} paid transactions</div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-400">
            <span>Total Orders</span>
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900">
            {orders.length}
          </div>
          <div className="text-[11px] text-neutral-500">
            {newOrders.length} new • {codOrders.length} COD
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-400">
            <span>Active Catalog</span>
            <div className="p-2 bg-neutral-100 text-neutral-800 rounded-lg">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900">
            {activeProducts} / {products.length}
          </div>
          <div className="text-[11px] text-neutral-500">Published live products</div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-400">
            <span>Low Stock Alert</span>
            <div className="p-2 bg-red-100 text-red-800 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-red-600">
            {lowStockProducts.length}
          </div>
          <div className="text-[11px] text-neutral-500">Items with ≤10 units remaining</div>
        </div>
      </div>

      {/* Low Stock Warning Table */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-red-900">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Low Stock Inventory Warning</span>
            </span>
            <button
              onClick={() => onNavigateTab('products')}
              className="underline text-red-800 hover:text-red-950 font-semibold"
            >
              Update Stock in Product Manager
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {lowStockProducts.map(p => (
              <div key={p.id} className="bg-white p-3 rounded-lg border border-red-200 flex justify-between items-center">
                <div>
                  <div className="font-bold text-neutral-900 truncate max-w-[180px]">{p.name}</div>
                  <div className="text-[10px] text-neutral-500 font-mono">SKU: {p.sku}</div>
                </div>
                <span className="bg-red-100 text-red-800 font-bold px-2 py-1 rounded font-mono">
                  {p.stock_quantity} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders Preview Table */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <h2 className="text-base font-serif font-bold text-neutral-900">Recent Customer Orders</h2>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-semibold text-amber-700 hover:underline"
          >
            Manage All Orders ({orders.length})
          </button>
        </div>

        {orders.length === 0 ? (
          <p className="text-xs text-neutral-500 text-center py-6">No customer orders recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase tracking-wider border-b border-neutral-200">
                <tr>
                  <th className="p-3">Receipt #</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {orders.slice(0, 5).map(o => (
                  <tr key={o.id} className="hover:bg-neutral-50/80">
                    <td className="p-3 font-mono font-bold text-neutral-900">{o.orderNumber}</td>
                    <td className="p-3">
                      <div className="font-bold text-neutral-800">{o.customer.fullName}</div>
                      <div className="text-[10px] text-neutral-500">{o.customer.city}, {o.customer.state}</div>
                    </td>
                    <td className="p-3 font-mono font-bold">₹{o.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        o.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {o.paymentStatus} ({o.paymentMethod})
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-800">
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="p-3 text-neutral-500 text-[11px]">{o.createdAt.substring(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
