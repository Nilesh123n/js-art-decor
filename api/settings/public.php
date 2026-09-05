<?php
// Public Site Settings Endpoint
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/razorpay.php';

header("Content-Type: application/json; charset=UTF-8");

try {
    $stmt = $pdo->query("SELECT setting_key, setting_value FROM settings");
    $raw = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

    $public_settings = [
        "store_name" => $raw['store_name'] ?? $raw['site_name'] ?? "JSArt&Decor",
        "site_name" => $raw['store_name'] ?? $raw['site_name'] ?? "JSArt&Decor",
        "logo_path" => $raw['logo_path'] ?? $raw['logo_url'] ?? "",
        "logo_url" => $raw['logo_path'] ?? $raw['logo_url'] ?? "",
        "contact_phone" => $raw['contact_phone'] ?? "",
        "whatsapp_number" => $raw['whatsapp_number'] ?? $raw['contact_phone'] ?? "",
        "contact_email" => $raw['contact_email'] ?? "",
        "address" => $raw['address'] ?? "",
        "free_shipping_threshold" => (float)($raw['free_shipping_threshold'] ?? 2499),
        "standard_shipping_fee" => (float)($raw['standard_shipping_fee'] ?? 150),
        "enable_cod" => false,
        "currency_symbol" => "₹",
        "razorpay_key_id" => !empty($raw['razorpay_key_id']) ? $raw['razorpay_key_id'] : RAZORPAY_KEY_ID,
        "imagekit_public_key" => $raw['imagekit_public_key'] ?? "",
        "imagekit_url_endpoint" => $raw['imagekit_url_endpoint'] ?? ""
    ];

    echo json_encode(["success" => true, "data" => $public_settings]);
} catch (Exception $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Failed to load public settings."]);
}
?>
