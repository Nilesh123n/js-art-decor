<?php
// Admin Dashboard Metrics Endpoint with mapped camelCase structures
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/auth.php';

header("Content-Type: application/json; charset=UTF-8");

require_admin_auth();

try {
    // Total Revenue from Paid/Confirmed Orders
    $revStmt = $pdo->query("SELECT SUM(total_amount) FROM orders WHERE payment_status = 'Paid' OR (payment_method = 'COD' AND order_status != 'Cancelled')");
    $total_revenue = (float)($revStmt->fetchColumn() ?: 0);

    // Total Orders
    $orderCountStmt = $pdo->query("SELECT COUNT(*) FROM orders");
    $total_orders = (int)$orderCountStmt->fetchColumn();

    // Total Active Products
    $prodCountStmt = $pdo->query("SELECT COUNT(*) FROM products WHERE is_active = 1");
    $total_products = (int)$prodCountStmt->fetchColumn();

    // Out of Stock Products Alert
    $lowStockStmt = $pdo->query("SELECT * FROM products WHERE stock_quantity <= 5 AND is_active = 1");
    $low_stock_products = $lowStockStmt->fetchAll();

    foreach ($low_stock_products as &$p) {
        $p['id'] = (int)$p['id'];
        $p['images'] = !empty($p['images']) ? json_decode($p['images'], true) : [];
        $p['retail_price'] = (float)$p['retail_price'];
        $p['wholesale_price'] = (float)$p['wholesale_price'];
        $p['stock_quantity'] = (int)$p['stock_quantity'];
        $p['min_wholesale_qty'] = (int)$p['min_wholesale_qty'];
        $p['is_featured'] = (bool)$p['is_featured'];
        $p['is_new_arrival'] = (bool)$p['is_new_arrival'];
        $p['is_active'] = (bool)$p['is_active'];
    }

    // Unread Contact Enquiries
    $unreadEnquiriesStmt = $pdo->query("SELECT COUNT(*) FROM contact_messages WHERE is_read = 0");
    $unread_enquiries = (int)$unreadEnquiriesStmt->fetchColumn();

    // Recent Orders mapped to camelCase Order interface
    $recentOrdersStmt = $pdo->query("SELECT * FROM orders ORDER BY id DESC LIMIT 5");
    $recent_orders_raw = $recentOrdersStmt->fetchAll();

    $recent_orders = [];
    foreach ($recent_orders_raw as $o) {
        $itemStmt = $pdo->prepare("SELECT * FROM order_items WHERE order_id = :oid");
        $itemStmt->execute([':oid' => $o['id']]);
        $items = $itemStmt->fetchAll();

        $recent_orders[] = [
            "id" => (int)$o['id'],
            "orderNumber" => $o['order_number'],
            "customer" => [
                "fullName" => $o['customer_name'],
                "mobileNumber" => $o['mobile_number'],
                "email" => $o['email'] ?? '',
                "address" => $o['address'],
                "city" => $o['city'],
                "state" => $o['state'],
                "pinCode" => $o['pin_code'],
                "orderNotes" => $o['order_notes'] ?? ''
            ],
            "items" => array_map(function($it) {
                return [
                    "id" => (int)$it['id'],
                    "productId" => (int)$it['product_id'],
                    "productName" => $it['product_name'],
                    "sku" => $it['sku'],
                    "quantity" => (int)$it['quantity'],
                    "unitPrice" => (float)$it['unit_price'],
                    "itemType" => $it['item_type'],
                    "subtotal" => (float)$it['subtotal']
                ];
            }, $items),
            "subtotal" => (float)$o['subtotal'],
            "shippingFee" => (float)$o['shipping_fee'],
            "totalAmount" => (float)$o['total_amount'],
            "paymentMethod" => $o['payment_method'],
            "paymentStatus" => $o['payment_status'],
            "razorpayOrderId" => $o['razorpay_order_id'] ?? '',
            "razorpayPaymentId" => $o['razorpay_payment_id'] ?? '',
            "orderStatus" => $o['order_status'],
            "orderType" => $o['order_type'],
            "createdAt" => $o['created_at']
        ];
    }

    echo json_encode([
        "success" => true,
        "metrics" => [
            "total_revenue" => $total_revenue,
            "total_orders" => $total_orders,
            "total_products" => $total_products,
            "unread_enquiries" => $unread_enquiries
        ],
        "low_stock_alerts" => $low_stock_products,
        "recent_orders" => $recent_orders
    ]);

} catch (Exception $e) {
    error_log("Dashboard Metrics Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Failed to load dashboard metrics."]);
}
?>
