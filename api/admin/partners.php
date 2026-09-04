<?php
// Admin Partners Management Endpoint (Individual CRUD Operations with Session & CSRF Protection)
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/csrf.php';

header("Content-Type: application/json; charset=UTF-8");

require_admin_auth();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? null;

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM partners ORDER BY display_order ASC, id DESC");
        $partners = $stmt->fetchAll();
        foreach ($partners as &$p) {
            $p['id'] = (int)$p['id'];
            $p['display_order'] = (int)($p['display_order'] ?? 1);
            $p['is_active'] = (bool)$p['is_active'];
            $p['partner_type'] = $p['partner_type'] ?? 'Hotel';
            $p['website'] = $p['website'] ?? '';
            $p['logo_url'] = $p['logo_url'] ?? '';
            $p['description'] = $p['description'] ?? '';
        }
        echo json_encode(["success" => true, "data" => $partners]);
    } catch (Exception $e) {
        error_log("Get Partners Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to fetch partners."]);
    }
    exit();
}

validate_csrf_token();

if ($action === 'create' || ($method === 'POST' && $action !== 'update' && $action !== 'delete')) {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Payload required."]);
        exit();
    }

    // Handle Bulk Array Update
    if (!empty($input['partners']) && is_array($input['partners'])) {
        try {
            $pdo->beginTransaction();
            foreach ($input['partners'] as $p) {
                if (empty($p['name'])) continue;
                $name = trim($p['name']);
                $ptype = !empty($p['partner_type']) ? trim($p['partner_type']) : 'Hotel';
                $logo = $p['logo_url'] ?? '';
                $desc = $p['description'] ?? '';
                $web = $p['website'] ?? '';
                $dorder = (int)($p['display_order'] ?? 1);
                $active = isset($p['is_active']) ? ($p['is_active'] ? 1 : 0) : 1;

                if (!empty($p['id'])) {
                    $stmt = $pdo->prepare("
                        UPDATE partners SET name = :name, partner_type = :ptype, logo_url = :logo,
                        description = :desc, website = :web, display_order = :dorder, is_active = :active, updated_at = NOW()
                        WHERE id = :id
                    ");
                    $stmt->execute([
                        ':id' => (int)$p['id'], ':name' => $name, ':ptype' => $ptype, ':logo' => $logo,
                        ':desc' => $desc, ':web' => $web, ':dorder' => $dorder, ':active' => $active
                    ]);
                } else {
                    $stmt = $pdo->prepare("
                        INSERT INTO partners (name, partner_type, logo_url, description, website, display_order, is_active, created_at, updated_at)
                        VALUES (:name, :ptype, :logo, :desc, :web, :dorder, :active, NOW(), NOW())
                    ");
                    $stmt->execute([
                        ':name' => $name, ':ptype' => $ptype, ':logo' => $logo,
                        ':desc' => $desc, ':web' => $web, ':dorder' => $dorder, ':active' => $active
                    ]);
                }
            }
            $pdo->commit();
            echo json_encode(["success" => true, "message" => "Partners updated successfully."]);
        } catch (Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            error_log("Bulk Partner Save Error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Failed to save partners."]);
        }
        exit();
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO partners (name, partner_type, logo_url, description, website, display_order, is_active, created_at, updated_at)
            VALUES (:name, :ptype, :logo, :desc, :web, :dorder, :active, NOW(), NOW())
        ");
        $stmt->execute([
            ':name' => trim($input['name']),
            ':ptype' => !empty($input['partner_type']) ? trim($input['partner_type']) : 'Hotel',
            ':logo' => $input['logo_url'] ?? '',
            ':desc' => $input['description'] ?? '',
            ':web' => $input['website'] ?? '',
            ':dorder' => (int)($input['display_order'] ?? 1),
            ':active' => isset($input['is_active']) ? ($input['is_active'] ? 1 : 0) : 1
        ]);

        echo json_encode([
            "success" => true,
            "id" => (int)$pdo->lastInsertId(),
            "message" => "Hospitality partner added successfully."
        ]);

    } catch (Exception $e) {
        error_log("Add Partner Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to add hospitality partner."]);
    }
    exit();
}

if ($action === 'update' || $method === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || empty($input['id']) || empty($input['name'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Partner ID and Name required for update."]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("
            UPDATE partners SET 
                name = :name, partner_type = :ptype, logo_url = :logo,
                description = :desc, website = :web, display_order = :dorder,
                is_active = :active, updated_at = NOW()
            WHERE id = :id
        ");
        $stmt->execute([
            ':id' => (int)$input['id'],
            ':name' => trim($input['name']),
            ':ptype' => !empty($input['partner_type']) ? trim($input['partner_type']) : 'Hotel',
            ':logo' => $input['logo_url'] ?? '',
            ':desc' => $input['description'] ?? '',
            ':web' => $input['website'] ?? '',
            ':dorder' => (int)($input['display_order'] ?? 1),
            ':active' => !empty($input['is_active']) ? 1 : 0
        ]);

        echo json_encode(["success" => true, "message" => "Hospitality partner updated successfully."]);

    } catch (Exception $e) {
        error_log("Update Partner Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to update hospitality partner."]);
    }
    exit();
}

if ($action === 'delete' || $method === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = (int)($input['id'] ?? $_GET['id'] ?? 0);

    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Partner ID required for deletion."]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM partners WHERE id = :id");
        $stmt->execute([':id' => $id]);
        echo json_encode(["success" => true, "message" => "Hospitality partner removed successfully."]);
    } catch (Exception $e) {
        error_log("Delete Partner Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to delete partner."]);
    }
    exit();
}
?>
