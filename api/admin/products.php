<?php
// Admin Product Management (CRUD + Secure Image File Upload)
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/csrf.php';

header("Content-Type: application/json; charset=UTF-8");

require_admin_auth();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM products ORDER BY id DESC");
        $products = $stmt->fetchAll();

        foreach ($products as &$p) {
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

        echo json_encode(["success" => true, "data" => $products]);
    } catch (Exception $e) {
        error_log("Get Admin Products Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to fetch products."]);
    }
    exit();
}

validate_csrf_token();

if ($method === 'POST') {
    // Check if handling Image Upload
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['image'];
        
        // 1. Max File Size Check (5MB)
        if ($file['size'] > 5 * 1024 * 1024) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "File size exceeds maximum allowed 5MB."]);
            exit();
        }

        // 2. MIME Type Validation
        $allowed_mimes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime_type = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!array_key_exists($mime_type, $allowed_mimes)) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Invalid image type. Only JPG, PNG, and WebP are allowed."]);
            exit();
        }

        // 3. Image Integrity Verification
        $image_info = @getimagesize($file['tmp_name']);
        if ($image_info === false) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Uploaded file is not a valid image."]);
            exit();
        }

        // 4. Secure Random Filename
        $upload_dir = __DIR__ . '/../../uploads/products/';
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0755, true);
        }

        $ext = $allowed_mimes[$mime_type];
        $filename = 'prod_' . bin2hex(random_bytes(12)) . '.' . $ext;
        $target_file = $upload_dir . $filename;

        if (move_uploaded_file($file['tmp_name'], $target_file)) {
            $public_url = '/uploads/products/' . $filename;
            echo json_encode(["success" => true, "image_url" => $public_url]);
            exit();
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Failed to save uploaded image file."]);
            exit();
        }
    }

    // Creating Product
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = $_POST;
    }

    if (empty($input['name']) || empty($input['sku']) || !isset($input['retail_price'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Product Name, SKU, and Retail Price are required."]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO products (
                name, slug, sku, description, short_description, segment, product_type, production_type,
                sales_availability, retail_price, wholesale_price, min_wholesale_qty,
                stock_quantity, size, material, color, is_featured, is_new_arrival, is_active, images, created_at, updated_at
            ) VALUES (
                :name, :slug, :sku, :desc, :sdesc, :segment, :ptype, :prodtype,
                :sales, :rprice, :wprice, :minwqty,
                :stock, :size, :material, :color, :feat, :newarr, :active, :imgs, NOW(), NOW()
            )
        ");

        $images_json = is_array($input['images'] ?? null) ? json_encode($input['images']) : '[]';
        $slug = !empty($input['slug']) ? $input['slug'] : strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $input['name'])));

        $stmt->execute([
            ':name' => trim($input['name']),
            ':slug' => $slug,
            ':sku' => trim($input['sku']),
            ':desc' => $input['description'] ?? '',
            ':sdesc' => $input['short_description'] ?? '',
            ':segment' => $input['segment'] ?? 'Home',
            ':ptype' => $input['product_type'] ?? 'Bedsheet',
            ':prodtype' => $input['production_type'] ?? 'Handmade',
            ':sales' => $input['sales_availability'] ?? 'Both',
            ':rprice' => (float)$input['retail_price'],
            ':wprice' => (float)($input['wholesale_price'] ?? 0),
            ':minwqty' => (int)($input['min_wholesale_qty'] ?? 10),
            ':stock' => (int)($input['stock_quantity'] ?? 0),
            ':size' => $input['size'] ?? '',
            ':material' => $input['material'] ?? '',
            ':color' => $input['color'] ?? '',
            ':feat' => !empty($input['is_featured']) ? 1 : 0,
            ':newarr' => !empty($input['is_new_arrival']) ? 1 : 0,
            ':active' => isset($input['is_active']) ? ($input['is_active'] ? 1 : 0) : 1,
            ':imgs' => $images_json
        ]);

        echo json_encode(["success" => true, "id" => $pdo->lastInsertId(), "message" => "Product created successfully."]);

    } catch (Exception $e) {
        error_log("Create Product Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to create product."]);
    }
    exit();
}

if ($method === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || empty($input['id'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Product ID required for update."]);
        exit();
    }

    try {
        $images_json = is_array($input['images'] ?? null) ? json_encode($input['images']) : '[]';

        $stmt = $pdo->prepare("
            UPDATE products SET
                name = :name, slug = :slug, sku = :sku, description = :desc, short_description = :sdesc,
                segment = :segment, product_type = :ptype, production_type = :prodtype, sales_availability = :sales,
                retail_price = :rprice, wholesale_price = :wprice, min_wholesale_qty = :minwqty,
                stock_quantity = :stock, size = :size, material = :material, color = :color,
                is_featured = :feat, is_new_arrival = :newarr, is_active = :active, images = :imgs, updated_at = NOW()
            WHERE id = :id
        ");

        $stmt->execute([
            ':id' => (int)$input['id'],
            ':name' => trim($input['name']),
            ':slug' => trim($input['slug']),
            ':sku' => trim($input['sku']),
            ':desc' => $input['description'] ?? '',
            ':sdesc' => $input['short_description'] ?? '',
            ':segment' => $input['segment'] ?? 'Home',
            ':ptype' => $input['product_type'] ?? 'Bedsheet',
            ':prodtype' => $input['production_type'] ?? 'Handmade',
            ':sales' => $input['sales_availability'] ?? 'Both',
            ':rprice' => (float)$input['retail_price'],
            ':wprice' => (float)($input['wholesale_price'] ?? 0),
            ':minwqty' => (int)($input['min_wholesale_qty'] ?? 10),
            ':stock' => (int)($input['stock_quantity'] ?? 0),
            ':size' => $input['size'] ?? '',
            ':material' => $input['material'] ?? '',
            ':color' => $input['color'] ?? '',
            ':feat' => !empty($input['is_featured']) ? 1 : 0,
            ':newarr' => !empty($input['is_new_arrival']) ? 1 : 0,
            ':active' => !empty($input['is_active']) ? 1 : 0,
            ':imgs' => $images_json
        ]);

        echo json_encode(["success" => true, "message" => "Product updated successfully."]);

    } catch (Exception $e) {
        error_log("Update Product Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to update product."]);
    }
    exit();
}

if ($method === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? $_GET['id'] ?? null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Product ID required for deletion."]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM products WHERE id = :id");
        $stmt->execute([':id' => $id]);
        echo json_encode(["success" => true, "message" => "Product deleted successfully."]);
    } catch (PDOException $e) {
        error_log("Delete Product FK constraint caught: " . $e->getMessage());
        try {
            $softStmt = $pdo->prepare("UPDATE products SET is_active = 0 WHERE id = :id");
            $softStmt->execute([':id' => $id]);
            echo json_encode(["success" => true, "message" => "Product marked inactive (soft deleted) as it is linked to past orders."]);
        } catch (Exception $ex) {
            error_log("Soft Delete Error: " . $ex->getMessage());
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Failed to delete product."]);
        }
    } catch (Exception $e) {
        error_log("Delete Product Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to delete product."]);
    }
    exit();
}
?>
