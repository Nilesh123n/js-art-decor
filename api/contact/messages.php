<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/admin_auth.php';
validateAdmin();

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM contact_messages ORDER BY is_read ASC, created_at DESC");
        $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($messages as &$m) {
            $m['id'] = (int)$m['id'];
            $m['is_read'] = (bool)$m['is_read'];
        }

        echo json_encode(["success" => true, "data" => $messages]);
        exit();
    }

    if ($method === 'PUT' || $method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $id = isset($data['id']) ? (int)$data['id'] : 0;
        $is_read = isset($data['is_read']) ? ((bool)$data['is_read'] ? 1 : 0) : 1;

        if ($id > 0) {
            $stmt = $pdo->prepare("UPDATE contact_messages SET is_read = :is_read WHERE id = :id");
            $stmt->execute([':is_read' => $is_read, ':id' => $id]);
            echo json_encode(["success" => true, "message" => "Message status updated."]);
        } else {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Invalid ID."]);
        }
        exit();
    }

    if ($method === 'DELETE') {
        $data = json_decode(file_get_contents("php://input"), true);
        $id = isset($data['id']) ? (int)$data['id'] : (isset($_GET['id']) ? (int)$_GET['id'] : 0);

        if ($id > 0) {
            $stmt = $pdo->prepare("DELETE FROM contact_messages WHERE id = :id");
            $stmt->execute([':id' => $id]);
            echo json_encode(["success" => true, "message" => "Message deleted."]);
        } else {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Invalid ID."]);
        }
        exit();
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
