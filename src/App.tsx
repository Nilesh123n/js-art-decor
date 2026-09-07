import React, { useState, useEffect } from 'react';
import { ApiService } from './services/api';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { WholesaleTreePage } from './pages/WholesaleTreePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { BlogPage } from './pages/BlogPage';
import { PartnersPage } from './pages/PartnersPage';
import { ContactPage } from './pages/ContactPage';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminBlogs } from './pages/admin/AdminBlogs';
import { AdminPartners } from './pages/admin/AdminPartners';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminBanners } from './pages/admin/AdminBanners';
import { AdminSections } from './pages/admin/AdminSections';
import { AdminMessages } from './pages/admin/AdminMessages';
import { Product, CartItem, Order, Blog, Partner, SiteSettings } from './types/ecommerce';
import { LayoutDashboard, Package, ShoppingBag, BookOpen, Users, Settings, LogOut, AlertTriangle, RefreshCw, Loader2, Layers, LayoutGrid, MessageSquare } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<string>('home');
  const [viewParam, setViewParam] = useState<any>(null);
  const [mode, setMode] = useState<'Retail' | 'Wholesale'>('Retail');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Production API state (NO hardcoded demo fallbacks or fake Razorpay test keys)
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('jsart_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [isAdminAuth, setIsAdminAuth] = useState<boolean>(false);

  // Load public data on mount
  useEffect(() => {
    loadPublicData();
    checkAdminSessionStatus();
  }, []);

  const loadPublicData = async () => {
    setInitialLoading(true);
    setApiError(null);
    try {
      const [prodsRes, blogsRes, partnersRes, settingsRes] = await Promise.all([
        ApiService.getProducts(),
        ApiService.getBlogs(),
        ApiService.getPartners(),
        ApiService.getPublicSettings()
      ]);

      setProducts(Array.isArray(prodsRes) ? prodsRes : []);
      setBlogs(Array.isArray(blogsRes) ? blogsRes : []);
      setPartners(Array.isArray(partnersRes) ? partnersRes : []);

      if (!settingsRes || typeof settingsRes !== 'object') {
        throw new Error('Failed to load store settings from MySQL database.');
      }

      const rawSettings = settingsRes as any;
      const loadedSettings: SiteSettings = {
        store_name: rawSettings.store_name || rawSettings.site_name || 'JSArt&Decor',
        logo_path: rawSettings.logo_path || rawSettings.logo_url || '/uploads/logo.png',
        contact_phone: settingsRes.contact_phone || '+91 86024 14046',
        contact_email: settingsRes.contact_email || 'info.jsartanddecor@gmail.com',
        whatsapp_number: settingsRes.whatsapp_number || settingsRes.contact_phone || '+91 86024 14046',
        address: settingsRes.address || '',
        free_shipping_threshold: Number(settingsRes.free_shipping_threshold || 0),
        standard_shipping_fee: Number(settingsRes.standard_shipping_fee || 0),
        enable_cod: false,
        razorpay_key_id: settingsRes.razorpay_key_id || ''
      };

      setSettings(loadedSettings);
    } catch (err: any) {
      console.error('Failed to load initial data from MySQL API:', err);
      setApiError(err.message || 'Unable to connect to MySQL backend database.');
    } finally {
      setInitialLoading(false);
    }
  };

  const checkAdminSessionStatus = async () => {
    try {
      const res = await ApiService.adminCheckSession();
      if (res && res.authenticated) {
        setIsAdminAuth(true);
        loadAdminOrders();
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
    const prods = await ApiService.getProducts();
    if (Array.isArray(prods)) setProducts(prods);
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

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        <p className="text-sm font-medium tracking-wide">Connecting to JSArt&Decor Production Database...</p>
      </div>
    );
  }

  if (apiError || !settings) {
    return (
      <div className="min-h-screen bg-[#000000] text-white flex items-center justify-center p-6">
        <div className="bg-[#0A0A0A] p-8 rounded-2xl border border-[#D4A017] shadow-[0_0_25px_rgba(212,160,23,0.25)] max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 bg-red-950/60 text-red-400 border border-red-500 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-serif font-bold text-white">Backend Connection Error</h2>
          <p className="text-xs text-[#CCCCCC] leading-relaxed">
            {apiError || 'Failed to retrieve storefront parameters from MySQL database server.'}
          </p>
          <button
            onClick={loadPublicData}
            className="w-full py-3 bg-[#D4A017] hover:bg-[#E5B842] text-black font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-[0_0_15px_rgba(212,160,23,0.3)]"
          >
            <RefreshCw className="w-4 h-4 text-black" />
            <span>Retry Backend Connection</span>
          </button>
        </div>
      </div>
    );
  }

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
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
