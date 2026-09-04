<?php
// Public Partners Directory Endpoint
require_once __DIR__ . '/../config/db.php';

header("Content-Type: application/json; charset=UTF-8");

try {
    $stmt = $pdo->query("SELECT * FROM partners WHERE is_active = 1 ORDER BY display_order ASC, id DESC");
    $partnersRaw = $stmt->fetchAll();
    
    $partners = [];
    foreach ($partnersRaw as $p) {
        $partners[] = [
            "id" => (int)$p['id'],
            "name" => $p['name'],
            "partner_type" => $p['partner_type'] ?? 'Hotel',
            "logo_url" => $p['logo_url'] ?? '',
            "description" => $p['description'] ?? '',
            "website" => $p['website'] ?? '',
            "display_order" => (int)($p['display_order'] ?? 1),
            "is_active" => (bool)$p['is_active']
        ];
    }
    echo json_encode(["success" => true, "data" => $partners]);
} catch (Exception $e) {
    error_log("Public Partners Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Failed to fetch partners directory."]);
}
?>
