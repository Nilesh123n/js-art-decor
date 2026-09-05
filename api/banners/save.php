<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/admin_auth.php';
validateAdmin();

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || empty($data['title']) || empty($data['image_url'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Title and Image URL are required."]);
    exit();
}

try {
    $id = isset($data['id']) ? (int)$data['id'] : 0;
    $title = trim($data['title']);
    $subtitle = trim($data['subtitle'] ?? '');
    $highlight_text = trim($data['highlight_text'] ?? '');
    $description = trim($data['description'] ?? '');
    $image_url = trim($data['image_url']);
    $link_url = trim($data['link_url'] ?? '');
    $button_text = trim($data['button_text'] ?? '');
    $banner_type = $data['banner_type'] ?? 'hero';
    $display_order = isset($data['display_order']) ? (int)$data['display_order'] : 1;
    $is_active = isset($data['is_active']) ? ((bool)$data['is_active'] ? 1 : 0) : 1;

    if ($id > 0) {
        $stmt = $pdo->prepare("UPDATE banners SET 
            title = :title, 
            subtitle = :subtitle, 
            highlight_text = :highlight_text,
            description = :description, 
            image_url = :image_url, 
            link_url = :link_url, 
            button_text = :button_text, 
            banner_type = :banner_type, 
            display_order = :display_order, 
            is_active = :is_active 
            WHERE id = :id");
        $stmt->execute([
            ':title' => $title,
            ':subtitle' => $subtitle,
            ':highlight_text' => $highlight_text,
            ':description' => $description,
            ':image_url' => $image_url,
            ':link_url' => $link_url,
            ':button_text' => $button_text,
            ':banner_type' => $banner_type,
            ':display_order' => $display_order,
            ':is_active' => $is_active,
            ':id' => $id
        ]);

        echo json_encode(["success" => true, "message" => "Banner updated in database.", "id" => $id]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO banners (
            title, subtitle, highlight_text, description, image_url, link_url, button_text, banner_type, display_order, is_active
        ) VALUES (
            :title, :subtitle, :highlight_text, :description, :image_url, :link_url, :button_text, :banner_type, :display_order, :is_active
        )");
        $stmt->execute([
            ':title' => $title,
            ':subtitle' => $subtitle,
            ':highlight_text' => $highlight_text,
            ':description' => $description,
            ':image_url' => $image_url,
            ':link_url' => $link_url,
            ':button_text' => $button_text,
            ':banner_type' => $banner_type,
            ':display_order' => $display_order,
            ':is_active' => $is_active
        ]);

        $newId = (int)$pdo->lastInsertId();
        echo json_encode(["success" => true, "message" => "Banner created in database.", "id" => $newId]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
