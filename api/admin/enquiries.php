<?php
// Admin Enquiry Messages Endpoint
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/csrf.php';

header("Content-Type: application/json; charset=UTF-8");

require_admin_auth();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM contact_messages ORDER BY id DESC");
        $messages = $stmt->fetchAll();
        foreach ($messages as &$m) {
            $m['is_read'] = (bool)$m['is_read'];
        }
        echo json_encode(["success" => true, "data" => $messages]);
    } catch (Exception $e) {
        error_log("Get Enquiries Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to fetch enquiries."]);
    }
    exit();
}

validate_csrf_token();

if ($method === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (empty($input['id'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Message ID required."]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("UPDATE contact_messages SET is_read = :read WHERE id = :id");
        $stmt->execute([
            ':read' => !empty($input['is_read']) ? 1 : 0,
            ':id' => $input['id']
        ]);
        echo json_encode(["success" => true, "message" => "Message status updated."]);
    } catch (Exception $e) {
        error_log("Update Enquiry Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to update enquiry status."]);
    }
    exit();
}
?>
