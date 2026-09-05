<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/db.php';

try {
    $type = $_GET['type'] ?? '';
    $all = isset($_GET['all']) && $_GET['all'] === 'true';

    $query = "SELECT * FROM banners WHERE 1=1";
    $params = [];

    if (!$all) {
        $query .= " AND is_active = 1";
    }

    if (!empty($type)) {
        $query .= " AND banner_type = :type";
        $params[':type'] = $type;
    }

    $query .= " ORDER BY display_order ASC, id DESC";

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $banners = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format boolean
    foreach ($banners as &$b) {
        $b['id'] = (int)$b['id'];
        $b['display_order'] = (int)$b['display_order'];
        $b['is_active'] = (bool)$b['is_active'];
    }

    echo json_encode([
        "success" => true,
        "data" => $banners
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>
