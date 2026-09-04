<?php
// Public Product Catalog Endpoint with SQL filtering and pagination
require_once __DIR__ . '/../config/db.php';

header("Content-Type: application/json; charset=UTF-8");

try {
    $search = trim($_GET['q'] ?? $_GET['search'] ?? '');
    $segment = trim($_GET['segment'] ?? '');
    $product_type = trim($_GET['product_type'] ?? '');
    $production_type = trim($_GET['production_type'] ?? '');
    $sales_availability = trim($_GET['sales_availability'] ?? '');
    $is_featured = isset($_GET['is_featured']) ? ($_GET['is_featured'] === '1' || $_GET['is_featured'] === 'true') : false;
    $is_new_arrival = isset($_GET['is_new_arrival']) ? ($_GET['is_new_arrival'] === '1' || $_GET['is_new_arrival'] === 'true') : false;

    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = isset($_GET['limit']) ? max(1, min(100, (int)$_GET['limit'])) : null;

    $where = ["is_active = 1"];
    $params = [];

    if (!empty($search)) {
        $where[] = "(name LIKE :search OR sku LIKE :search OR description LIKE :search OR short_description LIKE :search OR material LIKE :search OR color LIKE :search)";
        $params[':search'] = '%' . $search . '%';
    }

    if (!empty($segment)) {
        $where[] = "segment = :segment";
        $params[':segment'] = $segment;
    }

    if (!empty($product_type)) {
        $where[] = "product_type = :product_type";
        $params[':product_type'] = $product_type;
    }

    if (!empty($production_type)) {
        $where[] = "production_type = :production_type";
        $params[':production_type'] = $production_type;
    }

    if (!empty($sales_availability)) {
        $where[] = "(sales_availability = :sales_avail OR sales_availability = 'Both')";
        $params[':sales_avail'] = $sales_availability;
    }

    if ($is_featured) {
        $where[] = "is_featured = 1";
    }

    if ($is_new_arrival) {
        $where[] = "is_new_arrival = 1";
    }

    $whereClause = implode(" AND ", $where);

    // Get Total Count for Pagination metadata if needed
    $countSql = "SELECT COUNT(*) FROM products WHERE " . $whereClause;
    $countStmt = $pdo->prepare($countSql);
    $countStmt->execute($params);
    $totalCount = (int)$countStmt->fetchColumn();

    $sql = "SELECT * FROM products WHERE " . $whereClause . " ORDER BY id DESC";

    if ($limit !== null) {
        $offset = ($page - 1) * $limit;
        $sql .= " LIMIT " . (int)$limit . " OFFSET " . (int)$offset;
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll();

    // Decode JSON images & cast numeric fields for each product
    foreach ($products as &$p) {
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
    }

    echo json_encode([
        "success" => true,
        "data" => $products,
        "total" => $totalCount,
        "page" => $page,
        "limit" => $limit
    ]);
} catch (Exception $e) {
    error_log("Get Products Catalog Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Failed to load catalog products."]);
}
?>
