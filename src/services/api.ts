import { Product, Order, Blog, Partner, ContactMessage, SiteSettings, OrderTrackingData } from '../types/ecommerce';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

export interface CreateOrderPayload {
  customer: {
    fullName: string;
    mobileNumber: string;
    email?: string;
    address: string;
    city: string;
    state: string;
    pinCode: string;
    orderNotes?: string;
  };
  items: Array<{
    product_id: number;
    quantity: number;
    item_type: 'Retail' | 'Wholesale';
  }>;
  payment_method: 'Razorpay';
  order_type: 'Retail' | 'Wholesale';
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  [key: string]: any;
}

// Helper for CSRF Header
const getCsrfHeader = (): Record<string, string> => {
  const token = sessionStorage.getItem('csrf_token') || '';
  return token ? { 'X-CSRF-Token': token } : {};
};

/**
 * Safely parses and validates API responses to prevent JSON syntax errors
 * when server returns HTML error pages or non-JSON payloads.
 */
async function handleResponse<T = any>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    const text = await res.text();
    console.error(`Non-JSON API response from ${res.url} (${res.status}):`, text.substring(0, 200));
    throw new Error(`Server returned invalid content type (${res.status}). Expected JSON.`);
  }

  let json: any;
  try {
    json = await res.json();
  } catch (err: any) {
    throw new Error(`Invalid JSON received from server (${res.status}): ${err.message}`);
  }

  if (!res.ok || json.success === false) {
    throw new Error(json.error || json.message || `API Error (${res.status})`);
  }

  return json as T;
}

export const ApiService = {
  // -------------------------------------------------------------
  // PUBLIC ENDPOINTS
  // -------------------------------------------------------------

  async getProducts(filters?: {
    production_type?: string;
    segment?: string;
    product_type?: string;
    sales_availability?: string;
    is_featured?: boolean;
    is_new_arrival?: boolean;
    search?: string;
  }): Promise<Product[]> {
    const params = new URLSearchParams();
    if (filters?.production_type) params.append('production_type', filters.production_type);
    if (filters?.segment) params.append('segment', filters.segment);
    if (filters?.product_type) params.append('product_type', filters.product_type);
    if (filters?.sales_availability) params.append('sales_availability', filters.sales_availability);
    if (filters?.is_featured) params.append('is_featured', '1');
    if (filters?.is_new_arrival) params.append('is_new_arrival', '1');
    if (filters?.search) params.append('q', filters.search);

    const url = `${API_BASE_URL}/products/get.php?${params.toString()}`;
    const res = await fetch(url);
    const json = await handleResponse<ApiResponse<Product[]>>(res);
    return json.data || [];
  },

  async getProductBySlug(slug: string): Promise<Product> {
    const url = `${API_BASE_URL}/products/detail.php?slug=${encodeURIComponent(slug)}`;
    const res = await fetch(url);
    const json = await handleResponse<ApiResponse<Product>>(res);
    return json.data!;
  },

  async getProductById(id: number): Promise<Product> {
    const url = `${API_BASE_URL}/products/detail.php?id=${id}`;
    const res = await fetch(url);
    const json = await handleResponse<ApiResponse<Product>>(res);
    return json.data!;
  },

  async getBlogs(): Promise<Blog[]> {
    const url = `${API_BASE_URL}/blogs/get.php`;
    const res = await fetch(url);
    const json = await handleResponse<ApiResponse<Blog[]>>(res);
    return json.data || [];
  },

  async getBlogBySlug(slug: string): Promise<Blog> {
    const url = `${API_BASE_URL}/blogs/get.php?slug=${encodeURIComponent(slug)}`;
    const res = await fetch(url);
    const json = await handleResponse<ApiResponse<Blog>>(res);
    return json.data!;
  },

  async getPartners(): Promise<Partner[]> {
    const url = `${API_BASE_URL}/partners/get.php`;
    const res = await fetch(url);
    const json = await handleResponse<ApiResponse<Partner[]>>(res);
    return json.data || [];
  },

  async getPublicSettings(): Promise<Partial<SiteSettings>> {
    const url = `${API_BASE_URL}/settings/public.php`;
    const res = await fetch(url);
    const json = await handleResponse<ApiResponse<Partial<SiteSettings>>>(res);
    return json.data || {};
  },

  async submitContact(payload: {
    name: string;
    email: string;
    mobile?: string;
    enquiry_type?: string;
    subject?: string;
    message: string;
  }): Promise<{ success: boolean; message: string }> {
    const url = `${API_BASE_URL}/contact/submit.php`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await handleResponse<any>(res);
    return { success: true, message: json.message || 'Enquiry submitted successfully' };
  },

  async createOrder(payload: CreateOrderPayload): Promise<{
    success: boolean;
    payment_method: 'Razorpay' | 'COD';
    order_id: number;
    order_number: string;
    total_amount: number;
    razorpay_order_id?: string;
    amount?: number;
    key_id?: string;
    message?: string;
    error?: string;
  }> {
    const url = `${API_BASE_URL}/orders/create.php`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await handleResponse<any>(res);
  },

  async verifyPayment(payload: VerifyPaymentPayload): Promise<{
    success: boolean;
    message: string;
    order_id?: number;
    order_number?: string;
    error?: string;
  }> {
    const url = `${API_BASE_URL}/orders/verify_payment.php`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await handleResponse<any>(res);
  },

  async trackOrder(orderNumber: string, contact?: string): Promise<{
    success: boolean;
    data?: OrderTrackingData;
    error?: string;
    message?: string;
  }> {
    let url = `${API_BASE_URL}/orders/track.php?order_number=${encodeURIComponent(orderNumber.trim())}`;
    if (contact && contact.trim()) {
      url += `&contact=${encodeURIComponent(contact.trim())}`;
    }
    const res = await fetch(url);
    return await handleResponse<any>(res);
  },

  // -------------------------------------------------------------
  // ADMIN ENDPOINTS
  // -------------------------------------------------------------

  async adminLogin(username: string, password: string): Promise<{ success: boolean; username: string; csrf_token: string }> {
    const url = `${API_BASE_URL}/admin/auth.php`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', username, password })
    });
    const json = await handleResponse<any>(res);
    if (json.csrf_token) {
      sessionStorage.setItem('csrf_token', json.csrf_token);
    }
    return json;
  },

  async adminLogout(): Promise<void> {
    const url = `${API_BASE_URL}/admin/auth.php`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' })
      });
      await handleResponse<any>(res);
    } catch {
      // Ignore logout cleanup network errors
    } finally {
      sessionStorage.removeItem('csrf_token');
    }
  },

  async adminCheckSession(): Promise<{ authenticated: boolean; username?: string; csrf_token?: string }> {
    const url = `${API_BASE_URL}/admin/auth.php`;
    try {
      const res = await fetch(url);
      const json = await handleResponse<any>(res);
      if (json.csrf_token) {
        sessionStorage.setItem('csrf_token', json.csrf_token);
      }
      return json;
    } catch {
      return { authenticated: false };
    }
  },

  async getAdminDashboard(): Promise<{
    metrics: {
      total_revenue: number;
      total_orders: number;
      total_products: number;
      unread_enquiries: number;
    };
    low_stock_alerts: Product[];
    recent_orders: Order[];
  }> {
    const url = `${API_BASE_URL}/admin/dashboard.php`;
    const res = await fetch(url, {
      headers: getCsrfHeader()
    });
    return await handleResponse<any>(res);
  },

  // Admin Products CRUD
  async getAdminProducts(): Promise<Product[]> {
    const url = `${API_BASE_URL}/admin/products.php`;
    const res = await fetch(url, { headers: getCsrfHeader() });
    const json = await handleResponse<ApiResponse<Product[]>>(res);
    return json.data || [];
  },

  async createAdminProduct(productData: Partial<Product>): Promise<{ id: number }> {
    const url = `${API_BASE_URL}/admin/products.php`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getCsrfHeader()
      },
      body: JSON.stringify(productData)
    });
    const json = await handleResponse<any>(res);
    return { id: json.id };
  },

  async updateAdminProduct(productData: Partial<Product> & { id: number }): Promise<void> {
    const url = `${API_BASE_URL}/admin/products.php`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getCsrfHeader()
      },
      body: JSON.stringify(productData)
    });
    await handleResponse<any>(res);
  },

  async deleteAdminProduct(id: number): Promise<void> {
    const url = `${API_BASE_URL}/admin/products.php`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getCsrfHeader()
      },
      body: JSON.stringify({ id })
    });
    await handleResponse<any>(res);
  },

  async uploadProductImage(file: File): Promise<string> {
    const url = `${API_BASE_URL}/admin/products.php`;
    const formData = new FormData();
    formData.append('image', file);

    const headers: Record<string, string> = getCsrfHeader();

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: formData
    });
    const json = await handleResponse<any>(res);
    return json.image_url;
  },

  // Admin Orders
  async getAdminOrders(): Promise<Order[]> {
    const url = `${API_BASE_URL}/admin/orders.php`;
    const res = await fetch(url, { headers: getCsrfHeader() });
    const json = await handleResponse<ApiResponse<Order[]>>(res);
    return json.data || [];
  },

  async updateAdminOrderStatus(id: number, orderStatus: string, paymentStatus?: string): Promise<void> {
    const url = `${API_BASE_URL}/admin/orders.php`;
    const bodyPayload: any = { id, order_status: orderStatus };
    if (paymentStatus) bodyPayload.payment_status = paymentStatus;

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getCsrfHeader()
      },
      body: JSON.stringify(bodyPayload)
    });
    await handleResponse<any>(res);
  },

  // Admin Blogs
  async getAdminBlogs(): Promise<Blog[]> {
    const url = `${API_BASE_URL}/admin/blogs.php`;
    const res = await fetch(url, { headers: getCsrfHeader() });
    const json = await handleResponse<ApiResponse<Blog[]>>(res);
    return json.data || [];
  },

  async saveAdminBlogs(blogs: Blog[]): Promise<void> {
    const url = `${API_BASE_URL}/admin/blogs.php`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getCsrfHeader()
      },
      body: JSON.stringify({ blogs })
    });
    await handleResponse<any>(res);
  },

  // Admin Partners
  async getAdminPartners(): Promise<Partner[]> {
    const url = `${API_BASE_URL}/admin/partners.php`;
    const res = await fetch(url, { headers: getCsrfHeader() });
    const json = await handleResponse<ApiResponse<Partner[]>>(res);
    return json.data || [];
  },

  async saveAdminPartners(partners: Partner[]): Promise<void> {
    const url = `${API_BASE_URL}/admin/partners.php`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getCsrfHeader()
      },
      body: JSON.stringify({ partners })
    });
    await handleResponse<any>(res);
  },

  // Admin Enquiries
  async getEnquiries(): Promise<ContactMessage[]> {
    const url = `${API_BASE_URL}/admin/enquiries.php`;
    const res = await fetch(url, { headers: getCsrfHeader() });
    const json = await handleResponse<ApiResponse<ContactMessage[]>>(res);
    return json.data || [];
  },

  async markEnquiryRead(id: number, isRead: boolean): Promise<void> {
    const url = `${API_BASE_URL}/admin/enquiries.php`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getCsrfHeader()
      },
      body: JSON.stringify({ id, is_read: isRead ? 1 : 0 })
    });
    await handleResponse<any>(res);
  },

  // Admin Settings
  async getAdminSettings(): Promise<Record<string, string>> {
    const url = `${API_BASE_URL}/admin/settings.php`;
    const res = await fetch(url, { headers: getCsrfHeader() });
    const json = await handleResponse<ApiResponse<Record<string, string>>>(res);
    return json.data || {};
  },

  async saveAdminSettings(settings: SiteSettings | Record<string, string>): Promise<void> {
    const url = `${API_BASE_URL}/admin/settings.php`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getCsrfHeader()
      },
      body: JSON.stringify(settings)
    });
    await handleResponse<any>(res);
  }
};
