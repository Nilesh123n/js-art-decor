<?php
// Public Single Product Detail Endpoint
require_once __DIR__ . '/../config/db.php';

header("Content-Type: application/json; charset=UTF-8");

$id = $_GET['id'] ?? null;
$slug = $_GET['slug'] ?? null;

if (!$id && !$slug) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Product ID or slug required."]);
    exit();
}

try {
    if ($id) {
        $stmt = $pdo->prepare("SELECT * FROM products WHERE id = :id AND is_active = 1 LIMIT 1");
        $stmt->execute([':id' => (int)$id]);
    } else {
        $stmt = $pdo->prepare("SELECT * FROM products WHERE slug = :slug AND is_active = 1 LIMIT 1");
        $stmt->execute([':slug' => trim($slug)]);
    }

    $p = $stmt->fetch();

    if (!$p) {
        http_response_code(404);
        echo json_encode(["success" => false, "error" => "Product not found."]);
        exit();
    }

    $p['id'] = (int)$p['id'];
    $p['images'] = !empty($p['images']) ? json_decode($p['images'], true) : [];
    $p['retail_price'] = (float)$p['retail_price'];
    $p['wholesale_price'] = (float)$p['wholesale_price'];
    $p['stock_quantity'] = (int)$p['stock_quantity'];
    $p['min_wholesale_qty'] = (int)$p['min_wholesale_qty'];
    $p['is_featured'] = (bool)$p['is_featured'];
    $p['is_new_arrival'] = (bool)$p['is_new_arrival'];
    $p['is_active'] = (bool)$p['is_active'];
    $p['short_description'] = $p['short_description'] ?? '';
    $p['size'] = $p['size'] ?? '';
    $p['material'] = $p['material'] ?? '';
    $p['color'] = $p['color'] ?? '';

    echo json_encode(["success" => true, "data" => $p]);
} catch (Exception $e) {
    error_log("Get Product Detail Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Failed to fetch product details."]);
}
?>
