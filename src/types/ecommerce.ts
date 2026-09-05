export type ProductionType = 'Handmade' | 'Factory';
export type Segment = 'Home' | 'Hotel' | 'Event';
export type ProductType = 'HOME DECOR' | 'ART DECOR' | 'ELECTRIC DECOR';
export type SalesAvailability = 'Retail' | 'Wholesale' | 'Both';

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description: string;
  short_description: string;
  images: string[];
  production_type: ProductionType;
  segment: Segment;
  product_type: ProductType;
  sales_availability: SalesAvailability;
  retail_price: number;
  wholesale_price: number;
  stock_quantity: number;
  min_wholesale_qty: number;
  size: string;
  material: string;
  color: string;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  pricingType: 'Retail' | 'Wholesale';
  unitPrice: number;
}

export type OrderStatus = 'New' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed';
export type PaymentMethod = 'Razorpay' | 'COD';

export interface OrderTimelineMilestone {
  step: number;
  title: string;
  description: string;
  timestamp?: string;
  completed: boolean;
  current: boolean;
}

export interface OrderTrackingItem {
  productId: number;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  image?: string;
  size?: string;
  material?: string;
}

export interface OrderTrackingData {
  orderNumber: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  razorpayPaymentId?: string;
  createdAt: string;
  estimatedDelivery: string;
  courierPartner: string;
  trackingAwb: string;
  customer: OrderCustomer;
  items: OrderTrackingItem[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  timeline: OrderTimelineMilestone[];
}

export interface OrderCustomer {
  fullName: string;
  mobileNumber: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  orderNotes?: string;
}

export interface OrderItemRecord {
  id?: number;
  productId: number;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  itemType: 'Retail' | 'Wholesale';
  subtotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  customer: OrderCustomer;
  items: OrderItemRecord[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  orderStatus: OrderStatus;
  orderType: 'Retail' | 'Wholesale';
  createdAt: string;
  updatedAt?: string;
}

export interface Blog {
  id: number;
  title: string;
  slug: string;
  featured_image: string;
  short_description: string;
  full_content: string;
  category: string;
  author: string;
  status: 'Draft' | 'Published';
  created_at: string;
}

export interface Partner {
  id: number;
  name: string;
  logo_url: string;
  description: string;
  website: string;
  display_order: number;
  is_active: boolean;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  mobile: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface SiteSettings {
  store_name: string;
  logo_path: string;
  contact_phone: string;
  whatsapp_number: string;
  contact_email: string;
  address: string;
  razorpay_key_id: string; // PUBLIC KEY ONLY
  enable_cod: boolean;
  free_shipping_threshold: number;
  standard_shipping_fee: number;
}
