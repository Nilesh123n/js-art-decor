import React, { useState, useEffect } from 'react';
import { Mail, Phone, MessageSquare, CheckCircle2, Circle, Trash2, Search, ExternalLink, Loader2, Clock, AlertCircle } from 'lucide-react';
import { ContactMessage } from '../../types/ecommerce';
import { ApiService } from '../../services/api';

export const AdminMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'wholesale'>('all');
  const [search, setSearch] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getEnquiries();
      setMessages(data);
    } catch (err: any) {
      console.error('Failed to load enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRead = async (msg: ContactMessage) => {
    const newStatus = !msg.is_read;
    try {
      await ApiService.markEnquiryRead(msg.id, newStatus);
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, is_read: newStatus } : m))
      );
      if (selectedMessage?.id === msg.id) {
        setSelectedMessage({ ...selectedMessage, is_read: newStatus });
      }
    } catch (err: any) {
      console.error('Failed to update enquiry status:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
    try {
      await ApiService.deleteEnquiry(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
    } catch (err: any) {
      console.error('Failed to delete enquiry:', err);
    }
  };

  const filtered = messages.filter((m) => {
    if (filterStatus === 'unread' && m.is_read) return false;
    if (filterStatus === 'wholesale' && m.enquiry_type !== 'Wholesale') return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.mobile && m.mobile.includes(q)) ||
        m.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-neutral-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-amber-700" />
            <span>Enquiries & Wholesale Leads</span>
          </h1>
          <p className="text-xs text-neutral-500">
            Incoming wholesale quotation requests, hospitality inquiries, and customer messages stored in Hostinger MySQL.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl font-bold">
            {messages.filter((m) => !m.is_read).length} Unread Leads
          </span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-neutral-200">
        <div className="flex items-center gap-1">
          {[
            { id: 'all', label: 'All Inquiries' },
            { id: 'unread', label: 'Unread Only' },
            { id: 'wholesale', label: 'Wholesale & B2B' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterStatus === tab.id
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-neutral-900"
          />
        </div>
      </div>

      {/* Leads List & Detail */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-amber-700 animate-spin mx-auto" />
          <p className="text-xs text-neutral-500">Loading enquiries from MySQL...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center space-y-3">
          <Mail className="w-8 h-8 text-neutral-400 mx-auto" />
          <p className="text-sm font-bold text-neutral-800">No customer messages found</p>
          <p className="text-xs text-neutral-500">
            Messages submitted via the contact form and wholesale quotation request forms will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List column */}
          <div className="lg:col-span-2 space-y-3">
            {filtered.map((msg) => (
              <div
                key={msg.id}
                onClick={() => setSelectedMessage(msg)}
                className={`p-4 rounded-2xl border transition cursor-pointer ${
                  selectedMessage?.id === msg.id
                    ? 'border-amber-700 bg-amber-50/30 ring-1 ring-amber-700 shadow-sm'
                    : msg.is_read
                    ? 'border-neutral-200 bg-white hover:border-neutral-300'
                    : 'border-amber-300 bg-amber-50/50 hover:bg-amber-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleRead(msg);
                      }}
                      className="mt-0.5 text-neutral-400 hover:text-amber-700"
                      title={msg.is_read ? 'Mark as unread' : 'Mark as read'}
                    >
                      {msg.is_read ? (
                        <CheckCircle2 className="w-4 h-4 text-neutral-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-amber-700 fill-amber-700" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-neutral-900">{msg.name}</h4>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            msg.enquiry_type === 'Wholesale'
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          {msg.enquiry_type || 'General'}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                        {msg.email} {msg.mobile && `• ${msg.mobile}`}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {msg.created_at ? msg.created_at.slice(0, 10) : 'Recent'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-neutral-700 line-clamp-2 mt-2 leading-relaxed pl-7">
                  {msg.message}
                </p>
              </div>
            ))}
          </div>

          {/* Selected Message Detail Column */}
          <div className="lg:col-span-1">
            {selectedMessage ? (
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4 sticky top-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        selectedMessage.enquiry_type === 'Wholesale'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {selectedMessage.enquiry_type || 'General Lead'}
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      ID #{selectedMessage.id}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="text-neutral-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                    title="Delete inquiry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-base text-neutral-900">
                    {selectedMessage.name}
                  </h3>
                  <div className="space-y-1 mt-2 text-xs font-mono text-neutral-600">
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-neutral-400" />
                      <a href={`mailto:${selectedMessage.email}`} className="hover:underline text-amber-800">
                        {selectedMessage.email}
                      </a>
                    </p>
                    {selectedMessage.mobile && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-neutral-400" />
                        <a href={`tel:${selectedMessage.mobile}`} className="hover:underline text-neutral-800">
                          {selectedMessage.mobile}
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                {selectedMessage.subject && (
                  <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-200">
                    <p className="text-[11px] font-bold text-neutral-800">
                      Subject: {selectedMessage.subject}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Message Content
                  </label>
                  <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-xs text-neutral-800 leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>

                {/* Quick reply actions */}
                <div className="pt-3 border-t space-y-2">
                  {selectedMessage.mobile && (
                    <a
                      href={`https://wa.me/${selectedMessage.mobile.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Hello ${selectedMessage.name}, thank you for contacting JSArt&Decor Jaipur regarding your inquiry.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
                    >
                      <span>Reply on WhatsApp</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <a
                    href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(
                      `Regarding your inquiry at JSArt&Decor Jaipur`
                    )}`}
                    className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
                  >
                    <span>Send Email Response</span>
                    <Mail className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => handleToggleRead(selectedMessage)}
                    className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold transition"
                  >
                    {selectedMessage.is_read ? 'Mark as Unread' : 'Mark as Read'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-8 text-center text-neutral-400 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-neutral-300" />
                <p className="text-xs">Select an inquiry to view full lead details and reply.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
