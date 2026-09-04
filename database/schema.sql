-- ===================================================
-- JSArt&Decor E-Commerce MySQL Database Schema
-- Hostinger MySQL Compatible Structure
-- ===================================================

CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100) NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `sku` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `short_description` TEXT NULL,
  `production_type` VARCHAR(50) NOT NULL DEFAULT 'Handmade',
  `segment` VARCHAR(50) NOT NULL DEFAULT 'Home',
  `product_type` VARCHAR(50) NOT NULL DEFAULT 'Bedsheet',
  `sales_availability` VARCHAR(50) NOT NULL DEFAULT 'Both',
  `retail_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `wholesale_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `stock_quantity` INT NOT NULL DEFAULT 0,
  `min_wholesale_qty` INT NOT NULL DEFAULT 10,
  `size` VARCHAR(100) NULL,
  `material` VARCHAR(100) NULL,
  `color` VARCHAR(100) NULL,
  `images` JSON NULL,
  `is_featured` TINYINT(1) DEFAULT 0,
  `is_new_arrival` TINYINT(1) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_production_type` (`production_type`),
  INDEX `idx_segment` (`segment`),
  INDEX `idx_product_type` (`product_type`),
  INDEX `idx_sales_avail` (`sales_availability`),
  INDEX `idx_stock` (`stock_quantity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(50) NOT NULL UNIQUE,
  `customer_name` VARCHAR(100) NOT NULL,
  `mobile_number` VARCHAR(20) NOT NULL,
  `email` VARCHAR(100) NULL,
  `address` TEXT NOT NULL,
  `city` VARCHAR(50) NOT NULL,
  `state` VARCHAR(50) NOT NULL,
  `pin_code` VARCHAR(20) NOT NULL,
  `order_notes` TEXT NULL,
  `subtotal` DECIMAL(10,2) NOT NULL,
  `shipping_fee` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `payment_method` ENUM('Razorpay', 'COD') NOT NULL,
  `payment_status` ENUM('Pending', 'Paid', 'Failed') NOT NULL DEFAULT 'Pending',
  `razorpay_order_id` VARCHAR(100) NULL UNIQUE,
  `razorpay_payment_id` VARCHAR(100) NULL,
  `order_status` ENUM('New', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'New',
  `order_type` ENUM('Retail', 'Wholesale', 'Bulk Inquiry') NOT NULL DEFAULT 'Retail',
  `stock_deducted` TINYINT(1) NOT NULL DEFAULT 0,
  `stock_restored` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_order_status` (`order_status`),
  INDEX `idx_payment_status` (`payment_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `sku` VARCHAR(100) NOT NULL,
  `quantity` INT NOT NULL,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `item_type` ENUM('Retail', 'Wholesale') NOT NULL,
  `subtotal` DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `blogs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `category` VARCHAR(100) NOT NULL DEFAULT 'Textile Guide',
  `featured_image` VARCHAR(500) NULL,
  `cover_image` VARCHAR(500) NULL,
  `excerpt` TEXT NULL,
  `short_description` TEXT NULL,
  `content` LONGTEXT NULL,
  `full_content` LONGTEXT NULL,
  `author` VARCHAR(100) DEFAULT 'JSArt&Decor Team',
  `status` VARCHAR(20) DEFAULT 'Published',
  `is_published` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `partners` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `partner_type` VARCHAR(100) NOT NULL DEFAULT 'Hotel',
  `logo_url` VARCHAR(500) NULL,
  `description` TEXT NULL,
  `website` VARCHAR(255) NULL,
  `display_order` INT NOT NULL DEFAULT 1,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `mobile` VARCHAR(20) NULL,
  `enquiry_type` VARCHAR(50) DEFAULT 'General',
  `subject` VARCHAR(255) NULL,
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `settings` (
  `setting_key` VARCHAR(100) PRIMARY KEY,
  `setting_value` TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Default Store Settings (No demo personal contact data or secrets)
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
('store_name', 'JSArt&Decor'),
('contact_phone', ''),
('whatsapp_number', ''),
('contact_email', ''),
('address', ''),
('free_shipping_threshold', '2499'),
('standard_shipping_fee', '150'),
('enable_cod', '1'),
('razorpay_key_id', '')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);
