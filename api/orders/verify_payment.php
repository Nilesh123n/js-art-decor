<?php
// Razorpay Payment Signature Verification & Server-Side Validation
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/razorpay.php';

header("Content-Type: application/json; charset=UTF-8");

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['razorpay_order_id']) || empty($input['razorpay_payment_id']) || empty($input['razorpay_signature'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing payment verification parameters."]);
    exit();
}

$razorpay_order_id = trim($input['razorpay_order_id']);
$razorpay_payment_id = trim($input['razorpay_payment_id']);
$razorpay_signature = trim($input['razorpay_signature']);

// 1. Verify HMAC SHA256 Signature using Server Secret Key
if (empty(RAZORPAY_KEY_SECRET)) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Server payment configuration incomplete."]);
    exit();
}

$generated_signature = hash_hmac('sha256', $razorpay_order_id . "|" . $razorpay_payment_id, RAZORPAY_KEY_SECRET);

if (!hash_equals($generated_signature, $razorpay_signature)) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Invalid payment verification signature."]);
    exit();
}

try {
    $pdo->beginTransaction();

    // 2. Lock & Verify Order Record
    $orderStmt = $pdo->prepare("SELECT id, payment_status, total_amount, order_number, stock_deducted FROM orders WHERE razorpay_order_id = :rzp_oid FOR UPDATE");
    $orderStmt->execute([':rzp_oid' => $razorpay_order_id]);
    $order = $orderStmt->fetch();

    if (!$order) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(["success" => false, "error" => "Associated order not found."]);
        exit();
    }

    // 3. Idempotent Double Processing Check
    if ($order['payment_status'] === 'Paid' && (int)$order['stock_deducted'] === 1) {
        $pdo->commit();
        echo json_encode([
            "success" => true,
            "message" => "Payment verified previously.",
            "order_id" => (int)$order['id'],
            "order_number" => $order['order_number']
        ]);
        exit();
    }

    // 4. Server-Side Razorpay API Payment Status & Amount Verification
    $expected_amount_paise = (int)round((float)$order['total_amount'] * 100);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://api.razorpay.com/v1/payments/" . $razorpay_payment_id);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_USERPWD, RAZORPAY_KEY_ID . ":" . RAZORPAY_KEY_SECRET);
    $rzp_res = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($http_code !== 200 || empty($rzp_res)) {
        $pdo->rollBack();
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Failed to verify transaction with Razorpay servers."]);
        exit();
    }

    $payment_data = json_decode($rzp_res, true);
    $status = $payment_data['status'] ?? '';
    $currency = $payment_data['currency'] ?? '';
    $amount = (int)($payment_data['amount'] ?? 0);

    if (!in_array($status, ['captured', 'authorized'])) {
        $pdo->rollBack();
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Payment status is not captured or authorized."]);
        exit();
    }

    if ($currency !== 'INR') {
        $pdo->rollBack();
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Invalid payment currency. Expected INR."]);
        exit();
    }

    if ($amount !== $expected_amount_paise) {
        $pdo->rollBack();
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Payment amount mismatch."]);
        exit();
    }

    // 5. Deduct Stock (If stock hasn't been deducted yet)
    if ((int)$order['stock_deducted'] === 0) {
        $itemStmt = $pdo->prepare("SELECT product_id, quantity FROM order_items WHERE order_id = :oid");
        $itemStmt->execute([':oid' => $order['id']]);
        $items = $itemStmt->fetchAll();

        foreach ($items as $it) {
            $stockStmt = $pdo->prepare("SELECT stock_quantity, name FROM products WHERE id = :pid FOR UPDATE");
            $stockStmt->execute([':pid' => $it['product_id']]);
            $prod = $stockStmt->fetch();

            if (!$prod || (int)$prod['stock_quantity'] < (int)$it['quantity']) {
                $pdo->rollBack();
                http_response_code(400);
                echo json_encode(["success" => false, "error" => "Stock depleted during transaction processing."]);
                exit();
            }

            $deductStmt = $pdo->prepare("UPDATE products SET stock_quantity = stock_quantity - :qty WHERE id = :pid");
            $deductStmt->execute([':qty' => $it['quantity'], ':pid' => $it['product_id']]);
        }
    }

    // 6. Update Order Record
    $updateOrder = $pdo->prepare("
        UPDATE orders 
        SET payment_status = 'Paid', order_status = 'Confirmed', razorpay_payment_id = :rzp_pid, stock_deducted = 1 
        WHERE id = :oid
    ");
    $updateOrder->execute([
        ':rzp_pid' => $razorpay_payment_id,
        ':oid' => $order['id']
    ]);

    $pdo->commit();

    echo json_encode([
        "success" => true,
        "message" => "Payment verified successfully.",
        "order_id" => (int)$order['id'],
        "order_number" => $order['order_number']
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log("Payment Verification Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Failed to verify payment."]);
}
?>
