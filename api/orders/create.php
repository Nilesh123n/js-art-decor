<?php
// Order Creation Endpoint (Server-Side Price Calculation & Strict Stock Logic)
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/razorpay.php';

header("Content-Type: application/json; charset=UTF-8");

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['customer']) || empty($input['items']) || !is_array($input['items'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Invalid payload structure. Customer details and cart items are required."]);
    exit();
}

$customer = $input['customer'];
$items = $input['items'];
$payment_method = ($input['payment_method'] ?? 'Razorpay') === 'COD' ? 'COD' : 'Razorpay';
$order_type = ($input['order_type'] ?? 'Retail') === 'Wholesale' ? 'Wholesale' : 'Retail';

// Validate customer details
if (empty($customer['fullName']) || empty($customer['mobileNumber']) || empty($customer['address']) || empty($customer['city']) || empty($customer['state']) || empty($customer['pinCode'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Incomplete customer details. Full Name, Mobile, Address, City, State, and Pin Code are required."]);
    exit();
}

try {
    // 1. Validate Items & Calculate Server-Side Subtotal from MySQL Prices
    $calculated_subtotal = 0;
    $validated_items = [];

    foreach ($items as $item) {
        $product_id = (int)($item['product_id'] ?? 0);
        $qty = (int)($item['quantity'] ?? 0);
        $pricing_type = ($item['item_type'] ?? 'Retail') === 'Wholesale' ? 'Wholesale' : 'Retail';

        if ($product_id <= 0) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Invalid product selection."]);
            exit();
        }

        if ($qty <= 0 || $qty > 1000) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Invalid item quantity. Must be between 1 and 1000."]);
            exit();
        }

        $stmt = $pdo->prepare("SELECT id, name, sku, retail_price, wholesale_price, stock_quantity, min_wholesale_qty, sales_availability FROM products WHERE id = :id AND is_active = 1");
        $stmt->execute([':id' => $product_id]);
        $prod = $stmt->fetch();

        if (!$prod) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Product ID #{$product_id} is unavailable or out of stock."]);
            exit();
        }

        // Validate Sales Availability Mode
        $avail = $prod['sales_availability'];
        if ($pricing_type === 'Retail' && ($avail !== 'Retail' && $avail !== 'Both')) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Product '{$prod['name']}' is not available for retail purchase."]);
            exit();
        }
        if ($pricing_type === 'Wholesale' && ($avail !== 'Wholesale' && $avail !== 'Both')) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Product '{$prod['name']}' is not available for wholesale purchase."]);
            exit();
        }

        // Enforce Wholesale MOQ
        if ($pricing_type === 'Wholesale' && $qty < (int)$prod['min_wholesale_qty']) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Quantity for {$prod['name']} is below minimum wholesale MOQ of {$prod['min_wholesale_qty']} units."]);
            exit();
        }

        $unit_price = ($pricing_type === 'Wholesale') ? (float)$prod['wholesale_price'] : (float)$prod['retail_price'];
        $item_subtotal = round($unit_price * $qty, 2);
        $calculated_subtotal += $item_subtotal;

        $validated_items[] = [
            'product_id' => $prod['id'],
            'product_name' => $prod['name'],
            'sku' => $prod['sku'],
            'quantity' => $qty,
            'unit_price' => $unit_price,
            'item_type' => $pricing_type,
            'subtotal' => $item_subtotal,
            'stock_quantity' => (int)$prod['stock_quantity']
        ];
    }

    $calculated_subtotal = round($calculated_subtotal, 2);

    // 2. Shipping Fee Calculation from Database Settings
    $settingsStmt = $pdo->query("SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('free_shipping_threshold', 'standard_shipping_fee')");
    $settingsRaw = $settingsStmt->fetchAll(PDO::FETCH_KEY_PAIR);

    $free_shipping_threshold = (float)($settingsRaw['free_shipping_threshold'] ?? 2499);
    $standard_shipping_fee = (float)($settingsRaw['standard_shipping_fee'] ?? 150);
    $shipping_fee = ($calculated_subtotal >= $free_shipping_threshold) ? 0.00 : $standard_shipping_fee;
    $total_amount = round($calculated_subtotal + $shipping_fee, 2);

    $order_number = 'JSA-' . date('Ymd') . '-' . rand(1000, 9999);

    if ($payment_method === 'COD') {
        // Handle COD Creation with DB Transaction & Immediate Stock Deduction
        $pdo->beginTransaction();

        // Lock rows & Check / Deduct Stock
        foreach ($validated_items as $vi) {
            $lockStmt = $pdo->prepare("SELECT stock_quantity FROM products WHERE id = :id FOR UPDATE");
            $lockStmt->execute([':id' => $vi['product_id']]);
            $current_stock = (int)$lockStmt->fetchColumn();

            if ($current_stock < $vi['quantity']) {
                $pdo->rollBack();
                http_response_code(400);
                echo json_encode(["success" => false, "error" => "Insufficient stock for '{$vi['product_name']}'. Only {$current_stock} units available."]);
                exit();
            }

            $deductStmt = $pdo->prepare("UPDATE products SET stock_quantity = stock_quantity - :qty WHERE id = :id");
            $deductStmt->execute([':qty' => $vi['quantity'], ':id' => $vi['product_id']]);
        }

        // Insert Order Record with stock_deducted = 1
        $orderStmt = $pdo->prepare("
            INSERT INTO orders (
                order_number, customer_name, mobile_number, email, address, city, state, pin_code,
                order_notes, subtotal, shipping_fee, total_amount, payment_method, payment_status,
                order_status, order_type, stock_deducted, stock_restored, created_at
            ) VALUES (
                :ord_num, :cname, :mobile, :email, :addr, :city, :state, :pincode,
                :notes, :subtotal, :shipping, :total, 'COD', 'Pending',
                'New', :order_type, 1, 0, NOW()
            )
        ");

        $orderStmt->execute([
            ':ord_num' => $order_number,
            ':cname' => trim($customer['fullName']),
            ':mobile' => trim($customer['mobileNumber']),
            ':email' => !empty($customer['email']) ? trim($customer['email']) : null,
            ':addr' => trim($customer['address']),
            ':city' => trim($customer['city']),
            ':state' => trim($customer['state']),
            ':pincode' => trim($customer['pinCode']),
            ':notes' => !empty($customer['orderNotes']) ? trim($customer['orderNotes']) : null,
            ':subtotal' => $calculated_subtotal,
            ':shipping' => $shipping_fee,
            ':total' => $total_amount,
            ':order_type' => $order_type
        ]);

        $order_id = $pdo->lastInsertId();

        // Insert Order Items
        $itemInsert = $pdo->prepare("
            INSERT INTO order_items (order_id, product_id, product_name, sku, quantity, unit_price, item_type, subtotal)
            VALUES (:oid, :pid, :pname, :sku, :qty, :uprice, :itype, :sub)
        ");

        foreach ($validated_items as $vi) {
            $itemInsert->execute([
                ':oid' => $order_id,
                ':pid' => $vi['product_id'],
                ':pname' => $vi['product_name'],
                ':sku' => $vi['sku'],
                ':qty' => $vi['quantity'],
                ':uprice' => $vi['unit_price'],
                ':itype' => $vi['item_type'],
                ':sub' => $vi['subtotal']
            ]);
        }

        $pdo->commit();

        echo json_encode([
            "success" => true,
            "payment_method" => "COD",
            "order_id" => (int)$order_id,
            "order_number" => $order_number,
            "total_amount" => $total_amount
        ]);
        exit();

    } else {
        // Handle Razorpay Order Creation (Stock NOT deducted until payment verification)
        if (empty(RAZORPAY_KEY_ID) || empty(RAZORPAY_KEY_SECRET)) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Razorpay payment gateway keys are missing in server environment."]);
            exit();
        }

        $razorpay_amount = (int)round($total_amount * 100); // Amount in paise

        $api_url = "https://api.razorpay.com/v1/orders";
        $payload = json_encode([
            "amount" => $razorpay_amount,
            "currency" => "INR",
            "receipt" => $order_number,
            "notes" => [
                "customer_name" => $customer['fullName'],
                "customer_mobile" => $customer['mobileNumber']
            ]
        ]);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $api_url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_USERPWD, RAZORPAY_KEY_ID . ":" . RAZORPAY_KEY_SECRET);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);

        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($http_code !== 200 || empty($response)) {
            error_log("Razorpay API Order Creation Error: Code {$http_code}, Response: {$response}");
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Payment gateway order initialization failed."]);
            exit();
        }

        $rzp_data = json_decode($response, true);
        $razorpay_order_id = $rzp_data['id'] ?? null;

        if (!$razorpay_order_id) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Failed to generate payment gateway order token."]);
            exit();
        }

        // Save order record in Pending status with stock_deducted = 0
        $orderStmt = $pdo->prepare("
            INSERT INTO orders (
                order_number, customer_name, mobile_number, email, address, city, state, pin_code,
                order_notes, subtotal, shipping_fee, total_amount, payment_method, payment_status,
                razorpay_order_id, order_status, order_type, stock_deducted, stock_restored, created_at
            ) VALUES (
                :ord_num, :cname, :mobile, :email, :addr, :city, :state, :pincode,
                :notes, :subtotal, :shipping, :total, 'Razorpay', 'Pending',
                :rzp_id, 'New', :order_type, 0, 0, NOW()
            )
        ");

        $orderStmt->execute([
            ':ord_num' => $order_number,
            ':cname' => trim($customer['fullName']),
            ':mobile' => trim($customer['mobileNumber']),
            ':email' => !empty($customer['email']) ? trim($customer['email']) : null,
            ':addr' => trim($customer['address']),
            ':city' => trim($customer['city']),
            ':state' => trim($customer['state']),
            ':pincode' => trim($customer['pinCode']),
            ':notes' => !empty($customer['orderNotes']) ? trim($customer['orderNotes']) : null,
            ':subtotal' => $calculated_subtotal,
            ':shipping' => $shipping_fee,
            ':total' => $total_amount,
            ':rzp_id' => $razorpay_order_id,
            ':order_type' => $order_type
        ]);

        $order_id = $pdo->lastInsertId();

        $itemInsert = $pdo->prepare("
            INSERT INTO order_items (order_id, product_id, product_name, sku, quantity, unit_price, item_type, subtotal)
            VALUES (:oid, :pid, :pname, :sku, :qty, :uprice, :itype, :sub)
        ");

        foreach ($validated_items as $vi) {
            $itemInsert->execute([
                ':oid' => $order_id,
                ':pid' => $vi['product_id'],
                ':pname' => $vi['product_name'],
                ':sku' => $vi['sku'],
                ':qty' => $vi['quantity'],
                ':uprice' => $vi['unit_price'],
                ':itype' => $vi['item_type'],
                ':sub' => $vi['subtotal']
            ]);
        }

        echo json_encode([
            "success" => true,
            "payment_method" => "Razorpay",
            "order_id" => (int)$order_id,
            "order_number" => $order_number,
            "razorpay_order_id" => $razorpay_order_id,
            "amount" => $razorpay_amount,
            "key_id" => RAZORPAY_KEY_ID
        ]);
    }

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log("Order Creation Exception: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Failed to create order. Please try again."]);
}
?>
