<?php
// Admin Order Management Endpoint (Status Transitions, Strict Stock Restoration, & Response Mapping)
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/csrf.php';

header("Content-Type: application/json; charset=UTF-8");

require_admin_auth();

$method = $_SERVER['REQUEST_METHOD'];

// Helper to format DB order row to camelCase React Order interface
function map_order_to_camelcase($o, $items = []) {
    return [
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

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM orders ORDER BY id DESC");
        $ordersRaw = $stmt->fetchAll();

        $orders = [];
        foreach ($ordersRaw as $o) {
            $itemStmt = $pdo->prepare("SELECT * FROM order_items WHERE order_id = :oid");
            $itemStmt->execute([':oid' => $o['id']]);
            $items = $itemStmt->fetchAll();
            $orders[] = map_order_to_camelcase($o, $items);
        }

        echo json_encode(["success" => true, "data" => $orders]);
    } catch (Exception $e) {
        error_log("Get Orders Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to fetch orders."]);
    }
    exit();
}

validate_csrf_token();

if ($method === 'PUT' || $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || empty($input['id'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Order ID required."]);
        exit();
    }

    $order_id = (int)$input['id'];
    $new_order_status = !empty($input['order_status']) ? trim($input['order_status']) : null;
    $new_payment_status = !empty($input['payment_status']) ? trim($input['payment_status']) : null;

    $allowed_order_statuses = ['New', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    $allowed_payment_statuses = ['Pending', 'Paid', 'Failed'];

    if ($new_order_status && !in_array($new_order_status, $allowed_order_statuses)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Invalid order status value."]);
        exit();
    }

    if ($new_payment_status && !in_array($new_payment_status, $allowed_payment_statuses)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Invalid payment status value."]);
        exit();
    }

    try {
        $pdo->beginTransaction();

        // Lock order record
        $orderStmt = $pdo->prepare("SELECT id, order_status, payment_status, stock_deducted, stock_restored, payment_method FROM orders WHERE id = :id FOR UPDATE");
        $orderStmt->execute([':id' => $order_id]);
        $order = $orderStmt->fetch();

        if (!$order) {
            $pdo->rollBack();
            http_response_code(404);
            echo json_encode(["success" => false, "error" => "Order not found."]);
            exit();
        }

        // If status changing to Cancelled: restore stock ONLY IF stock was previously deducted (stock_deducted = 1) AND not restored yet (stock_restored = 0)
        if ($new_order_status === 'Cancelled' && (int)$order['stock_deducted'] === 1 && (int)$order['stock_restored'] === 0) {
            $itemsStmt = $pdo->prepare("SELECT product_id, quantity FROM order_items WHERE order_id = :oid");
            $itemsStmt->execute([':oid' => $order_id]);
            $items = $itemsStmt->fetchAll();

            $restoreStmt = $pdo->prepare("UPDATE products SET stock_quantity = stock_quantity + :qty WHERE id = :pid");
            foreach ($items as $it) {
                $restoreStmt->execute([
                    ':qty' => $it['quantity'],
                    ':pid' => $it['product_id']
                ]);
            }

            $updateStmt = $pdo->prepare("UPDATE orders SET order_status = 'Cancelled', stock_deducted = 0, stock_restored = 1 WHERE id = :id");
            $updateStmt->execute([':id' => $order_id]);
        } elseif ($new_order_status) {
            $updateStmt = $pdo->prepare("UPDATE orders SET order_status = :status WHERE id = :id");
            $updateStmt->execute([':status' => $new_order_status, ':id' => $order_id]);
        }

        if ($new_payment_status) {
            $updatePay = $pdo->prepare("UPDATE orders SET payment_status = :pay_status WHERE id = :id");
            $updatePay->execute([':pay_status' => $new_payment_status, ':id' => $order_id]);
        }

        $pdo->commit();

        echo json_encode(["success" => true, "message" => "Order updated successfully."]);
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log("Update Order Status Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to update order."]);
    }
    exit();
}
?>
