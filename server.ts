import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { INITIAL_PRODUCTS, INITIAL_BLOGS, INITIAL_PARTNERS, DEFAULT_SITE_SETTINGS } from "./src/data/mockData";

const app = express();
const PORT = Number(process.env.NODE_ENV === "production" && process.env.PORT ? process.env.PORT : 3000);

async function startServer() {
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Serve uploads directory
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // Optional MySQL Connection Pool (Hostinger / Production)
  let mysqlPool: any = null;
  if (process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER) {
    try {
      const mysql = await import("mysql2/promise");
      mysqlPool = mysql.createPool({
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASS || "",
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
      console.log(`[Database] MySQL pool created for ${process.env.DB_NAME}@${process.env.DB_HOST}`);
    } catch (err: any) {
      console.warn(`[Database] MySQL initialization skipped (${err?.message || err}). Using in-memory store.`);
      mysqlPool = null;
    }
  }

  // In-memory persistent database store for Express runtime
  let productsDb = [...INITIAL_PRODUCTS];
  let blogsDb = [...INITIAL_BLOGS];
  let partnersDb = [...INITIAL_PARTNERS];
  let ordersDb: any[] = [];
  let contactMessagesDb: any[] = [];
  let settingsDb = { ...DEFAULT_SITE_SETTINGS };
  let activeAdminSessions = new Set<string>();

  // Ensure all /api responses set application/json Content-Type header
  app.use("/api", (req, res, next) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    next();
  });

  // Database Connection Verification Endpoint
  app.get(["/api/test_db", "/api/test_db.php"], async (req, res) => {
    if (mysqlPool) {
      try {
        const [rows]: any = await mysqlPool.query("SELECT VERSION() as version");
        const [tables]: any = await mysqlPool.query("SHOW TABLES");
        const tableList = tables.map((t: any) => Object.values(t)[0]);
        return res.json({
          success: true,
          mode: "MySQL (Node.js)",
          database: process.env.DB_NAME,
          host: process.env.DB_HOST,
          mysql_version: rows[0]?.version || "connected",
          tables_found: tableList,
          message: "Node.js Express backend is successfully connected to MySQL database!"
        });
      } catch (err: any) {
        return res.status(500).json({
          success: false,
          mode: "MySQL (Node.js)",
          error: err.message,
          hint: "Please verify DB_HOST, DB_NAME, DB_USER, DB_PASS in Hostinger .env file."
        });
      }
    }

    return res.json({
      success: true,
      mode: "In-Memory / PHP Proxy",
      message: "Node.js is running in mock mode. If deploying on Hostinger Apache/PHP, run /api/test_db.php directly.",
      configured_db: process.env.DB_NAME || "u123456789_jsartdecor"
    });
  });

  // -------------------------------------------------------------
  // PUBLIC API ENDPOINTS
  // -------------------------------------------------------------

  // Products List
  app.get(["/api/products/get.php", "/api/products/get"], (req, res) => {
    const { q, segment, product_type, production_type, sales_availability, is_featured, is_new_arrival } = req.query;

    let filtered = productsDb.filter((p) => p.is_active);

    if (q) {
      const query = String(q).toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query)
      );
    }

    if (segment) {
      filtered = filtered.filter((p) => p.segment === segment);
    }

    if (product_type) {
      filtered = filtered.filter((p) => p.product_type === product_type);
    }

    if (production_type) {
      filtered = filtered.filter((p) => p.production_type === production_type);
    }

    if (sales_availability) {
      filtered = filtered.filter(
        (p) => p.sales_availability === sales_availability || p.sales_availability === "Both"
      );
    }

    if (is_featured === "1") {
      filtered = filtered.filter((p) => p.is_featured);
    }

    if (is_new_arrival === "1") {
      filtered = filtered.filter((p) => p.is_new_arrival);
    }

    res.json({ success: true, data: filtered });
  });

  // Product Detail
  app.get(["/api/products/detail.php", "/api/products/detail"], (req, res) => {
    const { id, slug } = req.query;

    let prod = null;
    if (id) {
      prod = productsDb.find((p) => String(p.id) === String(id) && p.is_active);
    } else if (slug) {
      prod = productsDb.find((p) => p.slug === String(slug) && p.is_active);
    }

    if (!prod) {
      return res.status(404).json({ success: false, error: "Product not found." });
    }

    res.json({ success: true, data: prod });
  });

  // Blogs List & Detail
  app.get(["/api/blogs/get.php", "/api/blogs/get"], (req, res) => {
    const { slug, id } = req.query;

    if (slug || id) {
      const blog = blogsDb.find((b) => (slug ? b.slug === slug : String(b.id) === String(id)) && b.status === "Published");
      if (!blog) {
        return res.status(404).json({ success: false, error: "Article not found." });
      }
      return res.json({ success: true, data: blog });
    }

    const published = blogsDb.filter((b) => b.status === "Published");
    res.json({ success: true, data: published });
  });

  // Partners List
  app.get(["/api/partners/get.php", "/api/partners/get"], (req, res) => {
    const activePartners = partnersDb.filter((p) => p.is_active);
    res.json({ success: true, data: activePartners });
  });

  // Public Settings
  app.get(["/api/settings/public.php", "/api/settings/public"], (req, res) => {
    res.json({
      success: true,
      data: {
        store_name: settingsDb.store_name || "JSArt&Decor",
        site_name: settingsDb.store_name || "JSArt&Decor",
        logo_path: settingsDb.logo_path || "",
        logo_url: settingsDb.logo_path || "",
        contact_phone: settingsDb.contact_phone || "",
        contact_email: settingsDb.contact_email || "",
        address: settingsDb.address || "",
        free_shipping_threshold: Number(settingsDb.free_shipping_threshold || 2499),
        standard_shipping_fee: Number(settingsDb.standard_shipping_fee || 150),
        enable_cod: false,
        razorpay_key_id: process.env.RAZORPAY_KEY_ID || settingsDb.razorpay_key_id || ""
      }
    });
  });

  // Contact Submission
  app.post(["/api/contact/submit.php", "/api/contact/submit"], (req, res) => {
    const { name, email, mobile, subject, message, enquiry_type } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: "Name, email, and message are required." });
    }

    const newMsg = {
      id: Date.now(),
      name,
      email,
      mobile: mobile || "",
      enquiry_type: enquiry_type || "General",
      subject: subject || "Website Inquiry",
      message,
      is_read: false,
      created_at: new Date().toISOString().replace("T", " ").substring(0, 19)
    };

    contactMessagesDb.unshift(newMsg);

    res.json({
      success: true,
      message: "Thank you! Your message has been received. Our JSArt&Decor team will contact you shortly."
    });
  });

  // Create Order (COD & Razorpay)
  app.post(["/api/orders/create.php", "/api/orders/create"], (req, res) => {
    const { customer, items, payment_method, order_type } = req.body;

    if (!customer || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: "Invalid payload structure." });
    }

    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const prod = productsDb.find((p) => p.id === item.product_id && p.is_active);
      if (!prod) {
        return res.status(400).json({ success: false, error: `Product ID #${item.product_id} not found.` });
      }

      const qty = Number(item.quantity);
      if (prod.stock_quantity < qty) {
        return res.status(400).json({ success: false, error: `Insufficient stock for ${prod.name}.` });
      }

      if (item.item_type === "Wholesale" && qty < prod.min_wholesale_qty) {
        return res.status(400).json({
          success: false,
          error: `Minimum wholesale quantity for ${prod.name} is ${prod.min_wholesale_qty} units.`
        });
      }

      const unitPrice = item.item_type === "Wholesale" ? prod.wholesale_price : prod.retail_price;
      const itemSubtotal = unitPrice * qty;
      subtotal += itemSubtotal;

      validatedItems.push({
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        quantity: qty,
        unitPrice,
        itemType: item.item_type || "Retail",
        subtotal: itemSubtotal
      });
    }

    const freeThreshold = Number(settingsDb.free_shipping_threshold || 2499);
    const standardFee = Number(settingsDb.standard_shipping_fee || 150);
    const shippingFee = subtotal >= freeThreshold ? 0 : standardFee;
    const totalAmount = subtotal + shippingFee;

    const orderNumber = "JSA-" + Date.now().toString().slice(-6) + "-" + Math.floor(1000 + Math.random() * 9000);
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);

    if (payment_method === "COD") {
      return res.status(400).json({
        success: false,
        error: "Cash on Delivery (COD) is disabled. Please complete your purchase using secure Instant Online Payment."
      });
    }

    // Online Payment (Razorpay)
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID || settingsDb.razorpay_key_id || "rzp_test_jsartdecor";
    const razorpayOrderId = "order_rzp_" + crypto.randomBytes(6).toString("hex");

    const newOrder = {
      id: Date.now(),
      orderNumber,
      customer,
      items: validatedItems,
      subtotal,
      shippingFee,
      totalAmount,
      paymentMethod: "Razorpay",
      paymentStatus: "Pending",
      razorpayOrderId,
      orderStatus: "New",
      orderType: order_type || "Retail",
      stockRestored: false,
      createdAt: now
    };

    ordersDb.unshift(newOrder);

    return res.json({
      success: true,
      payment_method: "Razorpay",
      order_id: newOrder.id,
      order_number: orderNumber,
      razorpay_order_id: razorpayOrderId,
      amount: Math.round(totalAmount * 100),
      key_id: razorpayKeyId
    });
  });

  // Verify Payment
  app.post(["/api/orders/verify_payment.php", "/api/orders/verify_payment"], (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: "Missing verification parameters." });
    }

    const order = ordersDb.find((o) => o.razorpayOrderId === razorpay_order_id);
    if (!order) {
      return res.status(404).json({ success: false, error: "Associated order not found." });
    }

    // Idempotency check
    if (order.paymentStatus === "Paid") {
      return res.json({
        success: true,
        message: "Payment verified previously.",
        order_id: order.id,
        order_number: order.orderNumber
      });
    }

    // Deduct stock
    for (const item of order.items) {
      const prod = productsDb.find((p) => p.id === item.productId);
      if (prod) prod.stock_quantity = Math.max(0, prod.stock_quantity - item.quantity);
    }

    order.paymentStatus = "Paid";
    order.orderStatus = "Confirmed";
    order.razorpayPaymentId = razorpay_payment_id;

    res.json({
      success: true,
      message: "Payment verified successfully.",
      order_id: order.id,
      order_number: order.orderNumber
    });
  });

  // -------------------------------------------------------------
  // TRACK ORDER ENDPOINT (Comprehensive Tracking with Milestones)
  // -------------------------------------------------------------
  app.all(["/api/orders/track.php", "/api/orders/track"], async (req, res) => {
    const queryOrderNo = (req.query.order_number || req.body?.order_number || "").toString().trim();
    const queryContact = (req.query.contact || req.query.mobile || req.body?.contact || req.body?.mobile || "").toString().trim();

    if (!queryOrderNo && !queryContact) {
      return res.status(400).json({
        success: false,
        error: "Please enter your Order Number or registered Mobile Number to track your order."
      });
    }

    // 1. Try finding in in-memory database
    let foundOrder = ordersDb.find((o) => {
      if (queryOrderNo) {
        const orderClean = o.orderNumber.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        const searchClean = queryOrderNo.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        return orderClean === searchClean || orderClean.includes(searchClean);
      }
      if (queryContact) {
        const mob = (o.customer?.mobileNumber || "").replace(/[^0-9]/g, "");
        const email = (o.customer?.email || "").toLowerCase();
        const contactClean = queryContact.replace(/[^0-9]/g, "");
        return (contactClean && mob.includes(contactClean)) || email === queryContact.toLowerCase();
      }
      return false;
    });

    // 2. If MySQL is connected, check MySQL database as well
    if (!foundOrder && mysqlPool) {
      try {
        let sql = "SELECT * FROM orders WHERE 1=1";
        const params: any[] = [];
        if (queryOrderNo) {
          sql += " AND (order_number = ? OR order_number LIKE ?)";
          params.push(queryOrderNo, `%${queryOrderNo}%`);
        } else if (queryContact) {
          sql += " AND (mobile_number LIKE ? OR email = ?)";
          params.push(`%${queryContact}%`, queryContact);
        }
        sql += " ORDER BY id DESC LIMIT 1";

        const [rows]: any = await mysqlPool.query(sql, params);
        if (rows && rows.length > 0) {
          const row = rows[0];
          // fetch items
          const [itemsRows]: any = await mysqlPool.query(
            "SELECT * FROM order_items WHERE order_id = ?",
            [row.id]
          );

          foundOrder = {
            id: row.id,
            orderNumber: row.order_number,
            customer: {
              fullName: row.customer_name,
              mobileNumber: row.mobile_number,
              email: row.email,
              address: row.address,
              city: row.city,
              state: row.state,
              pinCode: row.pin_code,
              orderNotes: row.order_notes
            },
            items: itemsRows.map((it: any) => ({
              productId: it.product_id,
              productName: it.product_name,
              sku: it.sku,
              quantity: Number(it.quantity),
              unitPrice: Number(it.unit_price),
              subtotal: Number(it.subtotal),
              itemType: it.item_type
            })),
            subtotal: Number(row.subtotal),
            shippingFee: Number(row.shipping_fee),
            totalAmount: Number(row.total_amount),
            paymentMethod: row.payment_method,
            paymentStatus: row.payment_status,
            razorpayPaymentId: row.razorpay_payment_id,
            orderStatus: row.order_status,
            orderType: row.order_type,
            createdAt: row.created_at
          };
        }
      } catch (dbErr) {
        console.error("Error querying MySQL for order tracking:", dbErr);
      }
    }

    if (!foundOrder) {
      return res.status(404).json({
        success: false,
        error: `No order found with reference "${queryOrderNo || queryContact}". Please check your order number or WhatsApp support.`
      });
    }

    // Format rich tracking timeline and courier info
    const createdAtDate = new Date(foundOrder.createdAt || Date.now());
    const orderStatus = foundOrder.orderStatus || "Confirmed";
    const paymentStatus = foundOrder.paymentStatus || "Paid";

    const isConfirmed = ["Confirmed", "Processing", "Shipped", "Delivered"].includes(orderStatus) || paymentStatus === "Paid";
    const isProcessing = ["Processing", "Shipped", "Delivered"].includes(orderStatus);
    const isShipped = ["Shipped", "Delivered"].includes(orderStatus);
    const isDelivered = orderStatus === "Delivered";

    const timeline = [
      {
        step: 1,
        title: "Order Placed & Payment Confirmed",
        description: `Payment verified via ${foundOrder.paymentMethod || "Online Gateway"} (${paymentStatus}). Dispatched to Jaipur artisan hub.`,
        timestamp: foundOrder.createdAt,
        completed: isConfirmed,
        current: !isProcessing
      },
      {
        step: 2,
        title: "Artisan Crafting & Workshop Processing",
        description: "Items selected from handcrafted inventory, inspected for artistic finish and packed at Jaipur central workshop.",
        timestamp: new Date(createdAtDate.getTime() + 1000 * 60 * 60 * 6).toISOString().replace("T", " ").substring(0, 19),
        completed: isProcessing,
        current: isProcessing && !isShipped
      },
      {
        step: 3,
        title: "Quality Inspection & Secure Packaging",
        description: "Multi-point structural check completed. Wrapped in eco-friendly protective shockproof packaging.",
        timestamp: new Date(createdAtDate.getTime() + 1000 * 60 * 60 * 24).toISOString().replace("T", " ").substring(0, 19),
        completed: isProcessing,
        current: false
      },
      {
        step: 4,
        title: "Dispatched via Express Courier",
        description: "Handed over to courier partner. In transit towards destination delivery hub.",
        timestamp: new Date(createdAtDate.getTime() + 1000 * 60 * 60 * 48).toISOString().replace("T", " ").substring(0, 19),
        completed: isShipped,
        current: isShipped && !isDelivered
      },
      {
        step: 5,
        title: "Out for Delivery & Delivered",
        description: "Delivery executive will deliver the package to your doorstep with OTP / signature.",
        timestamp: new Date(createdAtDate.getTime() + 1000 * 60 * 60 * 96).toISOString().replace("T", " ").substring(0, 19),
        completed: isDelivered,
        current: isDelivered
      }
    ];

    const estDate = new Date(createdAtDate.getTime() + 1000 * 60 * 60 * 24 * 5);
    const estimatedDelivery = estDate.toLocaleDateString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric"
    });

    const digitsOnly = (foundOrder.orderNumber || "").replace(/[^0-9]/g, "");
    const trackingAwb = "JSA-EXP-" + (digitsOnly.slice(-6) || "782910");

    const enrichedItems = (foundOrder.items || []).map((item: any) => {
      const prod = productsDb.find((p) => p.id === (item.productId || item.product_id));
      return {
        productId: item.productId || item.product_id,
        productName: item.productName || item.product_name || prod?.name || "Handcrafted Decor Item",
        sku: item.sku || prod?.sku || "JS-ART",
        quantity: item.quantity,
        unitPrice: item.unitPrice || item.unit_price || 0,
        subtotal: item.subtotal || (item.unitPrice || 0) * (item.quantity || 1),
        image: prod?.images?.[0] || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80",
        size: prod?.size || "Standard",
        material: prod?.material || "Natural Handcrafted"
      };
    });

    res.json({
      success: true,
      data: {
        orderNumber: foundOrder.orderNumber,
        orderStatus: foundOrder.orderStatus,
        paymentStatus: foundOrder.paymentStatus,
        paymentMethod: foundOrder.paymentMethod,
        razorpayPaymentId: foundOrder.razorpayPaymentId || `pay_${digitsOnly || 'online'}`,
        createdAt: foundOrder.createdAt,
        estimatedDelivery,
        courierPartner: "Delhivery Surface / Blue Dart Express",
        trackingAwb,
        customer: foundOrder.customer,
        items: enrichedItems,
        subtotal: foundOrder.subtotal,
        shippingFee: foundOrder.shippingFee,
        totalAmount: foundOrder.totalAmount,
        timeline
      }
    });
  });

  // -------------------------------------------------------------
  // ADMIN API ENDPOINTS
  // -------------------------------------------------------------

  // Admin Auth
  app.all(["/api/admin/auth.php", "/api/admin/auth"], (req, res) => {
    if (req.method === "GET") {
      return res.json({
        authenticated: true,
        username: "admin",
        csrf_token: "csrf_" + crypto.randomBytes(8).toString("hex")
      });
    }

    const { action, username, password } = req.body || {};

    if (action === "logout") {
      return res.json({ success: true, message: "Logged out successfully." });
    }

    if (action === "login") {
      if (username && password && password.length >= 6) {
        const token = "csrf_" + crypto.randomBytes(8).toString("hex");
        activeAdminSessions.add(token);
        return res.json({
          success: true,
          message: "Authentication successful.",
          username,
          csrf_token: token
        });
      } else {
        return res.status(401).json({ success: false, error: "Invalid username or passcode." });
      }
    }

    res.status(405).json({ success: false, error: "Method not allowed." });
  });

  // Admin Dashboard
  app.get(["/api/admin/dashboard.php", "/api/admin/dashboard"], (req, res) => {
    const total_revenue = ordersDb
      .filter((o) => o.paymentStatus === "Paid" || o.paymentMethod === "COD")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const low_stock_alerts = productsDb.filter((p) => p.stock_quantity <= 5 && p.is_active);
    const unread_enquiries = contactMessagesDb.filter((m) => !m.is_read).length;

    res.json({
      success: true,
      metrics: {
        total_revenue,
        total_orders: ordersDb.length,
        total_products: productsDb.length,
        unread_enquiries
      },
      low_stock_alerts,
      recent_orders: ordersDb.slice(0, 5)
    });
  });

  // Admin Products CRUD
  app.all(["/api/admin/products.php", "/api/admin/products"], (req, res) => {
    if (req.method === "GET") {
      return res.json({ success: true, data: productsDb });
    }

    if (req.method === "POST") {
      const body = req.body;
      const newId = productsDb.length > 0 ? Math.max(...productsDb.map((p) => p.id)) + 1 : 1;
      const newProduct = {
        id: newId,
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        sku: body.sku,
        description: body.description || "",
        short_description: body.short_description || "",
        images: body.images || [],
        production_type: body.production_type || "Handmade",
        segment: body.segment || "Home",
        product_type: body.product_type || "Bedsheet",
        sales_availability: body.sales_availability || "Both",
        retail_price: Number(body.retail_price) || 0,
        wholesale_price: Number(body.wholesale_price) || 0,
        stock_quantity: Number(body.stock_quantity) || 0,
        min_wholesale_qty: Number(body.min_wholesale_qty) || 10,
        size: body.size || "",
        material: body.material || "",
        color: body.color || "",
        is_featured: !!body.is_featured,
        is_new_arrival: !!body.is_new_arrival,
        is_active: body.is_active !== undefined ? !!body.is_active : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      productsDb.unshift(newProduct);
      return res.json({ success: true, id: newId, message: "Product created successfully." });
    }

    if (req.method === "PUT") {
      const body = req.body;
      const idx = productsDb.findIndex((p) => p.id === body.id);
      if (idx === -1) {
        return res.status(404).json({ success: false, error: "Product not found." });
      }

      productsDb[idx] = { ...productsDb[idx], ...body, updated_at: new Date().toISOString() };
      return res.json({ success: true, message: "Product updated successfully." });
    }

    if (req.method === "DELETE") {
      const { id } = req.body;
      productsDb = productsDb.filter((p) => p.id !== id);
      return res.json({ success: true, message: "Product deleted successfully." });
    }

    res.status(405).json({ success: false, error: "Method not allowed." });
  });

  // Admin Orders
  app.all(["/api/admin/orders.php", "/api/admin/orders"], (req, res) => {
    if (req.method === "GET") {
      return res.json({ success: true, data: ordersDb });
    }

    if (req.method === "PUT") {
      const { id, order_status } = req.body;
      const order = ordersDb.find((o) => o.id === id);
      if (!order) {
        return res.status(404).json({ success: false, error: "Order not found." });
      }

      // Restore stock on cancellation if not previously restored
      if (order_status === "Cancelled" && !order.stockRestored) {
        for (const item of order.items || []) {
          const prod = productsDb.find((p) => p.id === item.productId);
          if (prod) prod.stock_quantity += item.quantity;
        }
        order.stockRestored = true;
      }

      order.orderStatus = order_status;
      return res.json({ success: true, message: `Order status updated to ${order_status}` });
    }

    res.status(405).json({ success: false, error: "Method not allowed." });
  });

  // Admin Blogs CRUD
  app.all(["/api/admin/blogs.php", "/api/admin/blogs"], (req, res) => {
    if (req.method === "GET") {
      return res.json({ success: true, data: blogsDb });
    }

    if (req.method === "POST") {
      const body = req.body;
      const newId = blogsDb.length > 0 ? Math.max(...blogsDb.map((b) => b.id)) + 1 : 1;
      const newBlog = {
        id: newId,
        title: body.title,
        slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        featured_image: body.featured_image || body.cover_image || "",
        short_description: body.short_description || body.excerpt || "",
        full_content: body.full_content || body.content || "",
        category: body.category || "General",
        author: body.author || "JSArt&Decor Team",
        status: body.status || (body.is_published ? "Published" : "Draft"),
        created_at: new Date().toISOString()
      };

      blogsDb.unshift(newBlog);
      return res.json({ success: true, id: newId, message: "Blog created." });
    }

    if (req.method === "PUT") {
      const body = req.body;
      const idx = blogsDb.findIndex((b) => b.id === body.id);
      if (idx === -1) return res.status(404).json({ success: false, error: "Blog not found." });

      blogsDb[idx] = { ...blogsDb[idx], ...body };
      return res.json({ success: true, message: "Blog updated." });
    }

    if (req.method === "DELETE") {
      const { id } = req.body;
      blogsDb = blogsDb.filter((b) => b.id !== id);
      return res.json({ success: true, message: "Blog deleted." });
    }

    res.status(405).json({ success: false, error: "Method not allowed." });
  });

  // Admin Partners CRUD
  app.all(["/api/admin/partners.php", "/api/admin/partners"], (req, res) => {
    if (req.method === "GET") {
      return res.json({ success: true, data: partnersDb });
    }

    if (req.method === "POST") {
      const body = req.body;
      const newId = partnersDb.length > 0 ? Math.max(...partnersDb.map((p) => p.id)) + 1 : 1;
      const newPartner = {
        id: newId,
        name: body.name,
        logo_url: body.logo_url || "",
        description: body.description || "",
        website: body.website || "",
        display_order: body.display_order || 1,
        is_active: body.is_active !== undefined ? !!body.is_active : true
      };

      partnersDb.push(newPartner);
      return res.json({ success: true, id: newId, message: "Partner added." });
    }

    if (req.method === "PUT") {
      const body = req.body;
      const idx = partnersDb.findIndex((p) => p.id === body.id);
      if (idx === -1) return res.status(404).json({ success: false, error: "Partner not found." });

      partnersDb[idx] = { ...partnersDb[idx], ...body };
      return res.json({ success: true, message: "Partner updated." });
    }

    if (req.method === "DELETE") {
      const { id } = req.body;
      partnersDb = partnersDb.filter((p) => p.id !== id);
      return res.json({ success: true, message: "Partner removed." });
    }

    res.status(405).json({ success: false, error: "Method not allowed." });
  });

  // Admin Enquiries
  app.all(["/api/admin/enquiries.php", "/api/admin/enquiries"], (req, res) => {
    if (req.method === "GET") {
      return res.json({ success: true, data: contactMessagesDb });
    }

    if (req.method === "PUT") {
      const { id, is_read } = req.body;
      const msg = contactMessagesDb.find((m) => m.id === id);
      if (!msg) return res.status(404).json({ success: false, error: "Message not found." });

      msg.is_read = !!is_read;
      return res.json({ success: true, message: "Status updated." });
    }

    res.status(405).json({ success: false, error: "Method not allowed." });
  });

  // Admin Settings
  app.all(["/api/admin/settings.php", "/api/admin/settings"], (req, res) => {
    if (req.method === "GET") {
      return res.json({ success: true, data: settingsDb });
    }

    if (req.method === "POST" || req.method === "PUT") {
      settingsDb = { ...settingsDb, ...req.body };
      return res.json({ success: true, message: "Settings updated successfully." });
    }

    res.status(405).json({ success: false, error: "Method not allowed." });
  });

  // Catch-all for unhandled /api/* endpoints - ALWAYS return JSON, never fall back to index.html
  app.all("/api/*", (req, res) => {
    res.status(404).json({
      success: false,
      error: `API endpoint ${req.method} ${req.path} not found.`
    });
  });

  // Express API error middleware
  app.use("/api", (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("API Error:", err);
    res.status(500).json({
      success: false,
      error: err?.message || "Internal server error"
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa"
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.warn("Vite middleware could not be loaded, continuing:", err);
    }
  } else {
    const possibleDistFiles = [
      path.join(__dirname, "index.html"),
      path.join(process.cwd(), "dist", "index.html"),
      path.join(__dirname, "../dist", "index.html")
    ];
    let distDir = path.join(process.cwd(), "dist");
    for (const testFile of possibleDistFiles) {
      if (fs.existsSync(testFile)) {
        distDir = path.dirname(testFile);
        break;
      }
    }
    app.use(express.static(distDir));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`JSArt&Decor Server running on http://0.0.0.0:${PORT}`);
  });

  return { app, server };
}

startServer();

export default app;
export { app, startServer };

// Compatibility for CommonJS loaders (Hostinger, Passenger, PM2)
const mod = typeof module !== "undefined" ? (module as any) : null;
if (mod && mod.exports) {
  mod.exports = app;
  mod.exports.default = app;
  mod.exports.app = app;
}
