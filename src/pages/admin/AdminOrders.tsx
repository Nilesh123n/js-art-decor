import React, { useState } from 'react';
import {
  Search,
  Eye,
  XCircle,
  Truck,
  Mail,
  CheckCircle2,
  Send,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus } from '../../types/ecommerce';
import { ApiService } from '../../services/api';
import { exportOrdersToExcel, exportOrdersToPDF } from '../../utils/exportUtils';

interface AdminOrdersProps {
  orders: Order[];
  onRefreshOrders: () => void;
}

interface ShipmentModalState {
  isOpen: boolean;
  order: Order | null;
  courierPartner: string;
  trackingAwb: string;
  trackingUrl: string;
  estimatedDelivery: string;
  customerEmail: string;
  forceSendEmail: boolean;
}

interface EmailPreviewModalState {
  isOpen: boolean;
  subject: string;
  recipient: string;
  courier: string;
  trackingAwb: string;
  html: string;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ orders, onRefreshOrders }) => {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Success toast/banner for email dispatch
  const [notificationBanner, setNotificationBanner] = useState<{
    orderNumber: string;
    recipient: string;
    courier: string;
    trackingAwb: string;
    previewHtml?: string;
  } | null>(null);

  // Shipment & Email Dispatch Modal
  const [shipmentModal, setShipmentModal] = useState<ShipmentModalState>({
    isOpen: false,
    order: null,
    courierPartner: 'Blue Dart Express',
    trackingAwb: '',
    trackingUrl: '',
    estimatedDelivery: '3 - 5 Business Days',
    customerEmail: '',
    forceSendEmail: true
  });

  // Email Preview Modal
  const [previewModal, setPreviewModal] = useState<EmailPreviewModalState>({
    isOpen: false,
    subject: '',
    recipient: '',
    courier: '',
    trackingAwb: '',
    html: ''
  });

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.fullName.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.mobileNumber.includes(search) ||
      (o.customer.email && o.customer.email.toLowerCase().includes(search.toLowerCase())) ||
      (o.trackingAwb && o.trackingAwb.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = selectedStatus === 'All' || o.orderStatus === selectedStatus;
    return matchSearch && matchStatus;
  });

  // Open modal when transitioning to 'Shipped'
  const promptShipmentDispatch = (order: Order) => {
    const digitsOnly = order.orderNumber.replace(/[^0-9]/g, '');
    const defaultAwb = order.trackingAwb || `BD-${digitsOnly.slice(-6) || Math.floor(100000 + Math.random() * 900000)}`;

    setShipmentModal({
      isOpen: true,
      order,
      courierPartner: order.courierPartner || 'Blue Dart Express',
      trackingAwb: defaultAwb,
      trackingUrl: order.trackingUrl || '',
      estimatedDelivery: order.estimatedDelivery || '3 - 5 Business Days',
      customerEmail: order.customer?.email || '',
      forceSendEmail: true
    });
  };

  const handleStatusDropdownChange = (order: Order, newStatus: OrderStatus) => {
    // If moving from Processing to Shipped (or marking as Shipped), open the dispatch & email modal
    if (newStatus === 'Shipped') {
      promptShipmentDispatch(order);
      return;
    }

    // Direct update for other statuses
    executeUpdateStatus(order.id, newStatus);
  };

  const executeUpdateStatus = async (orderId: number, newStatus: OrderStatus) => {
    try {
      setActionLoading(true);
      const res = await ApiService.updateAdminOrderStatus(orderId, newStatus);
      onRefreshOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, orderStatus: newStatus } : null));
      }
      return res;
    } catch (err: any) {
      alert(err.message || 'Failed to update order status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Confirm Shipment & Send Email Notification
  const handleConfirmShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipmentModal.order) return;

    try {
      setActionLoading(true);
      const res = await ApiService.updateAdminOrderStatus(shipmentModal.order.id, 'Shipped', {
        courierPartner: shipmentModal.courierPartner,
        trackingAwb: shipmentModal.trackingAwb,
        trackingUrl: shipmentModal.trackingUrl,
        estimatedDelivery: shipmentModal.estimatedDelivery,
        customerEmail: shipmentModal.customerEmail,
        forceSendEmail: shipmentModal.forceSendEmail
      });

      onRefreshOrders();

      // Update selected order in view if opened
      if (selectedOrder && selectedOrder.id === shipmentModal.order.id) {
        setSelectedOrder((prev) =>
          prev
            ? {
                ...prev,
                orderStatus: 'Shipped',
                courierPartner: shipmentModal.courierPartner,
                trackingAwb: shipmentModal.trackingAwb,
                estimatedDelivery: shipmentModal.estimatedDelivery,
                emailNotificationSent: true
              }
            : null
        );
      }

      // Show success notification banner
      if (res.email_triggered || shipmentModal.forceSendEmail) {
        setNotificationBanner({
          orderNumber: shipmentModal.order.orderNumber,
          recipient: shipmentModal.customerEmail || shipmentModal.order.customer?.email || 'customer',
          courier: shipmentModal.courierPartner,
          trackingAwb: shipmentModal.trackingAwb,
          previewHtml: res.email_details?.preview_html
        });
      }

      setShipmentModal((prev) => ({ ...prev, isOpen: false }));
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch shipment and trigger email notification.');
    } finally {
      setActionLoading(false);
    }
  };

  // Live preview email before sending
  const handlePreviewEmailBeforeSend = async () => {
    if (!shipmentModal.order) return;
    try {
      setActionLoading(true);
      const preview = await ApiService.previewOrderShippingEmail(shipmentModal.order.id, {
        courierPartner: shipmentModal.courierPartner,
        trackingAwb: shipmentModal.trackingAwb,
        estimatedDelivery: shipmentModal.estimatedDelivery
      });

      setPreviewModal({
        isOpen: true,
        subject: preview.subject,
        recipient: shipmentModal.customerEmail || preview.recipient,
        courier: preview.courier,
        trackingAwb: preview.tracking_awb,
        html: preview.preview_html
      });
    } catch (err: any) {
      alert(err.message || 'Failed to generate email preview.');
    } finally {
      setActionLoading(false);
    }
  };

  // Preview an already sent notification
  const handleViewSentNotification = (order: Order) => {
    const notif = order.emailNotifications?.[0];
    if (notif?.previewHtml) {
      setPreviewModal({
        isOpen: true,
        subject: notif.subject,
        recipient: notif.recipient,
        courier: notif.courierPartner || order.courierPartner || 'Express Courier',
        trackingAwb: notif.trackingAwb || order.trackingAwb || '',
        html: notif.previewHtml
      });
    } else {
      // Fetch dynamic preview
      ApiService.previewOrderShippingEmail(order.id, {
        courierPartner: order.courierPartner,
        trackingAwb: order.trackingAwb,
        estimatedDelivery: order.estimatedDelivery
      }).then((preview) => {
        setPreviewModal({
          isOpen: true,
          subject: preview.subject,
          recipient: order.customer?.email || preview.recipient,
          courier: preview.courier,
          trackingAwb: preview.tracking_awb,
          html: preview.preview_html
        });
      }).catch((err) => {
        alert(err.message || 'Unable to load email preview.');
      });
    }
  };

  const handleUpdatePaymentStatus = async (orderId: number, newPaymentStatus: PaymentStatus) => {
    try {
      setActionLoading(true);
      await ApiService.updateAdminOrderStatus(orderId, selectedOrder?.orderStatus || 'New', newPaymentStatus);
      onRefreshOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, paymentStatus: newPaymentStatus } : null));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update payment status.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-neutral-900">Customer Order Management</h1>
          <p className="text-xs text-neutral-500">
            Track fulfillment lifecycle, manage shipping logistics, and automatically trigger customer email notifications on dispatch.
          </p>
        </div>

        {/* Export Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="export-orders-excel-btn"
            onClick={() => exportOrdersToExcel(filteredOrders.length > 0 ? filteredOrders : orders)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100/80 font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
            title="Export filtered orders to Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>
          <button
            type="button"
            id="export-orders-pdf-btn"
            onClick={() => exportOrdersToPDF(filteredOrders.length > 0 ? filteredOrders : orders)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100/80 font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
            title="Export orders summary report to PDF (.pdf)"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Dispatched Email Success Alert Banner */}
      {notificationBanner && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg shrink-0 mt-0.5">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  Customer Email Notification Dispatched
                </h4>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Auto-Triggered
                </span>
              </div>
              <p className="text-xs text-emerald-900 mt-1">
                Order <strong className="font-mono">#{notificationBanner.orderNumber}</strong> was moved to{' '}
                <strong className="text-emerald-950">Shipped</strong> via {notificationBanner.courier} (AWB: <span className="font-mono font-bold">{notificationBanner.trackingAwb}</span>).
                An official shipment confirmation email was successfully sent to <strong className="font-medium">{notificationBanner.recipient}</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {notificationBanner.previewHtml && (
              <button
                type="button"
                onClick={() =>
                  setPreviewModal({
                    isOpen: true,
                    subject: `Your Order #${notificationBanner.orderNumber} Has Shipped! - JSArt&Decor`,
                    recipient: notificationBanner.recipient,
                    courier: notificationBanner.courier,
                    trackingAwb: notificationBanner.trackingAwb,
                    html: notificationBanner.previewHtml || ''
                  })
                }
                className="px-3 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-100/50 text-emerald-900 text-xs font-bold rounded-lg transition"
              >
                View Dispatched Email
              </button>
            )}
            <button
              type="button"
              onClick={() => setNotificationBanner(null)}
              className="p-1.5 text-emerald-700 hover:text-emerald-950 rounded-lg hover:bg-emerald-100/60"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by order #, customer, email, or AWB..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-neutral-300 rounded-lg pl-3 pr-8 py-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['All', 'New', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg border transition shrink-0 ${
                selectedStatus === st
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase tracking-wider border-b border-neutral-200">
              <tr>
                <th className="p-3.5">Order Receipt</th>
                <th className="p-3.5">Customer Details</th>
                <th className="p-3.5">Total Amount</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5">Status & Dispatch Trigger</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500">
                    No orders match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const isProcessing = o.orderStatus === 'Processing';
                  const isShipped = o.orderStatus === 'Shipped';

                  return (
                    <tr key={o.id} className="hover:bg-neutral-50/80 transition">
                      {/* Order Receipt */}
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-neutral-900">{o.orderNumber}</div>
                        <div className="text-[10px] text-neutral-500">{o.createdAt.substring(0, 16)}</div>
                        {o.orderType && (
                          <span className="inline-block mt-0.5 text-[9px] font-bold text-neutral-600 bg-neutral-100 px-1.5 py-0.2 rounded">
                            {o.orderType}
                          </span>
                        )}
                      </td>

                      {/* Customer Details */}
                      <td className="p-3.5">
                        <div className="font-bold text-neutral-900">{o.customer.fullName}</div>
                        <div className="text-[10px] text-neutral-500">
                          {o.customer.mobileNumber} • {o.customer.city}
                        </div>
                        {o.customer.email && (
                          <div className="text-[10px] text-neutral-600 font-mono flex items-center gap-1 mt-0.5">
                            <Mail className="w-2.5 h-2.5 text-neutral-400" />
                            {o.customer.email}
                          </div>
                        )}
                      </td>

                      {/* Total */}
                      <td className="p-3.5 font-mono font-bold text-neutral-900">
                        ₹{o.totalAmount.toLocaleString('en-IN')}
                      </td>

                      {/* Payment */}
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            o.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {o.paymentStatus} ({o.paymentMethod})
                        </span>
                      </td>

                      {/* Status & Actions */}
                      <td className="p-3.5">
                        <div className="flex flex-col gap-1.5 max-w-[210px]">
                          <select
                            value={o.orderStatus}
                            onChange={(e) => handleStatusDropdownChange(o, e.target.value as OrderStatus)}
                            className="bg-neutral-50 border border-neutral-300 rounded px-2 py-1 text-xs font-bold text-neutral-800 focus:outline-none focus:border-neutral-900"
                          >
                            <option value="New">New</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped (Trigger Email)</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>

                          {/* Quick 'Ship & Notify' Button when Order is Processing */}
                          {isProcessing && (
                            <button
                              type="button"
                              onClick={() => promptShipmentDispatch(o)}
                              className="flex items-center justify-center gap-1.5 w-full px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-[10px] shadow-xs transition"
                            >
                              <Truck className="w-3 h-3" />
                              <span>Ship & Notify Customer</span>
                            </button>
                          )}

                          {/* Email Sent Badge when Shipped */}
                          {isShipped && (
                            <div className="flex items-center justify-between text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                              <span className="flex items-center gap-1 font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Email Dispatched
                              </span>
                              <button
                                type="button"
                                onClick={() => handleViewSentNotification(o)}
                                className="underline hover:text-emerald-950 font-semibold"
                              >
                                View
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Details View */}
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="p-1.5 text-neutral-700 hover:text-black hover:bg-neutral-100 rounded transition"
                          title="View Full Order Summary"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SHIPMENT DISPATCH & CUSTOMER EMAIL NOTIFICATION MODAL */}
      {shipmentModal.isOpen && shipmentModal.order && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto border border-neutral-200 shadow-xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b pb-3 border-neutral-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded uppercase">
                    Step: Processing → Shipped
                  </span>
                </div>
                <h2 className="text-lg font-serif font-bold text-neutral-900 mt-1">
                  Dispatch Order & Send Customer Notification
                </h2>
                <p className="text-xs text-neutral-500">
                  Order <strong className="font-mono text-neutral-900">#{shipmentModal.order.orderNumber}</strong> for{' '}
                  <strong className="text-neutral-900">{shipmentModal.order.customer.fullName}</strong>
                </p>
              </div>
              <button
                onClick={() => setShipmentModal((prev) => ({ ...prev, isOpen: false }))}
                className="p-1 text-neutral-400 hover:text-neutral-900 rounded"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Email Trigger Banner */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0 mt-0.5">
                <Mail className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-amber-950">Automated Customer Email Trigger</div>
                <p className="text-amber-900 mt-0.5 leading-relaxed">
                  Moving this order from <strong>Processing</strong> to <strong>Shipped</strong> will automatically generate and dispatch an official JSArt&Decor shipment confirmation email with live courier tracking credentials to the recipient.
                </p>
              </div>
            </div>

            {/* Shipment Form */}
            <form onSubmit={handleConfirmShipment} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Customer Notification Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={shipmentModal.customerEmail}
                  onChange={(e) => setShipmentModal({ ...shipmentModal, customerEmail: e.target.value })}
                  placeholder="customer@example.com"
                  className="w-full bg-white border border-neutral-300 rounded-lg p-2.5 text-neutral-900 font-medium focus:outline-none focus:border-amber-600"
                />
                <p className="text-[10px] text-neutral-500 mt-1">
                  The shipment notice and receipt will be dispatched to this email address.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Courier Partner <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={shipmentModal.courierPartner}
                    onChange={(e) => setShipmentModal({ ...shipmentModal, courierPartner: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-lg p-2.5 text-neutral-900 font-medium focus:outline-none focus:border-amber-600"
                  >
                    <option value="Blue Dart Express">Blue Dart Express</option>
                    <option value="Delhivery Surface">Delhivery Surface</option>
                    <option value="DTDC Courier">DTDC Express</option>
                    <option value="Ekart Logistics">Ekart Logistics</option>
                    <option value="Trackon Express">Trackon Express</option>
                    <option value="India Post Speed Post">India Post Speed Post</option>
                    <option value="Professional Couriers">Professional Couriers</option>
                    <option value="Custom Artisan Courier">Custom Artisan Courier</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Tracking / AWB Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={shipmentModal.trackingAwb}
                    onChange={(e) => setShipmentModal({ ...shipmentModal, trackingAwb: e.target.value })}
                    placeholder="e.g. BD-8492019"
                    className="w-full bg-white border border-neutral-300 rounded-lg p-2.5 text-neutral-900 font-mono font-bold focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Estimated Delivery
                  </label>
                  <input
                    type="text"
                    value={shipmentModal.estimatedDelivery}
                    onChange={(e) => setShipmentModal({ ...shipmentModal, estimatedDelivery: e.target.value })}
                    placeholder="e.g. 3 - 5 Business Days"
                    className="w-full bg-white border border-neutral-300 rounded-lg p-2.5 text-neutral-900 font-medium focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Direct Tracking Web URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={shipmentModal.trackingUrl}
                    onChange={(e) => setShipmentModal({ ...shipmentModal, trackingUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-white border border-neutral-300 rounded-lg p-2.5 text-neutral-900 font-medium focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              {/* Checkbox Trigger */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="forceEmailCheckbox"
                  checked={shipmentModal.forceSendEmail}
                  onChange={(e) => setShipmentModal({ ...shipmentModal, forceSendEmail: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-600 border-neutral-300 focus:ring-amber-500"
                />
                <label htmlFor="forceEmailCheckbox" className="text-xs text-neutral-700 font-semibold cursor-pointer">
                  Trigger and dispatch shipment email notification immediately
                </label>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handlePreviewEmailBeforeSend}
                  className="w-full sm:w-auto px-3.5 py-2 border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Eye className="w-3.5 h-3.5 text-neutral-500" />
                  Preview Customer Email
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setShipmentModal((prev) => ({ ...prev, isOpen: false }))}
                    className="px-4 py-2 text-neutral-600 hover:text-neutral-900 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-xs transition"
                  >
                    {actionLoading ? (
                      <span>Dispatching...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Confirm Shipment & Send Email</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EMAIL PREVIEW MODAL */}
      {previewModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[92vh] overflow-y-auto border border-neutral-200 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-100 text-amber-800 rounded-md">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Email Notification Preview</h3>
                  <div className="text-[10px] text-neutral-500">Live rendered HTML template for customer inbox</div>
                </div>
              </div>
              <button
                onClick={() => setPreviewModal((prev) => ({ ...prev, isOpen: false }))}
                className="p-1 text-neutral-400 hover:text-black rounded"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Email Header Meta */}
            <div className="bg-neutral-50 border rounded-xl p-3 text-xs space-y-1 text-neutral-700 font-mono">
              <div>
                <span className="text-neutral-400 font-sans font-bold uppercase text-[10px] mr-2">Subject:</span>
                <span className="font-bold text-neutral-900">{previewModal.subject}</span>
              </div>
              <div>
                <span className="text-neutral-400 font-sans font-bold uppercase text-[10px] mr-2">To:</span>
                <span>{previewModal.recipient}</span>
              </div>
              <div>
                <span className="text-neutral-400 font-sans font-bold uppercase text-[10px] mr-2">Courier / AWB:</span>
                <span>{previewModal.courier} • {previewModal.trackingAwb}</span>
              </div>
            </div>

            {/* Rendered HTML Container */}
            <div className="border rounded-xl p-2 bg-neutral-100 max-h-[55vh] overflow-y-auto">
              <div
                className="w-full bg-white rounded shadow-xs"
                dangerouslySetInnerHTML={{ __html: previewModal.html }}
              />
            </div>

            <div className="pt-2 border-t flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-lg text-xs transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-neutral-200 shadow-xl">
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
                  onChange={(e) => handleStatusDropdownChange(selectedOrder, e.target.value as OrderStatus)}
                  className="w-full bg-white border border-neutral-300 rounded p-1.5 font-bold text-neutral-900 focus:outline-none focus:border-neutral-900"
                >
                  <option value="New">New</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped (Trigger Email)</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Payment Status</label>
                <select
                  value={selectedOrder.paymentStatus}
                  onChange={(e) => handleUpdatePaymentStatus(selectedOrder.id, e.target.value as PaymentStatus)}
                  className="w-full bg-white border border-neutral-300 rounded p-1.5 font-bold text-neutral-900 focus:outline-none focus:border-neutral-900"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>

            {/* If order is Processing, show the prominent Ship & Notify Customer action inside details view */}
            {selectedOrder.orderStatus === 'Processing' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between">
                <div className="text-xs">
                  <div className="font-bold text-amber-950">Ready for dispatch?</div>
                  <div className="text-[11px] text-amber-800">
                    Mark order as Shipped to automatically trigger customer email notification.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => promptShipmentDispatch(selectedOrder)}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition"
                >
                  <Truck className="w-3.5 h-3.5" />
                  Ship Order
                </button>
              </div>
            )}

            {/* Shipment & Email Notification Info Box */}
            {(selectedOrder.orderStatus === 'Shipped' || selectedOrder.trackingAwb) && (
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-neutral-500 text-[10px] flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-neutral-700" />
                    Shipment & Courier Logistics
                  </span>
                  <button
                    type="button"
                    onClick={() => handleViewSentNotification(selectedOrder)}
                    className="text-amber-800 hover:underline font-bold text-[11px] flex items-center gap-1"
                  >
                    <Mail className="w-3 h-3" /> View Notification Email
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-neutral-400 text-[10px] block">Courier Partner:</span>
                    <span className="font-bold text-neutral-900">{selectedOrder.courierPartner || 'Blue Dart'}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 text-[10px] block">Tracking / AWB:</span>
                    <span className="font-mono font-bold text-amber-800">{selectedOrder.trackingAwb || 'N/A'}</span>
                  </div>
                </div>

                {selectedOrder.shippedAt && (
                  <div className="text-[10px] text-neutral-500 pt-1 border-t border-neutral-200">
                    Dispatched on: {selectedOrder.shippedAt}
                  </div>
                )}
              </div>
            )}

            {/* Customer Details */}
            <div className="space-y-1 text-xs">
              <h3 className="font-bold uppercase tracking-wider text-neutral-400 text-[10px]">Customer & Address</h3>
              <div className="p-3 bg-neutral-50 rounded-lg space-y-1">
                <div className="font-bold text-neutral-900">
                  {selectedOrder.customer.fullName} ({selectedOrder.customer.mobileNumber})
                </div>
                {selectedOrder.customer.email && (
                  <div className="text-neutral-700 font-mono text-[11px]">
                    Email: {selectedOrder.customer.email}
                  </div>
                )}
                <div className="text-neutral-600">{selectedOrder.customer.address}</div>
                <div className="text-neutral-600">
                  {selectedOrder.customer.city}, {selectedOrder.customer.state} - {selectedOrder.customer.pinCode}
                </div>
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
