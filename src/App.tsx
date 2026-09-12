import React, { useState, useEffect } from 'react';
import { ApiService } from './services/api';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { Product, CartItem, Order, Blog, Partner, SiteSettings } from './types/ecommerce';
import { INITIAL_PRODUCTS, INITIAL_BLOGS, INITIAL_PARTNERS } from './data/mockData';
import { 
  LayoutDashboard, Package, ShoppingBag, BookOpen, Users, Settings, LogOut, 
  RefreshCw, Loader2, Layers, LayoutGrid, MessageSquare 
} from 'lucide-react';

// Code-split non-home views so initial bundle loads instantly
const WholesaleTreePage = React.lazy(() => import('./pages/WholesaleTreePage').then(m => ({ default: m.WholesaleTreePage })));
const CatalogPage = React.lazy(() => import('./pages/CatalogPage').then(m => ({ default: m.CatalogPage })));
const ProductDetailPage = React.lazy(() => import('./pages/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const CartPage = React.lazy(() => import('./pages/CartPage').then(m => ({ default: m.CartPage })));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const OrderSuccessPage = React.lazy(() => import('./pages/OrderSuccessPage').then(m => ({ default: m.OrderSuccessPage })));
const TrackOrderPage = React.lazy(() => import('./pages/TrackOrderPage').then(m => ({ default: m.TrackOrderPage })));
const BlogPage = React.lazy(() => import('./pages/BlogPage').then(m => ({ default: m.BlogPage })));
const PartnersPage = React.lazy(() => import('./pages/PartnersPage').then(m => ({ default: m.PartnersPage })));
const ContactPage = React.lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));

// Admin Pages (Loaded only on demand)
const AdminLogin = React.lazy(() => import('./pages/admin/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminProducts = React.lazy(() => import('./pages/admin/AdminProducts').then(m => ({ default: m.AdminProducts })));
const AdminOrders = React.lazy(() => import('./pages/admin/AdminOrders').then(m => ({ default: m.AdminOrders })));
const AdminBlogs = React.lazy(() => import('./pages/admin/AdminBlogs').then(m => ({ default: m.AdminBlogs })));
const AdminPartners = React.lazy(() => import('./pages/admin/AdminPartners').then(m => ({ default: m.AdminPartners })));
const AdminSettings = React.lazy(() => import('./pages/admin/AdminSettings').then(m => ({ default: m.AdminSettings })));
const AdminBanners = React.lazy(() => import('./pages/admin/AdminBanners').then(m => ({ default: m.AdminBanners })));
const AdminSections = React.lazy(() => import('./pages/admin/AdminSections').then(m => ({ default: m.AdminSections })));
const AdminMessages = React.lazy(() => import('./pages/admin/AdminMessages').then(m => ({ default: m.AdminMessages })));

const DEFAULT_SETTINGS: SiteSettings = {
  store_name: 'JSArt&Decor',
  logo_path: '/uploads/logo.png',
  contact_phone: '+91 86024 14046',
  contact_email: 'info.jsartanddecor@gmail.com',
  whatsapp_number: '+91 86024 14046',
  address: 'JSArt&Decor Textile & Art Hub, Phase II Industrial Estate, Jaipur, Rajasthan 302022, India',
  free_shipping_threshold: 2499,
  standard_shipping_fee: 150,
  enable_cod: false,
  razorpay_key_id: ''
};

const ViewLoadingFallback = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3 py-12">
    <Loader2 className="w-8 h-8 text-[#D4A017] animate-spin" />
    <span className="text-xs font-mono text-[#D4A017]/80 tracking-wider uppercase">Loading...</span>
  </div>
);

export default function App() {
  const [activeView, setActiveView] = useState<string>('home');
  const [viewParam, setViewParam] = useState<any>(null);
  const [mode, setMode] = useState<'Retail' | 'Wholesale'>('Retail');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Initialized with catalog data for 0ms first-paint, refreshed seamlessly in background
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('jsart_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>(INITIAL_BLOGS);
  const [partners, setPartners] = useState<Partner[]>(INITIAL_PARTNERS);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [isAdminAuth, setIsAdminAuth] = useState<boolean>(false);

  // Load public data on mount seamlessly in background without blocking screen
  useEffect(() => {
    loadPublicData();
    checkAdminSessionStatus();
  }, []);

  const loadPublicData = async () => {
    try {
      const [prodsRes, blogsRes, partnersRes, settingsRes] = await Promise.all([
        ApiService.getProducts().catch(() => null),
        ApiService.getBlogs().catch(() => null),
        ApiService.getPartners().catch(() => null),
        ApiService.getPublicSettings().catch(() => null)
      ]);

      if (Array.isArray(prodsRes) && prodsRes.length > 0) {
        setProducts(prodsRes);
      }
      if (Array.isArray(blogsRes)) {
        setBlogs(blogsRes);
      }
      if (Array.isArray(partnersRes) && partnersRes.length > 0) {
        setPartners(partnersRes);
      }

      if (settingsRes && typeof settingsRes === 'object') {
        const rawSettings = settingsRes as any;
        const loadedSettings: SiteSettings = {
          store_name: rawSettings.store_name || rawSettings.site_name || 'JSArt&Decor',
          logo_path: rawSettings.logo_path || rawSettings.logo_url || '/uploads/logo.png',
          contact_phone: settingsRes.contact_phone || '+91 86024 14046',
          contact_email: settingsRes.contact_email || 'info.jsartanddecor@gmail.com',
          whatsapp_number: settingsRes.whatsapp_number || settingsRes.contact_phone || '+91 86024 14046',
          address: settingsRes.address || '',
          free_shipping_threshold: Number(settingsRes.free_shipping_threshold || 2499),
          standard_shipping_fee: Number(settingsRes.standard_shipping_fee || 150),
          enable_cod: false,
          razorpay_key_id: settingsRes.razorpay_key_id || ''
        };
        setSettings(loadedSettings);
      }
    } catch (err: any) {
      console.warn('Background sync with database:', err);
    }
  };

  const checkAdminSessionStatus = async () => {
    try {
      const res = await ApiService.adminCheckSession();
      if (res && res.authenticated) {
        setIsAdminAuth(true);
        loadAdminOrders();
        ApiService.getAdminProducts().then((adminProds) => {
          if (Array.isArray(adminProds) && adminProds.length > 0) {
            setProducts(adminProds);
          }
        }).catch(() => {});
      } else {
        setIsAdminAuth(false);
      }
    } catch {
      setIsAdminAuth(false);
    }
  };

  const loadAdminOrders = async () => {
    try {
      const res = await ApiService.getAdminOrders();
      if (Array.isArray(res)) {
        setOrders(res);
      }
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    }
  };

  const saveCartToStorage = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    try {
      localStorage.setItem('jsart_cart', JSON.stringify(updatedCart));
    } catch (err) {
      console.error('Failed to persist cart locally:', err);
    }
  };

  const handleNavigate = (view: string, param?: any) => {
    setActiveView(view);
    setViewParam(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (product: Product, quantity: number, pricingType: 'Retail' | 'Wholesale') => {
    const existingIndex = cart.findIndex(
      item => item.product.id === product.id && item.pricingType === pricingType
    );

    let updatedCart = [...cart];
    const unitPrice = pricingType === 'Wholesale' ? product.wholesale_price : product.retail_price;

    if (existingIndex > -1) {
      updatedCart[existingIndex].quantity += quantity;
    } else {
      updatedCart.push({
        product,
        quantity,
        pricingType,
        unitPrice
      });
    }

    saveCartToStorage(updatedCart);
  };

  const handleUpdateCartQuantity = (productId: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(productId);
      return;
    }

    const updated = cart.map(item => item.product.id === productId ? { ...item, quantity: newQty } : item);
    saveCartToStorage(updated);
  };

  const handleRemoveCartItem = (productId: number) => {
    const updated = cart.filter(item => item.product.id !== productId);
    saveCartToStorage(updated);
  };

  const handleClearCart = () => {
    saveCartToStorage([]);
  };

  const handleRefreshProducts = async () => {
    try {
      const prods = isAdminAuth ? await ApiService.getAdminProducts() : await ApiService.getProducts();
      if (Array.isArray(prods)) setProducts(prods);
    } catch {
      const prods = await ApiService.getProducts();
      if (Array.isArray(prods)) setProducts(prods);
    }
  };

  const handleRefreshOrders = async () => {
    await loadAdminOrders();
  };

  const handleRefreshBlogs = async () => {
    const b = await ApiService.getBlogs();
    if (Array.isArray(b)) setBlogs(b);
  };

  const handleRefreshPartners = async () => {
    const p = await ApiService.getPartners();
    if (Array.isArray(p)) setPartners(p);
  };

  const handleRefreshSettings = async () => {
    const s = await ApiService.getPublicSettings();
    if (s) {
      const rawS = s as any;
      setSettings({
        store_name: rawS.store_name || rawS.site_name || 'JSArt&Decor',
        logo_path: rawS.logo_path || rawS.logo_url || '/uploads/logo.png',
        contact_phone: s.contact_phone || '+91 86024 14046',
        contact_email: s.contact_email || 'info.jsartanddecor@gmail.com',
        whatsapp_number: s.whatsapp_number || s.contact_phone || '+91 86024 14046',
        address: s.address || '',
        free_shipping_threshold: Number(s.free_shipping_threshold || 0),
        standard_shipping_fee: Number(s.standard_shipping_fee || 0),
        enable_cod: s.enable_cod !== false,
        razorpay_key_id: s.razorpay_key_id || ''
      });
    }
  };

  const handleAdminLogout = async () => {
    try {
      await ApiService.adminLogout();
    } catch {}
    setIsAdminAuth(false);
    setActiveView('home');
  };

  const handleSelectProduct = (product: Product) => {
    handleNavigate('detail', { product });
  };

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans antialiased flex flex-col justify-between selection:bg-[#D4A017] selection:text-black">
      {/* Header */}
      <Header
        settings={settings}
        cartCount={cartCount}
        activeView={activeView}
        onNavigate={handleNavigate}
        mode={mode}
        setMode={setMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Container View Routing */}
      <main className="flex-1">
        <React.Suspense fallback={<ViewLoadingFallback />}>
          {activeView === 'home' && (
            <HomePage
              products={products}
              blogs={blogs}
              partners={partners}
              settings={settings}
              mode={mode}
              setMode={setMode}
              onSelectProduct={handleSelectProduct}
              onAddToCart={handleAddToCart}
              onNavigate={handleNavigate}
            />
          )}

        {activeView === 'wholesale-tree' && (
          <WholesaleTreePage
            products={products}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
            onNavigate={handleNavigate}
          />
        )}

        {activeView === 'catalog' && (
          <CatalogPage
            products={products}
            initialFilters={viewParam}
            mode={mode}
            setMode={setMode}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
          />
        )}

        {activeView === 'detail' && viewParam?.product && (
          <ProductDetailPage
            product={viewParam.product}
            allProducts={products}
            settings={settings}
            mode={mode}
            setMode={setMode}
            onAddToCart={handleAddToCart}
            onSelectProduct={handleSelectProduct}
            onNavigate={handleNavigate}
          />
        )}

        {activeView === 'cart' && (
          <CartPage
            cart={cart}
            settings={settings}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            onNavigate={handleNavigate}
          />
        )}

        {activeView === 'checkout' && (
          <CheckoutPage
            cart={cart}
            settings={settings}
            mode={mode}
            onClearCart={handleClearCart}
            onOrderSuccess={(orderNumber) => handleNavigate('order-success', { orderId: orderNumber })}
            onNavigate={handleNavigate}
          />
        )}

        {activeView === 'order-success' && viewParam?.orderId && (
          <OrderSuccessPage
            orderId={viewParam.orderId}
            settings={settings}
            onNavigate={handleNavigate}
          />
        )}

        {activeView === 'track-order' && (
          <TrackOrderPage
            orderId={viewParam?.orderId}
            settings={settings}
            onNavigate={handleNavigate}
          />
        )}

        {activeView === 'blogs' && (
          <BlogPage
            blogs={blogs}
            initialBlogId={viewParam?.blogId}
            onNavigate={handleNavigate}
          />
        )}

        {activeView === 'partners' && (
          <PartnersPage
            partners={partners}
            settings={settings}
            onNavigate={handleNavigate}
          />
        )}

        {activeView === 'contact' && (
          <ContactPage
            settings={settings}
            onNavigate={handleNavigate}
          />
        )}

        {activeView === 'admin-login' && (
          <AdminLogin
            onLoginSuccess={() => {
              setIsAdminAuth(true);
              loadAdminOrders();
              setActiveView('admin-portal');
            }}
            onNavigate={handleNavigate}
          />
        )}

        {activeView === 'admin-portal' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            {!isAdminAuth ? (
              <AdminLogin
                onLoginSuccess={() => {
                  setIsAdminAuth(true);
                  loadAdminOrders();
                }}
                onNavigate={handleNavigate}
              />
            ) : (
              <div className="space-y-6">
                {/* Admin Sub-Nav Bar */}
                <div className="bg-neutral-900 text-white p-4 rounded-2xl border border-neutral-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center space-x-1 font-bold text-xs overflow-x-auto">
                    <button
                      onClick={() => setAdminTab('dashboard')}
                      className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                        adminTab === 'dashboard' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </button>

                    <button
                      onClick={() => setAdminTab('products')}
                      className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                        adminTab === 'products' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                      }`}
                    >
                      <Package className="w-4 h-4" />
                      <span>Products</span>
                    </button>

                    <button
                      onClick={() => {
                        setAdminTab('orders');
                        loadAdminOrders();
                      }}
                      className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                        adminTab === 'orders' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Orders ({orders.length})</span>
                    </button>

                    <button
                      onClick={() => setAdminTab('banners')}
                      className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                        adminTab === 'banners' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                      <span>Banners</span>
                    </button>

                    <button
                      onClick={() => setAdminTab('sections')}
                      className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                        adminTab === 'sections' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                      }`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                      <span>Pages CMS</span>
                    </button>

                    <button
                      onClick={() => setAdminTab('messages')}
                      className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                        adminTab === 'messages' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Enquiries</span>
                    </button>

                    <button
                      onClick={() => setAdminTab('blogs')}
                      className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                        adminTab === 'blogs' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Blogs</span>
                    </button>

                    <button
                      onClick={() => setAdminTab('partners')}
                      className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                        adminTab === 'partners' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>Partners</span>
                    </button>

                    <button
                      onClick={() => setAdminTab('settings')}
                      className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                        adminTab === 'settings' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                      }`}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings & Database</span>
                    </button>
                  </div>

                  <button
                    onClick={handleAdminLogout}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold border border-red-500/30 px-3 py-1.5 rounded-lg"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Exit Admin</span>
                  </button>
                </div>

                {/* Tab Views */}
                {adminTab === 'dashboard' && (
                  <AdminDashboard
                    products={products}
                    orders={orders}
                    onNavigateTab={(tab) => {
                      setAdminTab(tab);
                      if (tab === 'orders') loadAdminOrders();
                    }}
                  />
                )}

                {adminTab === 'products' && (
                  <AdminProducts
                    products={products}
                    onRefreshProducts={handleRefreshProducts}
                  />
                )}

                {adminTab === 'orders' && (
                  <AdminOrders
                    orders={orders}
                    onRefreshOrders={handleRefreshOrders}
                  />
                )}

                {adminTab === 'banners' && (
                  <AdminBanners />
                )}

                {adminTab === 'sections' && (
                  <AdminSections />
                )}

                {adminTab === 'messages' && (
                  <AdminMessages />
                )}

                {adminTab === 'blogs' && (
                  <AdminBlogs
                    blogs={blogs}
                    onRefreshBlogs={handleRefreshBlogs}
                  />
                )}

                {adminTab === 'partners' && (
                  <AdminPartners
                    partners={partners}
                    onRefreshPartners={handleRefreshPartners}
                  />
                )}

                {adminTab === 'settings' && (
                  <AdminSettings
                    settings={settings}
                    onRefreshSettings={handleRefreshSettings}
                  />
                )}
              </div>
            )}
          </div>
        )}
        </React.Suspense>
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
