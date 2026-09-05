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
    $page = $_GET['page'] ?? '';
    $all = isset($_GET['all']) && $_GET['all'] === 'true';

    $query = "SELECT * FROM page_sections WHERE 1=1";
    $params = [];

    if (!$all) {
        $query .= " AND is_active = 1";
    }

    if (!empty($page)) {
        $query .= " AND page_name = :page";
        $params[':page'] = $page;
    }

    $query .= " ORDER BY display_order ASC, id ASC";

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $sections = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($sections as &$s) {
        $s['id'] = (int)$s['id'];
        $s['display_order'] = (int)$s['display_order'];
        $s['is_active'] = (bool)$s['is_active'];
        if (!empty($s['extra_data']) && is_string($s['extra_data'])) {
            $s['extra_data'] = json_decode($s['extra_data'], true);
        }
    }

    echo json_encode([
        "success" => true,
        "data" => $sections
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>
