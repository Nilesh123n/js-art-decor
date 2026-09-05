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

if (!$data || empty($data['section_key']) || empty($data['title'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Section key and Title are required."]);
    exit();
}

try {
    $section_key = trim($data['section_key']);
    $page_name = trim($data['page_name'] ?? 'home');
    $title = trim($data['title']);
    $subtitle = trim($data['subtitle'] ?? '');
    $badge = trim($data['badge'] ?? '');
    $content = trim($data['content'] ?? '');
    $image_url = trim($data['image_url'] ?? '');
    $button_text = trim($data['button_text'] ?? '');
    $button_url = trim($data['button_url'] ?? '');
    $extra_data = isset($data['extra_data']) ? (is_string($data['extra_data']) ? $data['extra_data'] : json_encode($data['extra_data'])) : null;
    $is_active = isset($data['is_active']) ? ((bool)$data['is_active'] ? 1 : 0) : 1;
    $display_order = isset($data['display_order']) ? (int)$data['display_order'] : 1;

    $stmt = $pdo->prepare("INSERT INTO page_sections (
        page_name, section_key, title, subtitle, badge, content, image_url, button_text, button_url, extra_data, is_active, display_order
    ) VALUES (
        :page_name, :section_key, :title, :subtitle, :badge, :content, :image_url, :button_text, :button_url, :extra_data, :is_active, :display_order
    ) ON DUPLICATE KEY UPDATE 
        page_name = VALUES(page_name),
        title = VALUES(title),
        subtitle = VALUES(subtitle),
        badge = VALUES(badge),
        content = VALUES(content),
        image_url = VALUES(image_url),
        button_text = VALUES(button_text),
        button_url = VALUES(button_url),
        extra_data = VALUES(extra_data),
        is_active = VALUES(is_active),
        display_order = VALUES(display_order)
    ");

    $stmt->execute([
        ':page_name' => $page_name,
        ':section_key' => $section_key,
        ':title' => $title,
        ':subtitle' => $subtitle,
        ':badge' => $badge,
        ':content' => $content,
        ':image_url' => $image_url,
        ':button_text' => $button_text,
        ':button_url' => $button_url,
        ':extra_data' => $extra_data,
        ':is_active' => $is_active,
        ':display_order' => $display_order
    ]);

    echo json_encode(["success" => true, "message" => "Section updated successfully."]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
