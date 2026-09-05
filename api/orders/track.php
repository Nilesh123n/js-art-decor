<?php
// Track Order Endpoint for Hostinger MySQL backend
require_once __DIR__ . '/../config/db.php';

header("Content-Type: application/json; charset=UTF-8");

$order_number = trim($_GET['order_number'] ?? $_POST['order_number'] ?? '');
$contact = trim($_GET['contact'] ?? $_GET['mobile'] ?? $_POST['contact'] ?? $_POST['mobile'] ?? '');

if (empty($order_number) && empty($contact)) {
    // Try JSON input
    $rawInput = json_decode(file_get_contents('php://input'), true);
    if ($rawInput) {
        $order_number = trim($rawInput['order_number'] ?? '');
        $contact = trim($rawInput['contact'] ?? $rawInput['mobile'] ?? '');
    }
}

if (empty($order_number) && empty($contact)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "Please enter your Order Number or registered Mobile Number to track your order."
    ]);
    exit();
}

try {
    $sql = "SELECT * FROM orders WHERE 1=1";
    $params = [];

    if (!empty($order_number)) {
        $sql .= " AND (order_number = :ord OR order_number LIKE :ord_like)";
        $params[':ord'] = $order_number;
        $params[':ord_like'] = "%" . $order_number . "%";
    } elseif (!empty($contact)) {
        $sql .= " AND (mobile_number LIKE :contact_mob OR email = :contact_email)";
        $params[':contact_mob'] = "%" . $contact . "%";
        $params[':contact_email'] = $contact;
    }

    $sql .= " ORDER BY id DESC LIMIT 1";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$order) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "error" => "No order found matching '" . ($order_number ?: $contact) . "'. Please check your order details or contact WhatsApp support."
        ]);
        exit();
    }

    // Fetch items
    $itemStmt = $pdo->prepare("
        SELECT oi.*, p.images, p.size, p.material 
        FROM order_items oi 
        LEFT JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = :oid
    ");
    $itemStmt->execute([':oid' => $order['id']]);
    $rawItems = $itemStmt->fetchAll(PDO::FETCH_ASSOC);

    $items = [];
    foreach ($rawItems as $it) {
        $imgs = [];
        if (!empty($it['images'])) {
            $decoded = json_decode($it['images'], true);
            if (is_array($decoded)) $imgs = $decoded;
        }

        $items[] = [
            'productId' => (int)$it['product_id'],
            'productName' => $it['product_name'],
            'sku' => $it['sku'] ?? 'JS-ART',
            'quantity' => (int)$it['quantity'],
            'unitPrice' => (float)$it['unit_price'],
            'subtotal' => (float)$it['subtotal'],
            'image' => !empty($imgs[0]) ? $imgs[0] : 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80',
            'size' => $it['size'] ?? 'Standard',
            'material' => $it['material'] ?? 'Handmade Natural'
        ];
    }

    // Milestones and courier calculation
    $orderStatus = $order['order_status'] ?? 'Confirmed';
    $paymentStatus = $order['payment_status'] ?? 'Paid';
    $createdAt = $order['created_at'] ?? date('Y-m-d H:i:s');
    $createdTime = strtotime($createdAt);

    $isConfirmed = in_array($orderStatus, ['Confirmed', 'Processing', 'Shipped', 'Delivered']) || $paymentStatus === 'Paid';
    $isProcessing = in_array($orderStatus, ['Processing', 'Shipped', 'Delivered']);
    $isShipped = in_array($orderStatus, ['Shipped', 'Delivered']);
    $isDelivered = $orderStatus === 'Delivered';

    $timeline = [
        [
            'step' => 1,
            'title' => 'Order Placed & Payment Confirmed',
            'description' => 'Payment verified via ' . ($order['payment_method'] ?? 'Online') . ' (' . $paymentStatus . '). Dispatched to Jaipur artisan hub.',
            'timestamp' => $createdAt,
            'completed' => $isConfirmed,
            'current' => !$isProcessing
        ],
        [
            'step' => 2,
            'title' => 'Artisan Crafting & Workshop Processing',
            'description' => 'Items selected from handcrafted inventory, inspected for artistic finish and packed at Jaipur central workshop.',
            'timestamp' => date('Y-m-d H:i:s', $createdTime + 6 * 3600),
            'completed' => $isProcessing,
            'current' => $isProcessing && !$isShipped
        ],
        [
            'step' => 3,
            'title' => 'Quality Inspection & Secure Packaging',
            'description' => 'Multi-point structural check completed. Wrapped in eco-friendly protective shockproof packaging.',
            'timestamp' => date('Y-m-d H:i:s', $createdTime + 24 * 3600),
            'completed' => $isProcessing,
            'current' => false
        ],
        [
            'step' => 4,
            'title' => 'Dispatched via Express Courier',
            'description' => 'Handed over to courier partner. In transit towards destination delivery hub.',
            'timestamp' => date('Y-m-d H:i:s', $createdTime + 48 * 3600),
            'completed' => $isShipped,
            'current' => $isShipped && !$isDelivered
        ],
        [
            'step' => 5,
            'title' => 'Out for Delivery & Delivered',
            'description' => 'Delivery executive will deliver the package to your doorstep with OTP / signature.',
            'timestamp' => date('Y-m-d H:i:s', $createdTime + 96 * 3600),
            'completed' => $isDelivered,
            'current' => $isDelivered
        ]
    ];

    $estDelivery = date('D, d M Y', $createdTime + 5 * 86400);
    $digits = preg_replace('/[^0-9]/', '', $order['order_number']);
    $trackingAwb = 'JSA-EXP-' . (substr($digits, -6) ?: '782910');

    echo json_encode([
        'success' => true,
        'data' => [
            'orderNumber' => $order['order_number'],
            'orderStatus' => $order['order_status'],
            'paymentStatus' => $order['payment_status'],
            'paymentMethod' => $order['payment_method'],
            'razorpayPaymentId' => $order['razorpay_payment_id'] ?: ('pay_' . ($digits ?: 'online')),
            'createdAt' => $order['created_at'],
            'estimatedDelivery' => $estDelivery,
            'courierPartner' => 'Delhivery Surface / Blue Dart Express',
            'trackingAwb' => $trackingAwb,
            'customer' => [
                'fullName' => $order['customer_name'],
                'mobileNumber' => $order['mobile_number'],
                'email' => $order['email'],
                'address' => $order['address'],
                'city' => $order['city'],
                'state' => $order['state'],
                'pinCode' => $order['pin_code'],
                'orderNotes' => $order['order_notes']
            ],
            'items' => $items,
            'subtotal' => (float)$order['subtotal'],
            'shippingFee' => (float)$order['shipping_fee'],
            'totalAmount' => (float)$order['total_amount'],
            'timeline' => $timeline
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error while tracking order: ' . $e->getMessage()
    ]);
}
