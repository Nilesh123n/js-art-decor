<?php
// Razorpay Asynchronous Webhook Handler
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/razorpay.php';

header("Content-Type: application/json; charset=UTF-8");

$webhook_secret = getenv('RAZORPAY_WEBHOOK_SECRET') ?: RAZORPAY_KEY_SECRET;

if (empty($webhook_secret)) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Webhook secret missing."]);
    exit();
}

$raw_payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_RAZORPAY_SIGNATURE'] ?? '';

if (empty($signature) || empty($raw_payload)) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing signature or payload."]);
    exit();
}

$expected_signature = hash_hmac('sha256', $raw_payload, $webhook_secret);

if (!hash_equals($expected_signature, $signature)) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Invalid webhook signature."]);
    exit();
}

$event_data = json_decode($raw_payload, true);
$event = $event_data['event'] ?? '';

try {
    if ($event === 'payment.captured' || $event === 'order.paid') {
        $payment_entity = $event_data['payload']['payment']['entity'] ?? [];
        $razorpay_order_id = $payment_entity['order_id'] ?? null;
        $razorpay_payment_id = $payment_entity['id'] ?? null;

        if ($razorpay_order_id) {
            $pdo->beginTransaction();

            $stmt = $pdo->prepare("SELECT id, payment_status, stock_deducted FROM orders WHERE razorpay_order_id = :rzp_oid FOR UPDATE");
            $stmt->execute([':rzp_oid' => $razorpay_order_id]);
            $order = $stmt->fetch();

            if ($order && $order['payment_status'] !== 'Paid') {
                if ((int)$order['stock_deducted'] === 0) {
                    $itemStmt = $pdo->prepare("SELECT product_id, quantity FROM order_items WHERE order_id = :oid");
                    $itemStmt->execute([':oid' => $order['id']]);
                    $items = $itemStmt->fetchAll();

                    foreach ($items as $it) {
                        $deductStmt = $pdo->prepare("UPDATE products SET stock_quantity = GREATEST(0, stock_quantity - :qty) WHERE id = :pid");
                        $deductStmt->execute([':qty' => $it['quantity'], ':pid' => $it['product_id']]);
                    }
                }

                $updateOrder = $pdo->prepare("
                    UPDATE orders 
                    SET payment_status = 'Paid', order_status = 'Confirmed', razorpay_payment_id = :rzp_pid, stock_deducted = 1 
                    WHERE id = :oid
                ");
                $updateOrder->execute([
                    ':rzp_pid' => $razorpay_payment_id,
                    ':oid' => $order['id']
                ]);
            }

            $pdo->commit();
        }
    } elseif ($event === 'payment.failed') {
        $payment_entity = $event_data['payload']['payment']['entity'] ?? [];
        $razorpay_order_id = $payment_entity['order_id'] ?? null;

        if ($razorpay_order_id) {
            $stmt = $pdo->prepare("UPDATE orders SET payment_status = 'Failed' WHERE razorpay_order_id = :rzp_oid AND payment_status = 'Pending'");
            $stmt->execute([':rzp_oid' => $razorpay_order_id]);
        }
    }

    echo json_encode(["success" => true, "message" => "Webhook processed successfully."]);
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log("Razorpay Webhook Processing Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Webhook processing error."]);
}
?>
