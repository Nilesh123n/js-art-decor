<?php
// Admin Site Settings Endpoint
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/csrf.php';

header("Content-Type: application/json; charset=UTF-8");

require_admin_auth();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT setting_key, setting_value FROM settings");
        $raw = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
        echo json_encode(["success" => true, "data" => $raw]);
    } catch (Exception $e) {
        error_log("Get Admin Settings Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to fetch site settings."]);
    }
    exit();
}

validate_csrf_token();

if ($method === 'POST' || $method === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Invalid payload format."]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO settings (setting_key, setting_value)
            VALUES (:key, :val)
            ON DUPLICATE KEY UPDATE setting_value = :val
        ");

        foreach ($input as $key => $val) {
            $stmt->execute([':key' => $key, ':val' => (string)$val]);
        }

        echo json_encode(["success" => true, "message" => "Settings updated successfully."]);
    } catch (Exception $e) {
        error_log("Update Admin Settings Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to update site settings."]);
    }
    exit();
}
?>
