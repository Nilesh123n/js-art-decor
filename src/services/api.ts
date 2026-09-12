import { Product, Order, Blog, Partner, ContactMessage, SiteSettings, OrderTrackingData, Banner, PageSection, ImageKitUploadResult } from '../types/ecommerce';

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
    const url = `${API_BASE_URL}/blogs/get.php?_t=${Date.now()}`;
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    const json = await handleResponse<ApiResponse<Blog[]>>(res);
    return json.data || [];
  },

  async getBlogBySlug(slug: string): Promise<Blog> {
    const url = `${API_BASE_URL}/blogs/get.php?slug=${encodeURIComponent(slug)}&_t=${Date.now()}`;
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
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

  async submitPlannerInquiry(payload: {
    segment: string;
    scope: string[];
    space_scale: string;
    theme: string;
    budget_range: string;
    timeline: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    notes?: string;
  }): Promise<{ success: boolean; reference_id: string; message: string }> {
    const url = `${API_BASE_URL}/planner/submit.php`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await handleResponse<any>(res);
      return {
        success: true,
        reference_id: json.reference_id || ('PLAN-' + Math.random().toString(36).substring(2, 8).toUpperCase()),
        message: json.message || 'Your Art & Decor Planning request has been submitted successfully!'
      };
    } catch {
      // Fallback to contact submit if needed
      const fallbackRes = await this.submitContact({
        name: payload.name,
        email: payload.email,
        mobile: payload.phone,
        enquiry_type: `Art & Decor Planner - ${payload.segment}`,
        subject: `Decor Plan: ${payload.segment} (${payload.space_scale})`,
        message: [
          `Target Segment: ${payload.segment}`,
          `Scale: ${payload.space_scale}`,
          `Scope: ${payload.scope.join(', ')}`,
          `Theme: ${payload.theme}`,
          `Budget: ${payload.budget_range}`,
          `Timeline: ${payload.timeline}`,
          `City: ${payload.city}`,
          `Notes: ${payload.notes || 'None'}`
        ].join('\n')
      });
      return {
        success: true,
        reference_id: 'PLAN-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        message: fallbackRes.message
      };
    }
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

  async uploadImage(fileOrBase64: File | string, fileName?: string): Promise<string> {
    try {
      let base64 = '';
      let name = fileName || 'image';
      if (fileOrBase64 instanceof File) {
        name = fileOrBase64.name;
        base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(fileOrBase64);
        });
      } else {
        base64 = fileOrBase64;
      }

      const url = `${API_BASE_URL}/admin/upload_image.php`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getCsrfHeader()
        },
        body: JSON.stringify({ image_data: base64, fileName: name })
      });
      const json = await handleResponse<any>(res);
      return json.image_url || json.url;
    } catch (err) {
      // Fallback to ImageKit or local storage endpoint
      const ik = await this.uploadToImageKit(fileOrBase64, fileName);
      return ik.url;
    }
  },

  // Admin Orders
  async getAdminOrders(): Promise<Order[]> {
    const url = `${API_BASE_URL}/admin/orders.php`;
    const res = await fetch(url, { headers: getCsrfHeader() });
    const json = await handleResponse<ApiResponse<Order[]>>(res);
    return json.data || [];
  },

  async updateAdminOrderStatus(
    id: number,
    orderStatus: string,
    optionsOrPayment?:
      | string
      | {
          paymentStatus?: string;
          courierPartner?: string;
          trackingAwb?: string;
          trackingUrl?: string;
          estimatedDelivery?: string;
          customerEmail?: string;
          forceSendEmail?: boolean;
        }
  ): Promise<{
    success: boolean;
    message: string;
    email_triggered?: boolean;
    email_details?: {
      recipient: string;
      subject: string;
      courier: string;
      tracking_awb: string;
      sent_at: string;
      mode: string;
      preview_html: string;
    };
    order?: Order;
  }> {
    const url = `${API_BASE_URL}/admin/orders.php`;
    const bodyPayload: any = { id, order_status: orderStatus };

    if (typeof optionsOrPayment === 'string') {
      bodyPayload.payment_status = optionsOrPayment;
    } else if (optionsOrPayment && typeof optionsOrPayment === 'object') {
      if (optionsOrPayment.paymentStatus) bodyPayload.payment_status = optionsOrPayment.paymentStatus;
      if (optionsOrPayment.courierPartner) bodyPayload.courier_partner = optionsOrPayment.courierPartner;
      if (optionsOrPayment.trackingAwb) bodyPayload.tracking_awb = optionsOrPayment.trackingAwb;
      if (optionsOrPayment.trackingUrl) bodyPayload.tracking_url = optionsOrPayment.trackingUrl;
      if (optionsOrPayment.estimatedDelivery) bodyPayload.estimated_delivery = optionsOrPayment.estimatedDelivery;
      if (optionsOrPayment.customerEmail) bodyPayload.customer_email = optionsOrPayment.customerEmail;
      if (optionsOrPayment.forceSendEmail) bodyPayload.force_send_email = optionsOrPayment.forceSendEmail;
    }

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getCsrfHeader()
      },
      body: JSON.stringify(bodyPayload)
    });
    return await handleResponse<any>(res);
  },

  async previewOrderShippingEmail(
    id: number,
    options?: {
      courierPartner?: string;
      trackingAwb?: string;
      estimatedDelivery?: string;
    }
  ): Promise<{
    success: boolean;
    subject: string;
    recipient: string;
    courier: string;
    tracking_awb: string;
    preview_html: string;
  }> {
    const url = `${API_BASE_URL}/admin/orders/email_preview.php`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getCsrfHeader()
      },
      body: JSON.stringify({
        id,
        courier_partner: options?.courierPartner,
        tracking_awb: options?.trackingAwb,
        estimated_delivery: options?.estimatedDelivery
      })
    });
    return await handleResponse<any>(res);
  },

  // Admin Blogs
  async getAdminBlogs(): Promise<Blog[]> {
    const url = `${API_BASE_URL}/admin/blogs.php?_t=${Date.now()}`;
    const res = await fetch(url, { 
      cache: 'no-store',
      headers: {
        ...getCsrfHeader(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    const json = await handleResponse<ApiResponse<Blog[]>>(res);
    return json.data || [];
  },

  async saveAdminBlogs(blogs: Blog[]): Promise<Blog[]> {
    const url = `${API_BASE_URL}/admin/blogs.php`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getCsrfHeader()
      },
      body: JSON.stringify({ blogs })
    });
    const json = await handleResponse<any>(res);
    return json.data || blogs;
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
  },

  async uploadHeaderLogo(fileOrBase64OrUrl: File | string, fileName?: string): Promise<{ logo_url: string; message: string }> {
    let payload: { logo_data?: string; logo_url?: string; filename?: string } = {};

    if (fileOrBase64OrUrl instanceof File) {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(fileOrBase64OrUrl);
      });
      payload = {
        logo_data: base64,
        filename: fileName || fileOrBase64OrUrl.name
      };
    } else if (typeof fileOrBase64OrUrl === 'string' && fileOrBase64OrUrl.startsWith('data:image/')) {
      payload = {
        logo_data: fileOrBase64OrUrl,
        filename: fileName || 'logo.png'
      };
    } else {
      payload = {
        logo_url: fileOrBase64OrUrl,
        filename: fileName || 'logo.png'
      };
    }

    const url = `${API_BASE_URL}/admin/upload_logo.php`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getCsrfHeader()
      },
      body: JSON.stringify(payload)
    });

    const json = await handleResponse<any>(res);
    return {
      logo_url: json.logo_url || json.url,
      message: json.message || 'Header logo uploaded and saved to database successfully.'
    };
  },

  // -------------------------------------------------------------
  // BANNERS API (HERO, PROMO, CATEGORY, CURATED)
  // -------------------------------------------------------------
  async getBanners(all: boolean = false, type?: string): Promise<Banner[]> {
    const params = new URLSearchParams();
    if (all) params.append('all', 'true');
    if (type) params.append('type', type);
    const url = `${API_BASE_URL}/banners/index.php?${params.toString()}`;
    const res = await fetch(url);
    const json = await handleResponse<ApiResponse<Banner[]>>(res);
    return json.data || [];
  },

  async saveBanner(banner: Partial<Banner>): Promise<{ id: number }> {
    const url = `${API_BASE_URL}/banners/save.php`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getCsrfHeader()
      },
      body: JSON.stringify(banner)
    });
    const json = await handleResponse<any>(res);
    return { id: json.id };
  },

  async deleteBanner(id: number): Promise<void> {
    const url = `${API_BASE_URL}/banners/delete.php`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getCsrfHeader()
      },
      body: JSON.stringify({ id })
    });
    await handleResponse<any>(res);
  },

  // -------------------------------------------------------------
  // ALL PAGES & SECTIONS CMS API
  // -------------------------------------------------------------
  async getSections(page?: string, all: boolean = false): Promise<PageSection[]> {
    const params = new URLSearchParams();
    if (all) params.append('all', 'true');
    if (page) params.append('page', page);
    const url = `${API_BASE_URL}/sections/index.php?${params.toString()}`;
    const res = await fetch(url);
    const json = await handleResponse<ApiResponse<PageSection[]>>(res);
    return json.data || [];
  },

  async saveSection(section: Partial<PageSection>): Promise<void> {
    const url = `${API_BASE_URL}/sections/save.php`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getCsrfHeader()
      },
      body: JSON.stringify(section)
    });
    await handleResponse<any>(res);
  },

  // -------------------------------------------------------------
  // IMAGEKIT CDN & DIRECT UPLOAD API
  // -------------------------------------------------------------
  async uploadToImageKit(
    fileOrUrl: File | string,
    fileName?: string,
    folder: string = '/jsartdecor'
  ): Promise<ImageKitUploadResult> {
    const url = `${API_BASE_URL}/upload/imagekit.php`;

    // If it's a browser File object, convert to base64 or send as FormData
    if (fileOrUrl instanceof File) {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(fileOrUrl);
      });

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getCsrfHeader()
        },
        body: JSON.stringify({
          file: base64,
          fileName: fileName || fileOrUrl.name,
          folder
        })
      });

      const json = await handleResponse<any>(res);
      return {
        url: json.url || json.image_url,
        thumbnailUrl: json.thumbnailUrl || json.url,
        fileId: json.fileId,
        name: json.name || fileName
      };
    } else {
      // Remote URL or Base64 string
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getCsrfHeader()
        },
        body: JSON.stringify({
          file: fileOrUrl,
          fileName: fileName || 'image_' + Date.now() + '.jpg',
          folder
        })
      });

      const json = await handleResponse<any>(res);
      return {
        url: json.url || json.image_url,
        thumbnailUrl: json.thumbnailUrl || json.url,
        fileId: json.fileId,
        name: json.name
      };
    }
  },

  async testImageKitConnection(): Promise<{ success: boolean; message: string; endpoint?: string }> {
    const url = `${API_BASE_URL}/upload/imagekit.php?action=test`;
    const res = await fetch(url, { headers: getCsrfHeader() });
    return await handleResponse<any>(res);
  },

  async deleteEnquiry(id: number): Promise<void> {
    const url = `${API_BASE_URL}/contact/messages.php`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getCsrfHeader()
      },
      body: JSON.stringify({ id })
    });
    await handleResponse<any>(res);
  }
};
