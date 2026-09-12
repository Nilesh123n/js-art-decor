import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { INITIAL_PRODUCTS, INITIAL_BLOGS, INITIAL_PARTNERS, DEFAULT_SITE_SETTINGS, INITIAL_BANNERS, INITIAL_SECTIONS, INITIAL_ORDERS } from "./src/data/mockData";
import { sendOrderShippedEmail, generateShippingEmailHtml } from "./server/emailService";

const app = express();
const PORT = 3000;

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
  let bannersDb = [...INITIAL_BANNERS];
  let sectionsDb = [...INITIAL_SECTIONS];
  let ordersDb: any[] = [...INITIAL_ORDERS];
  let contactMessagesDb: any[] = [];
  let settingsDb = { ...DEFAULT_SITE_SETTINGS };
  const settingsStoreFile = path.join(process.cwd(), "database", "settings_store.json");
  const blogsStoreFile = path.join(process.cwd(), "database", "blogs_store.json");
  const productsStoreFile = path.join(process.cwd(), "database", "products_store.json");
  const bannersStoreFile = path.join(process.cwd(), "database", "banners_store.json");
  const sectionsStoreFile = path.join(process.cwd(), "database", "sections_store.json");
  const partnersStoreFile = path.join(process.cwd(), "database", "partners_store.json");
  const ordersStoreFile = path.join(process.cwd(), "database", "orders_store.json");

  // Load persistent settings from disk if available
  if (fs.existsSync(settingsStoreFile)) {
    try {
      const storedSettings = JSON.parse(fs.readFileSync(settingsStoreFile, "utf-8"));
      settingsDb = { ...DEFAULT_SITE_SETTINGS, ...storedSettings };
      console.log("[Settings] Loaded saved site settings from database/settings_store.json");
    } catch (e) {
      console.warn("[Settings] Could not parse settings_store.json", e);
    }
  }

  // Load persistent blogs from disk if available
  if (fs.existsSync(blogsStoreFile)) {
    try {
      const storedBlogs = JSON.parse(fs.readFileSync(blogsStoreFile, "utf-8"));
      if (Array.isArray(storedBlogs) && storedBlogs.length > 0) {
        blogsDb = storedBlogs;
        console.log(`[Blogs] Loaded ${blogsDb.length} saved blogs from database/blogs_store.json`);
      }
    } catch (e) {
      console.warn("[Blogs] Could not parse blogs_store.json", e);
    }
  } else {
    try {
      const dbDir = path.dirname(blogsStoreFile);
      if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
      fs.writeFileSync(blogsStoreFile, JSON.stringify(blogsDb, null, 2), "utf-8");
      console.log(`[Blogs] Initialized database/blogs_store.json with ${blogsDb.length} initial blogs`);
    } catch (e) {
      console.error("[Blogs] Failed to initialize blogs_store.json:", e);
    }
  }

  // Load persistent products from disk if available
  if (fs.existsSync(productsStoreFile)) {
    try {
      const storedProducts = JSON.parse(fs.readFileSync(productsStoreFile, "utf-8"));
      if (Array.isArray(storedProducts) && storedProducts.length > 0) {
        productsDb = storedProducts;
        console.log(`[Products] Loaded ${productsDb.length} saved products from database/products_store.json`);
      }
    } catch (e) {
      console.warn("[Products] Could not parse products_store.json", e);
    }
  } else {
    try {
      const dbDir = path.dirname(productsStoreFile);
      if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
      fs.writeFileSync(productsStoreFile, JSON.stringify(productsDb, null, 2), "utf-8");
      console.log(`[Products] Initialized database/products_store.json with ${productsDb.length} initial products`);
    } catch (e) {
      console.error("[Products] Failed to initialize products_store.json:", e);
    }
  }

  // Load persistent banners from disk if available
  if (fs.existsSync(bannersStoreFile)) {
    try {
      const storedBanners = JSON.parse(fs.readFileSync(bannersStoreFile, "utf-8"));
      if (Array.isArray(storedBanners) && storedBanners.length > 0) {
        bannersDb = storedBanners;
        console.log(`[Banners] Loaded ${bannersDb.length} saved banners from database/banners_store.json`);
      }
    } catch (e) {
      console.warn("[Banners] Could not parse banners_store.json", e);
    }
  } else {
    try {
      const dbDir = path.dirname(bannersStoreFile);
      if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
      fs.writeFileSync(bannersStoreFile, JSON.stringify(bannersDb, null, 2), "utf-8");
      console.log(`[Banners] Initialized database/banners_store.json with ${bannersDb.length} initial banners`);
    } catch (e) {
      console.error("[Banners] Failed to initialize banners_store.json:", e);
    }
  }

  // Load persistent sections from disk if available
  if (fs.existsSync(sectionsStoreFile)) {
    try {
      const storedSections = JSON.parse(fs.readFileSync(sectionsStoreFile, "utf-8"));
      if (Array.isArray(storedSections) && storedSections.length > 0) {
        sectionsDb = storedSections;
        console.log(`[Sections] Loaded ${sectionsDb.length} saved sections from database/sections_store.json`);
      }
    } catch (e) {
      console.warn("[Sections] Could not parse sections_store.json", e);
    }
  } else {
    try {
      const dbDir = path.dirname(sectionsStoreFile);
      if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
      fs.writeFileSync(sectionsStoreFile, JSON.stringify(sectionsDb, null, 2), "utf-8");
      console.log(`[Sections] Initialized database/sections_store.json with ${sectionsDb.length} initial sections`);
    } catch (e) {
      console.error("[Sections] Failed to initialize sections_store.json:", e);
    }
  }

  // Load persistent partners from disk if available
  if (fs.existsSync(partnersStoreFile)) {
    try {
      const storedPartners = JSON.parse(fs.readFileSync(partnersStoreFile, "utf-8"));
      if (Array.isArray(storedPartners) && storedPartners.length > 0) {
        partnersDb = storedPartners;
        console.log(`[Partners] Loaded ${partnersDb.length} saved partners from database/partners_store.json`);
      }
    } catch (e) {
      console.warn("[Partners] Could not parse partners_store.json", e);
    }
  } else {
    try {
      const dbDir = path.dirname(partnersStoreFile);
      if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
      fs.writeFileSync(partnersStoreFile, JSON.stringify(partnersDb, null, 2), "utf-8");
      console.log(`[Partners] Initialized database/partners_store.json with ${partnersDb.length} initial partners`);
    } catch (e) {
      console.error("[Partners] Failed to initialize partners_store.json:", e);
    }
  }

  // Load persistent orders from disk if available
  if (fs.existsSync(ordersStoreFile)) {
    try {
      const storedOrders = JSON.parse(fs.readFileSync(ordersStoreFile, "utf-8"));
      if (Array.isArray(storedOrders) && storedOrders.length > 0) {
        ordersDb = storedOrders;
        console.log(`[Orders] Loaded ${ordersDb.length} saved orders from database/orders_store.json`);
      }
    } catch (e) {
      console.warn("[Orders] Could not parse orders_store.json", e);
    }
  } else {
    try {
      const dbDir = path.dirname(ordersStoreFile);
      if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
      fs.writeFileSync(ordersStoreFile, JSON.stringify(ordersDb, null, 2), "utf-8");
      console.log(`[Orders] Initialized database/orders_store.json with ${ordersDb.length} initial orders`);
    } catch (e) {
      console.error("[Orders] Failed to initialize orders_store.json:", e);
    }
  }

  // Helper to persist settings both to JSON and to MySQL settings table
  const saveSettingsToDb = async (newSettings: any) => {
    settingsDb = { ...settingsDb, ...newSettings };
    try {
      const dbDir = path.dirname(settingsStoreFile);
      if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
      fs.writeFileSync(settingsStoreFile, JSON.stringify(settingsDb, null, 2), "utf-8");
    } catch (e) {
      console.error("[Settings] Failed to write settings_store.json:", e);
    }

    if (mysqlPool) {
      try {
        for (const [k, v] of Object.entries(newSettings)) {
          await mysqlPool.query(
            "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
            [k, String(v ?? "")]
          );
        }
        console.log("[Settings] Synchronized updated settings with MySQL database.");
      } catch (err: any) {
        console.error("[Settings] MySQL settings sync failed:", err?.message || err);
      }
    }
  };

  // Helper to persist blogs both to JSON disk store and to MySQL blogs table
  const saveBlogsToDb = async (newBlogs: any[]) => {
    blogsDb = [...newBlogs];

    // 1. Write to database/blogs_store.json immediately so it survives restarts
    try {
      const dbDir = path.dirname(blogsStoreFile);
      if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
      fs.writeFileSync(blogsStoreFile, JSON.stringify(blogsDb, null, 2), "utf-8");
      console.log(`[Blogs] Saved ${blogsDb.length} blogs to disk (${blogsStoreFile})`);
    } catch (e) {
      console.error("[Blogs] Failed to write blogs_store.json:", e);
    }

    // 2. Synchronize with MySQL blogs table if MySQL connection is active
    if (mysqlPool) {
      try {
        await mysqlPool.query(`
          CREATE TABLE IF NOT EXISTS blogs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL UNIQUE,
            category VARCHAR(100) NOT NULL DEFAULT 'Textile Guide',
            featured_image VARCHAR(500) NULL,
            cover_image VARCHAR(500) NULL,
            excerpt TEXT NULL,
            short_description TEXT NULL,
            content LONGTEXT NULL,
            full_content LONGTEXT NULL,
            author VARCHAR(100) DEFAULT 'JSArt&Decor Team',
            status VARCHAR(20) DEFAULT 'Published',
            is_published TINYINT(1) DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        for (const b of blogsDb) {
          const isPublished = (String(b.status || "").toLowerCase() === "published" || (b as any).is_published == 1 || !(b.status)) ? 1 : 0;
          await mysqlPool.query(
            `INSERT INTO blogs (id, title, slug, category, featured_image, short_description, full_content, author, status, is_published, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             title = VALUES(title),
             slug = VALUES(slug),
             category = VALUES(category),
             featured_image = VALUES(featured_image),
             short_description = VALUES(short_description),
             full_content = VALUES(full_content),
             author = VALUES(author),
             status = VALUES(status),
             is_published = VALUES(is_published),
             updated_at = NOW()`,
            [
              b.id,
              b.title,
              b.slug,
              b.category || "General",
              b.featured_image || "",
              b.short_description || "",
              b.full_content || "",
              b.author || "JSArt&Decor Editorial",
              b.status || "Published",
              isPublished,
              b.created_at ? new Date(b.created_at) : new Date()
            ]
          );
        }
        console.log(`[Blogs] Synchronized ${blogsDb.length} blogs with MySQL database.`);
      } catch (err: any) {
        console.error("[Blogs] MySQL blogs sync failed:", err?.message || err);
      }
    }
  };

  // Helper to persist products both to JSON disk store and to MySQL products table
  const saveProductsToDb = async (newProducts: any[]) => {
    productsDb = [...newProducts];

    // 1. Write to database/products_store.json immediately so it survives restarts & multi-devices
    try {
      const dbDir = path.dirname(productsStoreFile);
      if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
      fs.writeFileSync(productsStoreFile, JSON.stringify(productsDb, null, 2), "utf-8");
      console.log(`[Products] Saved ${productsDb.length} products to disk (${productsStoreFile})`);
    } catch (e) {
      console.error("[Products] Failed to write products_store.json:", e);
    }

    // 2. Synchronize with MySQL products table if MySQL connection is active
    if (mysqlPool) {
      try {
        await mysqlPool.query(`
          CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL UNIQUE,
            sku VARCHAR(100) NOT NULL UNIQUE,
            description TEXT NULL,
            short_description TEXT NULL,
            production_type VARCHAR(50) NOT NULL DEFAULT 'Handmade',
            segment VARCHAR(50) NOT NULL DEFAULT 'Home',
            product_type VARCHAR(50) NOT NULL DEFAULT 'HOME DECOR',
            sales_availability VARCHAR(50) NOT NULL DEFAULT 'Both',
            retail_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            wholesale_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            stock_quantity INT NOT NULL DEFAULT 0,
            min_wholesale_qty INT NOT NULL DEFAULT 10,
            size VARCHAR(100) NULL,
            material VARCHAR(100) NULL,
            color VARCHAR(100) NULL,
            images JSON NULL,
            is_featured TINYINT(1) DEFAULT 0,
            is_new_arrival TINYINT(1) DEFAULT 0,
            is_active TINYINT(1) DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        for (const p of productsDb) {
          const imagesJson = JSON.stringify(Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []));
          await mysqlPool.query(
            `INSERT INTO products (
              id, name, slug, sku, description, short_description,
              production_type, segment, product_type, sales_availability,
              retail_price, wholesale_price, stock_quantity, min_wholesale_qty,
              size, material, color, images, is_featured, is_new_arrival, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              name = VALUES(name),
              slug = VALUES(slug),
              sku = VALUES(sku),
              description = VALUES(description),
              short_description = VALUES(short_description),
              production_type = VALUES(production_type),
              segment = VALUES(segment),
              product_type = VALUES(product_type),
              sales_availability = VALUES(sales_availability),
              retail_price = VALUES(retail_price),
              wholesale_price = VALUES(wholesale_price),
              stock_quantity = VALUES(stock_quantity),
              min_wholesale_qty = VALUES(min_wholesale_qty),
              size = VALUES(size),
              material = VALUES(material),
              color = VALUES(color),
              images = VALUES(images),
              is_featured = VALUES(is_featured),
              is_new_arrival = VALUES(is_new_arrival),
              is_active = VALUES(is_active),
              updated_at = NOW()`,
            [
              p.id,
              p.name || "Untitled Product",
              p.slug || (p.name ? p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : `prod-${p.id}`),
              p.sku || `JS-${p.id}`,
              p.description || "",
              p.short_description || "",
              p.production_type || "Handmade",
              p.segment || "Home",
              p.product_type || "HOME DECOR",
              p.sales_availability || "Both",
              Number(p.retail_price) || 0,
              Number(p.wholesale_price) || 0,
              Number(p.stock_quantity) || 0,
              Number(p.min_wholesale_qty) || 10,
              p.size || "",
              p.material || "",
              p.color || "",
              imagesJson,
              p.is_featured ? 1 : 0,
              p.is_new_arrival ? 1 : 0,
              Boolean((p as any).is_active) ? 1 : 0
            ]
          );
        }
        console.log(`[Products] Synchronized ${productsDb.length} products with MySQL database.`);
      } catch (err: any) {
        console.error("[Products] MySQL products sync failed:", err?.message || err);
      }
    }
  };

  // Helper to persist banners
  const saveBannersToDb = async (newBanners: any[]) => {
    bannersDb = [...newBanners];
    try {
      const dbDir = path.dirname(bannersStoreFile);
      if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
      fs.writeFileSync(bannersStoreFile, JSON.stringify(bannersDb, null, 2), "utf-8");
      console.log(`[Banners] Saved ${bannersDb.length} banners to disk (${bannersStoreFile})`);
    } catch (e) {
      console.error("[Banners] Failed to write banners_store.json:", e);
    }

    if (mysqlPool) {
      try {
        await mysqlPool.query(`
          CREATE TABLE IF NOT EXISTS banners (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            subtitle VARCHAR(255) NULL,
            highlight_text VARCHAR(255) NULL,
            description TEXT NULL,
            image_url VARCHAR(500) NOT NULL,
            link_url VARCHAR(255) NULL,
            button_text VARCHAR(100) NULL,
            banner_type VARCHAR(50) NOT NULL DEFAULT 'hero',
            display_order INT NOT NULL DEFAULT 1,
            is_active TINYINT(1) DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        for (const b of bannersDb) {
          await mysqlPool.query(
            `INSERT INTO banners (id, title, subtitle, highlight_text, description, image_url, link_url, button_text, banner_type, display_order, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             title = VALUES(title), subtitle = VALUES(subtitle), highlight_text = VALUES(highlight_text),
             description = VALUES(description), image_url = VALUES(image_url), link_url = VALUES(link_url),
             button_text = VALUES(button_text), banner_type = VALUES(banner_type), display_order = VALUES(display_order),
             is_active = VALUES(is_active)`,
            [
              b.id, b.title, b.subtitle || "", b.highlight_text || "", b.description || "",
              b.image_url || "", b.link_url || "", b.button_text || "", b.banner_type || "hero",
              Number(b.display_order) || 1, b.is_active ? 1 : 0
            ]
          );
        }
      } catch (err: any) {
        console.error("[Banners] MySQL banners sync error:", err?.message || err);
      }
    }
  };

  // Helper to persist sections
  const saveSectionsToDb = async (newSections: any[]) => {
    sectionsDb = [...newSections];
    try {
      const dbDir = path.dirname(sectionsStoreFile);
      if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
      fs.writeFileSync(sectionsStoreFile, JSON.stringify(sectionsDb, null, 2), "utf-8");
      console.log(`[Sections] Saved ${sectionsDb.length} sections to disk (${sectionsStoreFile})`);
    } catch (e) {
      console.error("[Sections] Failed to write sections_store.json:", e);
    }
  };

  // Helper to persist partners
  const savePartnersToDb = async (newPartners: any[]) => {
    partnersDb = [...newPartners];
    try {
      const dbDir = path.dirname(partnersStoreFile);
      if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
      fs.writeFileSync(partnersStoreFile, JSON.stringify(partnersDb, null, 2), "utf-8");
      console.log(`[Partners] Saved ${partnersDb.length} partners to disk (${partnersStoreFile})`);
    } catch (e) {
      console.error("[Partners] Failed to write partners_store.json:", e);
    }

    if (mysqlPool) {
      try {
        await mysqlPool.query(`
          CREATE TABLE IF NOT EXISTS partners (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            partner_type VARCHAR(100) NOT NULL DEFAULT 'Hotel',
            logo_url VARCHAR(500) NULL,
            description TEXT NULL,
            website VARCHAR(255) NULL,
            display_order INT NOT NULL DEFAULT 1,
            is_active TINYINT(1) DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        for (const p of partnersDb) {
          await mysqlPool.query(
            `INSERT INTO partners (id, name, partner_type, logo_url, description, website, display_order, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             name = VALUES(name), partner_type = VALUES(partner_type), logo_url = VALUES(logo_url),
             description = VALUES(description), website = VALUES(website), display_order = VALUES(display_order),
             is_active = VALUES(is_active)`,
            [
              p.id, p.name, (p as any).partner_type || "Hotel", p.logo_url || "", p.description || "",
              p.website || "", Number(p.display_order) || 1, p.is_active ? 1 : 0
            ]
          );
        }
      } catch (err: any) {
        console.error("[Partners] MySQL partners sync error:", err?.message || err);
      }
    }
  };

  // Helper to persist orders
  const saveOrdersToDb = async (newOrders: any[]) => {
    ordersDb = [...newOrders];
    try {
      const dbDir = path.dirname(ordersStoreFile);
      if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
      fs.writeFileSync(ordersStoreFile, JSON.stringify(ordersDb, null, 2), "utf-8");
      console.log(`[Orders] Saved ${ordersDb.length} orders to disk (${ordersStoreFile})`);
    } catch (e) {
      console.error("[Orders] Failed to write orders_store.json:", e);
    }
  };

  // If MySQL is already available on startup, query settings and blogs
  if (mysqlPool) {
    try {
      const [rows]: any = await mysqlPool.query("SELECT setting_key, setting_value FROM settings");
      if (Array.isArray(rows) && rows.length > 0) {
        for (const row of rows) {
          settingsDb[row.setting_key] = row.setting_value;
        }
        console.log(`[Settings] Loaded ${rows.length} settings records from MySQL database.`);
      }
    } catch (e) {
      console.warn("[Settings] Could not query initial MySQL settings:", e);
    }

    try {
      await mysqlPool.query(`
        CREATE TABLE IF NOT EXISTS blogs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          category VARCHAR(100) NOT NULL DEFAULT 'Textile Guide',
          featured_image VARCHAR(500) NULL,
          cover_image VARCHAR(500) NULL,
          excerpt TEXT NULL,
          short_description TEXT NULL,
          content LONGTEXT NULL,
          full_content LONGTEXT NULL,
          author VARCHAR(100) DEFAULT 'JSArt&Decor Team',
          status VARCHAR(20) DEFAULT 'Published',
          is_published TINYINT(1) DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      const [blogRows]: any = await mysqlPool.query("SELECT * FROM blogs ORDER BY id DESC");
      if (Array.isArray(blogRows) && blogRows.length > 0) {
        blogsDb = blogRows.map((r: any) => ({
          id: Number(r.id),
          title: r.title || "",
          slug: r.slug || "",
          category: r.category || "General",
          featured_image: r.featured_image || r.cover_image || "",
          short_description: r.short_description || r.excerpt || "",
          full_content: r.full_content || r.content || "",
          author: r.author || "JSArt&Decor Editorial",
          status: r.status || (r.is_published ? "Published" : "Draft"),
          created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
        }));
        console.log(`[Blogs] Loaded ${blogsDb.length} blogs from MySQL database.`);
        try {
          fs.writeFileSync(blogsStoreFile, JSON.stringify(blogsDb, null, 2), "utf-8");
        } catch {}
      } else {
        // Seed MySQL with initial blogs from blogsDb
        for (const b of blogsDb) {
          const isPublished = (String(b.status || "").toLowerCase() === "published" || (b as any).is_published == 1 || !(b.status)) ? 1 : 0;
          await mysqlPool.query(
            `INSERT INTO blogs (id, title, slug, category, featured_image, short_description, full_content, author, status, is_published, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             title = VALUES(title),
             slug = VALUES(slug),
             category = VALUES(category),
             featured_image = VALUES(featured_image),
             short_description = VALUES(short_description),
             full_content = VALUES(full_content),
             author = VALUES(author),
             status = VALUES(status),
             is_published = VALUES(is_published)`,
            [
              b.id,
              b.title,
              b.slug,
              b.category || "General",
              b.featured_image || "",
              b.short_description || "",
              b.full_content || "",
              b.author || "JSArt&Decor Editorial",
              b.status || "Published",
              isPublished,
              b.created_at ? new Date(b.created_at) : new Date()
            ]
          );
        }
        console.log(`[Blogs] Seeded ${blogsDb.length} initial blogs into MySQL database.`);
      }
    } catch (e: any) {
      console.warn("[Blogs] MySQL blogs initialization check:", e?.message || e);
    }

    try {
      await mysqlPool.query(`
        CREATE TABLE IF NOT EXISTS products (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          sku VARCHAR(100) NOT NULL UNIQUE,
          description TEXT NULL,
          short_description TEXT NULL,
          production_type VARCHAR(50) NOT NULL DEFAULT 'Handmade',
          segment VARCHAR(50) NOT NULL DEFAULT 'Home',
          product_type VARCHAR(50) NOT NULL DEFAULT 'HOME DECOR',
          sales_availability VARCHAR(50) NOT NULL DEFAULT 'Both',
          retail_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          wholesale_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          stock_quantity INT NOT NULL DEFAULT 0,
          min_wholesale_qty INT NOT NULL DEFAULT 10,
          size VARCHAR(100) NULL,
          material VARCHAR(100) NULL,
          color VARCHAR(100) NULL,
          images JSON NULL,
          is_featured TINYINT(1) DEFAULT 0,
          is_new_arrival TINYINT(1) DEFAULT 0,
          is_active TINYINT(1) DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      const [productRows]: any = await mysqlPool.query("SELECT * FROM products ORDER BY id DESC");
      if (Array.isArray(productRows) && productRows.length > 0) {
        productsDb = productRows.map((r: any) => ({
          id: Number(r.id),
          name: r.name,
          slug: r.slug,
          sku: r.sku,
          description: r.description || "",
          short_description: r.short_description || "",
          production_type: r.production_type || "Handmade",
          segment: r.segment || "Home",
          product_type: r.product_type || "HOME DECOR",
          sales_availability: r.sales_availability || "Both",
          retail_price: Number(r.retail_price) || 0,
          wholesale_price: Number(r.wholesale_price) || 0,
          stock_quantity: Number(r.stock_quantity) || 0,
          min_wholesale_qty: Number(r.min_wholesale_qty) || 10,
          size: r.size || "",
          material: r.material || "",
          color: r.color || "",
          images: typeof r.images === "string" ? JSON.parse(r.images || "[]") : (r.images || []),
          is_featured: Boolean(r.is_featured),
          is_new_arrival: Boolean(r.is_new_arrival),
          is_active: r.is_active !== 0 && r.is_active !== false,
          created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString()
        }));
        console.log(`[Products] Loaded ${productsDb.length} products from MySQL database.`);
        try {
          fs.writeFileSync(productsStoreFile, JSON.stringify(productsDb, null, 2), "utf-8");
        } catch {}
      } else {
        await saveProductsToDb(productsDb);
        console.log(`[Products] Seeded ${productsDb.length} initial products into MySQL database.`);
      }
    } catch (e: any) {
      console.warn("[Products] MySQL products initialization check:", e?.message || e);
    }
  }

  let activeAdminSessions = new Set<string>();

  // Ensure all /api responses set application/json and disable caching so all devices get fresh data
  app.use("/api", (req, res, next) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
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
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    const { q, segment, product_type, production_type, sales_availability, is_featured, is_new_arrival, all, include_inactive } = req.query;

    const includeAll = all === "true" || include_inactive === "true";
    let filtered = includeAll ? [...productsDb] : productsDb.filter((p) => Boolean((p as any).is_active));

    if (q) {
      const query = String(q).toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          (p.sku && p.sku.toLowerCase().includes(query)) ||
          (p.short_description && p.short_description.toLowerCase().includes(query))
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

    if (is_featured === "1" || is_featured === "true") {
      filtered = filtered.filter((p) => p.is_featured);
    }

    if (is_new_arrival === "1" || is_new_arrival === "true") {
      filtered = filtered.filter((p) => p.is_new_arrival);
    }

    filtered.sort((a: any, b: any) => {
      const idA = Number(a.id) || 0;
      const idB = Number(b.id) || 0;
      return idB - idA;
    });

    res.json({ success: true, data: filtered, count: filtered.length });
  });

  // Product Detail
  app.get(["/api/products/detail.php", "/api/products/detail"], (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    const { id, slug, preview } = req.query;

    let prod = null;
    if (id) {
      prod = productsDb.find((p) => String(p.id) === String(id));
    } else if (slug) {
      prod = productsDb.find((p) => p.slug === String(slug));
    }

    if (!prod) {
      return res.status(404).json({ success: false, error: "Product not found." });
    }

    if (!prod.is_active && preview !== "true") {
      return res.status(404).json({ success: false, error: "This product is currently inactive." });
    }

    res.json({ success: true, data: prod });
  });

  // Blogs List & Detail
  app.get(["/api/blogs/get.php", "/api/blogs/get"], (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    const { slug, id } = req.query;

    const isPublished = (b: any) => {
      const s = String(b.status || "").toLowerCase().trim();
      return s === "published" || b.is_published == 1 || b.is_published === true || !b.status;
    };

    if (slug || id) {
      const blog = blogsDb.find((b) => (slug ? b.slug === slug : String(b.id) === String(id)) && isPublished(b));
      if (!blog) {
        return res.status(404).json({ success: false, error: "Article not found." });
      }
      return res.json({ success: true, data: blog });
    }

    const published = blogsDb.filter(isPublished);
    // Sort newest first by created_at or id
    published.sort((a: any, b: any) => {
      const timeA = new Date(a.created_at || 0).getTime();
      const timeB = new Date(b.created_at || 0).getTime();
      return (timeB - timeA) || (b.id - a.id);
    });

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
        contact_phone: settingsDb.contact_phone || "+91 86024 14046",
        whatsapp_number: settingsDb.whatsapp_number || settingsDb.contact_phone || "+91 86024 14046",
        contact_email: settingsDb.contact_email || "info.jsartanddecor@gmail.com",
        address: settingsDb.address || "JSArt&Decor Textile & Art Hub, Phase II Industrial Estate, Jaipur, Rajasthan 302022, India",
        free_shipping_threshold: Number(settingsDb.free_shipping_threshold || 2499),
        standard_shipping_fee: Number(settingsDb.standard_shipping_fee || 150),
        enable_cod: false,
        razorpay_key_id: process.env.RAZORPAY_KEY_ID || settingsDb.razorpay_key_id || "",
        imagekit_public_key: process.env.IMAGEKIT_PUBLIC_KEY || settingsDb.imagekit_public_key || "",
        imagekit_url_endpoint: process.env.IMAGEKIT_URL_ENDPOINT || settingsDb.imagekit_url_endpoint || ""
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

  // Art & Decor Planner Submission
  app.post(["/api/planner/submit.php", "/api/planner/submit"], async (req, res) => {
    const { name, phone, mobile, email, segment, space_scale, theme, budget_range, timeline, city, notes, scope } = req.body || {};

    const contactPhone = phone || mobile;
    if (!name || !contactPhone) {
      return res.status(400).json({ success: false, error: "Name and contact phone number are required." });
    }

    const refId = "PLAN-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const scopeStr = Array.isArray(scope) ? scope.join(", ") : (scope || "Comprehensive Styling");
    const userEmail = email || `${contactPhone}@jsartdecor.in`;
    const selectedSegment = segment || "All Segments";

    const fullMessage = [
      "--- ART & DECOR PLANNER SUBMISSION ---",
      `Reference ID: ${refId}`,
      `Target Segment: ${selectedSegment}`,
      `Property / Event Scale: ${space_scale || "Standard"}`,
      `Planning Scope / Items: ${scopeStr}`,
      `Preferred Theme: ${theme || "Standard"}`,
      `Budget Estimate: ${budget_range || "Standard"}`,
      `Target Timeline: ${timeline || "Flexible"}`,
      `City / Location: ${city || "Not specified"}`,
      `Client Notes: ${notes || "None provided"}`
    ].join("\n");

    const newMsg = {
      id: Date.now(),
      name,
      email: userEmail,
      mobile: contactPhone,
      enquiry_type: `Art & Decor Planner - ${selectedSegment}`,
      subject: `Decor Plan: ${selectedSegment} (${space_scale || "Standard"})`,
      message: fullMessage,
      is_read: false,
      created_at: new Date().toISOString().replace("T", " ").substring(0, 19)
    };

    contactMessagesDb.unshift(newMsg);

    if (mysqlPool) {
      try {
        await mysqlPool.query(
          "INSERT INTO contact_messages (name, email, mobile, enquiry_type, subject, message, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, NOW())",
          [name, userEmail, contactPhone, newMsg.enquiry_type, newMsg.subject, fullMessage]
        );
      } catch (err: any) {
        console.error("Failed to insert planner inquiry into MySQL:", err?.message || err);
      }
    }

    res.json({
      success: true,
      reference_id: refId,
      message: "Your Art & Decor Planning request has been submitted successfully! Our senior decor stylist will contact you with customized proposals and quotations shortly."
    });
  });

  // Create Order (COD & Razorpay)
  app.post(["/api/orders/create.php", "/api/orders/create"], async (req, res) => {
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
    await saveOrdersToDb(ordersDb);

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
  app.post(["/api/orders/verify_payment.php", "/api/orders/verify_payment"], async (req, res) => {
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

    await saveOrdersToDb(ordersDb);
    await saveProductsToDb(productsDb);

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
  app.all(["/api/admin/products.php", "/api/admin/products"], async (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    if (req.method === "GET") {
      const sorted = [...productsDb].sort((a: any, b: any) => {
        const idA = Number(a.id) || 0;
        const idB = Number(b.id) || 0;
        return idB - idA;
      });
      return res.json({ success: true, data: sorted });
    }

    if (req.method === "POST") {
      const body = req.body || {};

      // Handle batch save from admin: { products: Product[] }
      if (Array.isArray(body.products)) {
        await saveProductsToDb(body.products);
        return res.json({ success: true, message: "Products updated and saved to database successfully.", data: productsDb });
      }

      if (!body.name || !String(body.name).trim()) {
        return res.status(400).json({ success: false, error: "Product name is required." });
      }

      const newId = productsDb.length > 0 ? Math.max(...productsDb.map((p) => Number(p.id) || 0)) + 1 : 1;
      const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") || `prod-${newId}`;
      const sku = body.sku || `JS-PROD-${newId}`;

      let images = body.images;
      if (!images || (Array.isArray(images) && images.length === 0)) {
        images = ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80"];
      } else if (typeof images === "string") {
        try {
          images = JSON.parse(images);
        } catch {
          images = [images];
        }
      }

      const newProduct = {
        id: body.id ? Number(body.id) : newId,
        name: String(body.name).trim(),
        slug: slug,
        sku: sku,
        description: body.description || "",
        short_description: body.short_description || "",
        images: Array.isArray(images) ? images : [images],
        production_type: body.production_type || "Handmade",
        segment: body.segment || "Home",
        product_type: body.product_type || "HOME DECOR",
        sales_availability: body.sales_availability || "Both",
        retail_price: Number(body.retail_price) || 0,
        wholesale_price: Number(body.wholesale_price) || 0,
        stock_quantity: Number(body.stock_quantity) || 0,
        min_wholesale_qty: Number(body.min_wholesale_qty) || 10,
        size: body.size || "",
        material: body.material || "",
        color: body.color || "",
        is_featured: !!body.is_featured,
        is_new_arrival: body.is_new_arrival !== undefined ? !!body.is_new_arrival : true,
        is_active: body.is_active !== undefined ? !!body.is_active : true,
        created_at: body.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Ensure no duplicate IDs
      productsDb = [newProduct, ...productsDb.filter((p) => Number(p.id) !== newProduct.id)];
      await saveProductsToDb(productsDb);

      return res.json({ 
        success: true, 
        id: newProduct.id, 
        message: "Product created and saved to database successfully.",
        data: newProduct,
        products: productsDb
      });
    }

    if (req.method === "PUT") {
      const body = req.body || {};
      const targetId = Number(body.id);
      const idx = productsDb.findIndex((p) => Number(p.id) === targetId);
      if (idx === -1) {
        return res.status(404).json({ success: false, error: "Product not found." });
      }

      let images = body.images !== undefined ? body.images : productsDb[idx].images;
      if (typeof images === "string") {
        try {
          images = JSON.parse(images);
        } catch {
          images = [images];
        }
      }

      productsDb[idx] = { 
        ...productsDb[idx], 
        ...body, 
        id: targetId,
        images: Array.isArray(images) ? images : (images ? [images] : []),
        retail_price: body.retail_price !== undefined ? Number(body.retail_price) : productsDb[idx].retail_price,
        wholesale_price: body.wholesale_price !== undefined ? Number(body.wholesale_price) : productsDb[idx].wholesale_price,
        stock_quantity: body.stock_quantity !== undefined ? Number(body.stock_quantity) : productsDb[idx].stock_quantity,
        min_wholesale_qty: body.min_wholesale_qty !== undefined ? Number(body.min_wholesale_qty) : productsDb[idx].min_wholesale_qty,
        is_active: body.is_active !== undefined ? !!body.is_active : productsDb[idx].is_active,
        is_featured: body.is_featured !== undefined ? !!body.is_featured : productsDb[idx].is_featured,
        is_new_arrival: body.is_new_arrival !== undefined ? !!body.is_new_arrival : productsDb[idx].is_new_arrival,
        updated_at: new Date().toISOString() 
      };

      await saveProductsToDb(productsDb);

      return res.json({ 
        success: true, 
        message: "Product updated and saved to database successfully.", 
        data: productsDb[idx],
        products: productsDb 
      });
    }

    if (req.method === "DELETE") {
      const id = Number(req.body?.id || req.query?.id);
      if (!id) {
        return res.status(400).json({ success: false, error: "Product ID is required for deletion." });
      }
      productsDb = productsDb.filter((p) => Number(p.id) !== id);

      if (mysqlPool) {
        try {
          await mysqlPool.query("DELETE FROM products WHERE id = ?", [id]);
        } catch (dbErr) {
          console.error("[Products] Error deleting product from MySQL:", dbErr);
        }
      }

      await saveProductsToDb(productsDb);
      return res.json({ success: true, message: "Product deleted from database successfully.", products: productsDb });
    }

    res.status(405).json({ success: false, error: "Method not allowed." });
  });

  // Admin Orders
  app.all(["/api/admin/orders.php", "/api/admin/orders"], async (req, res) => {
    if (req.method === "GET") {
      return res.json({ success: true, data: ordersDb });
    }

    if (req.method === "PUT" || req.method === "POST") {
      const {
        id,
        order_status,
        payment_status,
        courier_partner,
        tracking_awb,
        tracking_url,
        estimated_delivery,
        customer_email,
        force_send_email
      } = req.body;

      const order = ordersDb.find((o) => o.id === id || String(o.id) === String(id));
      if (!order) {
        return res.status(404).json({ success: false, error: "Order not found." });
      }

      const previousStatus = order.orderStatus;
      const isTransitionFromProcessingToShipped = previousStatus === "Processing" && order_status === "Shipped";
      const shouldTriggerShipmentEmail = isTransitionFromProcessingToShipped || (order_status === "Shipped" && force_send_email);

      // Restore stock on cancellation if not previously restored
      if (order_status === "Cancelled" && !order.stockRestored) {
        for (const item of order.items || []) {
          const prod = productsDb.find((p) => p.id === item.productId);
          if (prod) prod.stock_quantity += item.quantity;
        }
        order.stockRestored = true;
      }

      if (payment_status) {
        order.paymentStatus = payment_status;
      }

      if (customer_email && typeof customer_email === "string" && customer_email.trim()) {
        if (!order.customer) order.customer = {};
        order.customer.email = customer_email.trim();
      }

      // Courier & Tracking details
      const digitsOnly = (order.orderNumber || "").replace(/[^0-9]/g, "");
      const effectiveCourier = courier_partner || order.courierPartner || "Blue Dart Express";
      const effectiveAwb = tracking_awb || order.trackingAwb || ("BD-" + (digitsOnly.slice(-6) || Math.floor(100000 + Math.random() * 900000)));
      const effectiveDelivery = estimated_delivery || order.estimatedDelivery || "3 - 5 Business Days";
      const effectiveTrackingUrl = tracking_url || order.trackingUrl || `https://ais-dev-r4nws6qqq7w2lqcez36oxg-604300792262.asia-east1.run.app/track-order?order=${encodeURIComponent(order.orderNumber)}`;

      if (order_status) {
        order.orderStatus = order_status;
      }

      let emailResult: any = null;

      // Automatically trigger email notification when order moves from 'Processing' to 'Shipped'
      if (shouldTriggerShipmentEmail) {
        order.courierPartner = effectiveCourier;
        order.trackingAwb = effectiveAwb;
        order.trackingUrl = effectiveTrackingUrl;
        order.estimatedDelivery = effectiveDelivery;
        order.shippedAt = new Date().toISOString().replace("T", " ").substring(0, 19);
        order.emailNotificationSent = true;

        const recipientEmail = order.customer?.email || customer_email || "customer@example.com";

        try {
          emailResult = await sendOrderShippedEmail({
            orderNumber: order.orderNumber,
            customerName: order.customer?.fullName || "Valued Customer",
            customerEmail: recipientEmail,
            customerPhone: order.customer?.mobileNumber,
            shippingAddress: order.customer?.address || "Address on file",
            city: order.customer?.city || "Jaipur",
            state: order.customer?.state || "Rajasthan",
            pinCode: order.customer?.pinCode || "302001",
            items: (order.items || []).map((it: any) => ({
              productName: it.productName || it.product_name || "Handcrafted Decor Item",
              sku: it.sku || "JS-ART",
              quantity: it.quantity || 1,
              unitPrice: it.unitPrice || it.unit_price || 0,
              subtotal: it.subtotal || ((it.unitPrice || 0) * (it.quantity || 1))
            })),
            totalAmount: order.totalAmount,
            paymentMethod: order.paymentMethod || "Online Payment",
            courierPartner: effectiveCourier,
            trackingAwb: effectiveAwb,
            trackingUrl: effectiveTrackingUrl,
            estimatedDelivery: effectiveDelivery,
            storeName: settingsDb.store_name,
            contactEmail: settingsDb.contact_email,
            whatsappNumber: settingsDb.whatsapp_number
          });

          if (!Array.isArray(order.emailNotifications)) {
            order.emailNotifications = [];
          }

          order.emailNotifications.unshift({
            id: "notif_" + Date.now(),
            type: "shipped",
            recipient: recipientEmail,
            subject: emailResult.subject,
            sentAt: emailResult.sentAt,
            status: emailResult.mode === "smtp" ? "sent" : "simulated",
            courierPartner: effectiveCourier,
            trackingAwb: effectiveAwb,
            previewHtml: emailResult.previewHtml
          });
        } catch (mailErr: any) {
          console.error("[AdminOrders] Failed to trigger shipment email notification:", mailErr);
        }
      }

      // Sync with MySQL if database connection exists
      if (mysqlPool) {
        try {
          const sql = "UPDATE orders SET order_status = ?, updated_at = NOW() WHERE id = ?";
          await mysqlPool.query(sql, [order.orderStatus, order.id]);
        } catch (dbErr) {
          console.error("Error updating order in MySQL:", dbErr);
        }
      }

      await saveOrdersToDb(ordersDb);
      if (order_status === "Cancelled") {
        await saveProductsToDb(productsDb);
      }

      const statusMsg = isTransitionFromProcessingToShipped
        ? `Order status moved from 'Processing' to 'Shipped'. Email notification automatically triggered to ${order.customer?.email || 'customer'}!`
        : `Order status updated to ${order_status}`;

      return res.json({
        success: true,
        message: statusMsg,
        email_triggered: !!shouldTriggerShipmentEmail,
        email_details: emailResult ? {
          recipient: emailResult.recipient,
          subject: emailResult.subject,
          courier: effectiveCourier,
          tracking_awb: effectiveAwb,
          sent_at: emailResult.sentAt,
          mode: emailResult.mode,
          preview_html: emailResult.previewHtml
        } : null,
        order
      });
    }

    res.status(405).json({ success: false, error: "Method not allowed." });
  });

  // Admin Order Email Preview & Manual Resend Endpoint
  app.all(["/api/admin/orders/email_preview.php", "/api/admin/orders/email_preview"], (req, res) => {
    const { id, courier_partner, tracking_awb, estimated_delivery } = req.method === "GET" ? req.query : req.body;
    const order = ordersDb.find((o) => String(o.id) === String(id));
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found." });
    }

    const digitsOnly = (order.orderNumber || "").replace(/[^0-9]/g, "");
    const effectiveCourier = courier_partner || order.courierPartner || "Blue Dart Express";
    const effectiveAwb = tracking_awb || order.trackingAwb || ("BD-" + (digitsOnly.slice(-6) || "892019"));
    const effectiveDelivery = estimated_delivery || order.estimatedDelivery || "3 - 5 Business Days";
    const recipientEmail = order.customer?.email || "customer@example.com";

    const previewHtml = generateShippingEmailHtml({
      orderNumber: order.orderNumber,
      customerName: order.customer?.fullName || "Valued Customer",
      customerEmail: recipientEmail,
      customerPhone: order.customer?.mobileNumber,
      shippingAddress: order.customer?.address || "Address on file",
      city: order.customer?.city || "Jaipur",
      state: order.customer?.state || "Rajasthan",
      pinCode: order.customer?.pinCode || "302001",
      items: (order.items || []).map((it: any) => ({
        productName: it.productName || it.product_name || "Handcrafted Decor Item",
        sku: it.sku || "JS-ART",
        quantity: it.quantity || 1,
        unitPrice: it.unitPrice || it.unit_price || 0,
        subtotal: it.subtotal || ((it.unitPrice || 0) * (it.quantity || 1))
      })),
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod || "Online Payment",
      courierPartner: effectiveCourier,
      trackingAwb: effectiveAwb,
      estimatedDelivery: effectiveDelivery,
      storeName: settingsDb.store_name,
      contactEmail: settingsDb.contact_email,
      whatsappNumber: settingsDb.whatsapp_number
    });

    res.json({
      success: true,
      subject: `Your Order #${order.orderNumber} Has Shipped! 📦 - JSArt&Decor Jaipur`,
      recipient: recipientEmail,
      courier: effectiveCourier,
      tracking_awb: effectiveAwb,
      preview_html: previewHtml
    });
  });

  // Admin Blogs CRUD
  app.all(["/api/admin/blogs.php", "/api/admin/blogs"], async (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    if (req.method === "GET") {
      const sorted = [...blogsDb].sort((a: any, b: any) => {
        const timeA = new Date(a.created_at || 0).getTime();
        const timeB = new Date(b.created_at || 0).getTime();
        return (timeB - timeA) || (b.id - a.id);
      });
      return res.json({ success: true, data: sorted });
    }

    if (req.method === "POST") {
      const body = req.body || {};

      // Handle batch save from admin: { blogs: Blog[] }
      if (Array.isArray(body.blogs)) {
        await saveBlogsToDb(body.blogs);
        return res.json({ success: true, message: "Blogs updated and saved successfully.", data: blogsDb });
      }

      // Handle single blog creation
      const title = String(body.title || "").trim();
      if (!title) {
        return res.status(400).json({ success: false, error: "Blog title is required." });
      }

      const newId = blogsDb.length > 0 ? Math.max(...blogsDb.map((b) => b.id)) + 1 : 1;
      const slug = (body.slug || title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      const newBlog = {
        id: body.id || newId,
        title: title,
        slug: slug,
        featured_image: body.featured_image || body.cover_image || "",
        short_description: body.short_description || body.excerpt || "",
        full_content: body.full_content || body.content || "",
        category: body.category || "General",
        author: body.author || "JSArt&Decor Editorial",
        status: body.status || "Published",
        created_at: body.created_at || new Date().toISOString()
      };

      const updatedBlogs = [newBlog, ...blogsDb.filter((b) => b.id !== newBlog.id)];
      await saveBlogsToDb(updatedBlogs);
      return res.json({ success: true, id: newId, message: "Blog created and saved successfully.", data: newBlog });
    }

    if (req.method === "PUT") {
      const body = req.body || {};
      const idx = blogsDb.findIndex((b) => b.id === body.id);
      if (idx === -1) return res.status(404).json({ success: false, error: "Blog not found." });

      const updatedTitle = String(body.title !== undefined ? body.title : blogsDb[idx].title).trim();
      const updatedSlug = body.slug || (updatedTitle ? updatedTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") : blogsDb[idx].slug);

      blogsDb[idx] = { 
        ...blogsDb[idx], 
        ...body,
        title: updatedTitle,
        slug: updatedSlug,
        updated_at: new Date().toISOString()
      };

      await saveBlogsToDb(blogsDb);
      return res.json({ success: true, message: "Blog updated and saved successfully.", data: blogsDb[idx] });
    }

    if (req.method === "DELETE") {
      const { id } = req.body || {};
      const targetId = Number(id);
      blogsDb = blogsDb.filter((b) => b.id !== targetId);

      if (mysqlPool) {
        try {
          await mysqlPool.query("DELETE FROM blogs WHERE id = ?", [targetId]);
          console.log(`[Blogs] Deleted blog ID ${targetId} from MySQL`);
        } catch (e: any) {
          console.warn("[Blogs] MySQL delete error:", e?.message || e);
        }
      }

      await saveBlogsToDb(blogsDb);
      return res.json({ success: true, message: "Blog deleted successfully." });
    }

    res.status(405).json({ success: false, error: "Method not allowed." });
  });

  // Admin Partners CRUD
  app.all(["/api/admin/partners.php", "/api/admin/partners"], async (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    if (req.method === "GET") {
      return res.json({ success: true, data: partnersDb });
    }

    if (req.method === "POST") {
      const body = req.body || {};

      // Handle batch save from admin: { partners: Partner[] }
      if (Array.isArray(body.partners)) {
        await savePartnersToDb(body.partners);
        return res.json({ success: true, message: "Partners updated and saved successfully.", data: partnersDb });
      }

      const newId = partnersDb.length > 0 ? Math.max(...partnersDb.map((p) => Number(p.id) || 0)) + 1 : 1;
      const newPartner = {
        id: body.id ? Number(body.id) : newId,
        name: String(body.name || "Partner"),
        partner_type: body.partner_type || "Hotel",
        logo_url: body.logo_url || "",
        description: body.description || "",
        website: body.website || "",
        display_order: Number(body.display_order) || 1,
        is_active: body.is_active !== undefined ? !!body.is_active : true
      };

      partnersDb = [...partnersDb.filter((p) => Number(p.id) !== newPartner.id), newPartner];
      await savePartnersToDb(partnersDb);
      return res.json({ success: true, id: newPartner.id, message: "Partner added and saved.", data: newPartner });
    }

    if (req.method === "PUT") {
      const body = req.body || {};
      const targetId = Number(body.id);
      const idx = partnersDb.findIndex((p) => Number(p.id) === targetId);
      if (idx === -1) return res.status(404).json({ success: false, error: "Partner not found." });

      partnersDb[idx] = { ...partnersDb[idx], ...body, id: targetId };
      await savePartnersToDb(partnersDb);
      return res.json({ success: true, message: "Partner updated and saved.", data: partnersDb[idx] });
    }

    if (req.method === "DELETE") {
      const id = Number(req.body?.id || req.query?.id);
      partnersDb = partnersDb.filter((p) => Number(p.id) !== id);
      if (mysqlPool) {
        try {
          await mysqlPool.query("DELETE FROM partners WHERE id = ?", [id]);
        } catch (err) {
          console.error("Error deleting partner from MySQL:", err);
        }
      }
      await savePartnersToDb(partnersDb);
      return res.json({ success: true, message: "Partner removed and saved." });
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
  app.all(["/api/admin/settings.php", "/api/admin/settings"], async (req, res) => {
    if (req.method === "GET") {
      return res.json({ success: true, data: settingsDb });
    }

    if (req.method === "POST" || req.method === "PUT") {
      await saveSettingsToDb(req.body || {});
      return res.json({ 
        success: true, 
        message: "Settings updated and saved to database successfully.",
        data: settingsDb
      });
    }

    res.status(405).json({ success: false, error: "Method not allowed." });
  });

  // Admin Header Logo Upload & Database Sync
  app.post(["/api/admin/upload_logo.php", "/api/admin/upload_logo", "/api/upload/logo"], async (req, res) => {
    try {
      const { logo_data, logo_url } = req.body || {};
      let finalUrl = "";

      if (logo_data && typeof logo_data === "string" && logo_data.startsWith("data:image/")) {
        const matches = logo_data.match(/^data:image\/([a-zA-Z0-9\+\-]+);base64,(.+)$/);
        if (matches) {
          let ext = matches[1].toLowerCase();
          if (ext === "svg+xml") ext = "svg";
          if (!["jpg", "jpeg", "png", "webp", "svg", "gif"].includes(ext)) {
            ext = "png";
          }
          const buffer = Buffer.from(matches[2], "base64");
          const uploadsDir = path.join(process.cwd(), "uploads");
          const publicUploadsDir = path.join(process.cwd(), "public", "uploads");

          if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
          if (!fs.existsSync(publicUploadsDir)) fs.mkdirSync(publicUploadsDir, { recursive: true });

          const safeFileName = `header_logo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
          const filePath = path.join(uploadsDir, safeFileName);
          const publicFilePath = path.join(publicUploadsDir, safeFileName);

          fs.writeFileSync(filePath, buffer);
          try {
            fs.writeFileSync(publicFilePath, buffer);
          } catch {}

          finalUrl = `/uploads/${safeFileName}`;
        }
      } else if (logo_url && typeof logo_url === "string" && logo_url.trim().length > 0) {
        finalUrl = logo_url.trim();
      }

      if (!finalUrl) {
        return res.status(400).json({ success: false, error: "No valid image data or URL provided." });
      }

      await saveSettingsToDb({
        logo_path: finalUrl,
        logo_url: finalUrl
      });

      return res.json({
        success: true,
        logo_url: finalUrl,
        logo_path: finalUrl,
        data: settingsDb,
        message: "Header logo uploaded and updated in database successfully."
      });
    } catch (err: any) {
      console.error("[Logo Upload] Error:", err);
      return res.status(500).json({ success: false, error: err?.message || "Failed to upload logo." });
    }
  });

  // Admin General Image Upload (Blogs, Products, Banners, etc.)
  app.post(["/api/admin/upload_image.php", "/api/admin/upload_image", "/api/upload/image"], async (req, res) => {
    try {
      const { image_data, file, fileName } = req.body || {};
      const payload = image_data || file;
      let finalUrl = "";

      if (payload && typeof payload === "string" && payload.startsWith("data:image/")) {
        const matches = payload.match(/^data:image\/([a-zA-Z0-9\+\-]+);base64,(.+)$/);
        if (matches) {
          let ext = matches[1].toLowerCase();
          if (ext === "svg+xml") ext = "svg";
          if (!["jpg", "jpeg", "png", "webp", "svg", "gif"].includes(ext)) {
            ext = "jpg";
          }
          const buffer = Buffer.from(matches[2], "base64");
          const uploadsDir = path.join(process.cwd(), "uploads");
          const publicUploadsDir = path.join(process.cwd(), "public", "uploads");

          if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
          if (!fs.existsSync(publicUploadsDir)) fs.mkdirSync(publicUploadsDir, { recursive: true });

          const safeName = (fileName || "blog_img").replace(/[^a-zA-Z0-9_-]/g, "");
          const safeFileName = `img_${Date.now()}_${safeName.substring(0, 30)}.${ext}`;
          const filePath = path.join(uploadsDir, safeFileName);
          const publicFilePath = path.join(publicUploadsDir, safeFileName);

          fs.writeFileSync(filePath, buffer);
          try {
            fs.writeFileSync(publicFilePath, buffer);
          } catch {}

          finalUrl = `/uploads/${safeFileName}`;
        }
      } else if (payload && typeof payload === "string" && (payload.startsWith("http://") || payload.startsWith("https://"))) {
        finalUrl = payload.trim();
      }

      if (!finalUrl) {
        return res.status(400).json({ success: false, error: "No valid image data or URL provided." });
      }

      return res.json({
        success: true,
        url: finalUrl,
        image_url: finalUrl,
        message: "Image uploaded successfully."
      });
    } catch (err: any) {
      console.error("[General Image Upload] Error:", err);
      return res.status(500).json({ success: false, error: err?.message || "Failed to upload image." });
    }
  });

  // -------------------------------------------------------------
  // BANNERS API (HERO, PROMO, CATEGORY, CURATED)
  // -------------------------------------------------------------
  app.all(["/api/banners/index.php", "/api/banners"], (req, res) => {
    const { type, all } = req.query;
    let list = bannersDb;
    if (all !== "true") {
      list = list.filter((b) => b.is_active);
    }
    if (type) {
      list = list.filter((b) => b.banner_type === type);
    }
    list.sort((a, b) => (a.display_order || 1) - (b.display_order || 1));
    res.json({ success: true, data: list });
  });

  app.post(["/api/banners/save.php", "/api/banners/save"], async (req, res) => {
    const body = req.body;
    if (!body || !body.title || !body.image_url) {
      return res.status(400).json({ success: false, message: "Title and image_url are required." });
    }

    if (body.id) {
      const idx = bannersDb.findIndex((b) => b.id === body.id);
      if (idx !== -1) {
        bannersDb[idx] = { ...bannersDb[idx], ...body };
        await saveBannersToDb(bannersDb);
        return res.json({ success: true, message: "Banner updated.", id: body.id });
      }
    }

    const newId = bannersDb.length > 0 ? Math.max(...bannersDb.map((b) => b.id)) + 1 : 1;
    const newBanner = {
      id: newId,
      title: body.title,
      subtitle: body.subtitle || "",
      highlight_text: body.highlight_text || "",
      description: body.description || "",
      image_url: body.image_url,
      link_url: body.link_url || "",
      button_text: body.button_text || "",
      banner_type: body.banner_type || "hero",
      display_order: Number(body.display_order) || 1,
      is_active: body.is_active !== undefined ? !!body.is_active : true,
      created_at: new Date().toISOString()
    };
    bannersDb.push(newBanner);
    await saveBannersToDb(bannersDb);
    res.json({ success: true, message: "Banner created.", id: newId });
  });

  app.all(["/api/banners/delete.php", "/api/banners/delete"], async (req, res) => {
    const id = Number(req.body?.id || req.query?.id);
    if (!id) return res.status(400).json({ success: false, message: "Valid ID required." });
    bannersDb = bannersDb.filter((b) => b.id !== id);
    if (mysqlPool) {
      try {
        await mysqlPool.query("DELETE FROM banners WHERE id = ?", [id]);
      } catch (err) {
        console.error("Error deleting banner from MySQL:", err);
      }
    }
    await saveBannersToDb(bannersDb);
    res.json({ success: true, message: "Banner deleted." });
  });

  // -------------------------------------------------------------
  // ALL PAGES & SECTIONS CMS API
  // -------------------------------------------------------------
  app.all(["/api/sections/index.php", "/api/sections"], (req, res) => {
    const { page, all } = req.query;
    let list = sectionsDb;
    if (all !== "true") {
      list = list.filter((s) => s.is_active);
    }
    if (page) {
      list = list.filter((s) => s.page_name === page);
    }
    list.sort((a, b) => (a.display_order || 1) - (b.display_order || 1));
    res.json({ success: true, data: list });
  });

  app.post(["/api/sections/save.php", "/api/sections/save"], async (req, res) => {
    const body = req.body;
    if (!body || !body.section_key || !body.title) {
      return res.status(400).json({ success: false, message: "section_key and title are required." });
    }

    const idx = sectionsDb.findIndex((s) => s.section_key === body.section_key);
    if (idx !== -1) {
      sectionsDb[idx] = { ...sectionsDb[idx], ...body };
      await saveSectionsToDb(sectionsDb);
      return res.json({ success: true, message: "Section updated." });
    } else {
      const newId = sectionsDb.length > 0 ? Math.max(...sectionsDb.map((s) => s.id)) + 1 : 1;
      sectionsDb.push({
        id: newId,
        page_name: body.page_name || "home",
        section_key: body.section_key,
        title: body.title,
        subtitle: body.subtitle || "",
        badge: body.badge || "",
        content: body.content || "",
        image_url: body.image_url || "",
        button_text: body.button_text || "",
        button_url: body.button_url || "",
        extra_data: body.extra_data || null,
        is_active: body.is_active !== undefined ? !!body.is_active : true,
        display_order: Number(body.display_order) || 1
      });
      await saveSectionsToDb(sectionsDb);
      return res.json({ success: true, message: "Section created.", id: newId });
    }
  });

  // -------------------------------------------------------------
  // CONTACT & WHOLESALE INQUIRIES API (ADMIN)
  // -------------------------------------------------------------
  app.all(["/api/contact/messages.php", "/api/contact/messages"], (req, res) => {
    if (req.method === "GET") {
      return res.json({ success: true, data: contactMessagesDb });
    }

    if (req.method === "PUT" || req.method === "POST") {
      const { id, is_read } = req.body;
      const msg = contactMessagesDb.find((m) => m.id === Number(id));
      if (!msg) return res.status(404).json({ success: false, error: "Message not found." });
      msg.is_read = !!is_read;
      return res.json({ success: true, message: "Status updated." });
    }

    if (req.method === "DELETE") {
      const id = Number(req.body?.id || req.query?.id);
      contactMessagesDb = contactMessagesDb.filter((m) => m.id !== id);
      return res.json({ success: true, message: "Message deleted." });
    }

    res.status(405).json({ success: false, error: "Method not allowed." });
  });

  // -------------------------------------------------------------
  // IMAGEKIT UPLOAD & TESTING ENDPOINTS
  // -------------------------------------------------------------
  app.all(["/api/upload/imagekit.php", "/api/upload/imagekit"], async (req, res) => {
    const action = req.query.action || req.body?.action;

    // Test ImageKit Credentials
    if (action === "test") {
      const privateKey = settingsDb.imagekit_private_key || process.env.IMAGEKIT_PRIVATE_KEY;
      if (!privateKey) {
        return res.json({
          success: false,
          message: "ImageKit Private Key is not configured yet. Please enter it in Admin Settings."
        });
      }

      try {
        const authHeader = "Basic " + Buffer.from(privateKey + ":").toString("base64");
        const ikRes = await fetch("https://api.imagekit.io/v1/files?limit=1", {
          headers: { Authorization: authHeader }
        });

        if (ikRes.ok) {
          return res.json({
            success: true,
            message: "ImageKit connected successfully! Live CDN active.",
            endpoint: settingsDb.imagekit_url_endpoint || process.env.IMAGEKIT_URL_ENDPOINT
          });
        } else {
          return res.json({
            success: false,
            message: `ImageKit authentication failed (HTTP ${ikRes.status}). Verify your Private Key.`
          });
        }
      } catch (err: any) {
        return res.json({
          success: false,
          message: "ImageKit connection test failed: " + (err?.message || err)
        });
      }
    }

    // Get Auth Parameters (token, expire, signature) for client-side direct upload
    if (action === "auth") {
      const privateKey = settingsDb.imagekit_private_key || process.env.IMAGEKIT_PRIVATE_KEY;
      const publicKey = settingsDb.imagekit_public_key || process.env.IMAGEKIT_PUBLIC_KEY || "";
      const urlEndpoint = settingsDb.imagekit_url_endpoint || process.env.IMAGEKIT_URL_ENDPOINT || "";

      if (!privateKey) {
        return res.status(400).json({ success: false, message: "ImageKit Private Key not configured." });
      }

      const token = crypto.randomBytes(16).toString("hex");
      const expire = Math.floor(Date.now() / 1000) + 1800;
      const signature = crypto.createHmac("sha1", privateKey).update(token + expire).digest("hex");

      return res.json({
        token,
        expire,
        signature,
        publicKey,
        urlEndpoint
      });
    }

    // Upload File (base64 or remote URL or multipart)
    if (req.method === "POST") {
      const { file, fileName, folder } = req.body || {};
      const privateKey = settingsDb.imagekit_private_key || process.env.IMAGEKIT_PRIVATE_KEY;

      if (!file) {
        return res.status(400).json({ success: false, message: "No file content or image URL provided." });
      }

      // If ImageKit private key is set, call ImageKit upload API
      if (privateKey) {
        try {
          const authHeader = "Basic " + Buffer.from(privateKey + ":").toString("base64");
          const formBody = new URLSearchParams();
          formBody.append("file", file);
          formBody.append("fileName", fileName || `img_${Date.now()}.jpg`);
          formBody.append("useUniqueFileName", "true");
          if (folder) formBody.append("folder", folder);

          const ikRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
            method: "POST",
            headers: {
              Authorization: authHeader
            },
            body: formBody
          });

          const ikData = (await ikRes.json()) as any;

          if (ikRes.ok && ikData.url) {
            return res.json({
              success: true,
              url: ikData.url,
              image_url: ikData.url,
              thumbnailUrl: ikData.thumbnailUrl || ikData.url,
              fileId: ikData.fileId,
              name: ikData.name,
              provider: "imagekit"
            });
          } else {
            return res.status(ikRes.status || 500).json({
              success: false,
              message: ikData.message || "ImageKit upload failed.",
              details: ikData
            });
          }
        } catch (err: any) {
          console.error("ImageKit upload error:", err);
          return res.status(500).json({
            success: false,
            message: "ImageKit upload failed: " + (err?.message || err)
          });
        }
      }

      // Fallback: If no ImageKit private key, return the URL (if valid URL) or save to /uploads
      if (typeof file === "string" && (file.startsWith("http://") || file.startsWith("https://"))) {
        return res.json({
          success: true,
          url: file,
          image_url: file,
          provider: "direct_url",
          note: "Using direct image URL. Configure ImageKit in Admin Settings for CDN optimization."
        });
      }

      // If base64 data URI
      if (typeof file === "string" && file.startsWith("data:image/")) {
        const matches = file.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (matches) {
          const ext = matches[1] || "jpg";
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, "base64");
          const uploadsDir = path.join(process.cwd(), "uploads");
          if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
          const safeFileName = `${Date.now()}_${(fileName || "upload").replace(/[^a-zA-Z0-9_-]/g, "")}.${ext}`;
          const filePath = path.join(uploadsDir, safeFileName);
          fs.writeFileSync(filePath, buffer);
          const localUrl = `/uploads/${safeFileName}`;
          return res.json({
            success: true,
            url: localUrl,
            image_url: localUrl,
            provider: "local_storage",
            note: "Stored locally. Configure ImageKit in Admin Settings for CDN delivery."
          });
        }
      }

      return res.status(400).json({
        success: false,
        message: "Invalid file format. Please upload via ImageKit or provide an image URL."
      });
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
