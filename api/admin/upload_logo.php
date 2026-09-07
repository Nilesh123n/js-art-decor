<?php
// Admin Header Logo Upload & Database Sync Endpoint
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/csrf.php';

header("Content-Type: application/json; charset=UTF-8");

require_admin_auth();
validate_csrf_token();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed. Only POST is accepted."]);
    exit();
}

$uploadsDir = __DIR__ . '/../../uploads';
if (!file_exists($uploadsDir)) {
    mkdir($uploadsDir, 0755, true);
}

$logoUrl = null;

// Case 1: Standard Multipart Form File Upload
if (isset($_FILES['logo']) && $_FILES['logo']['error'] === UPLOAD_ERR_OK) {
    $fileTmpPath = $_FILES['logo']['tmp_name'];
    $fileName = $_FILES['logo']['name'];
    $fileSize = $_FILES['logo']['size'];
    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

    $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'];
    if (!in_array($fileExtension, $allowedExtensions)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Invalid file format. Allowed: JPG, PNG, WEBP, SVG, GIF."]);
        exit();
    }

    if ($fileSize > 5 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "File size exceeds 5MB limit."]);
        exit();
    }

    $newFileName = 'header_logo_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $fileExtension;
    $destPath = $uploadsDir . '/' . $newFileName;

    if (move_uploaded_file($fileTmpPath, $destPath)) {
        $logoUrl = '/uploads/' . $newFileName;
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to save uploaded file on server."]);
        exit();
    }
} else {
    // Case 2: JSON Body with Base64 Data URI or Direct URL
    $input = json_decode(file_get_contents('php://input'), true);

    if (isset($input['logo_data']) && is_string($input['logo_data'])) {
        $data = $input['logo_data'];
        if (preg_match('/^data:image\/(\w+);base64,/', $data, $type)) {
            $data = substr($data, strpos($data, ',') + 1);
            $type = strtolower($type[1]); // jpg, png, gif, svg+xml, webp
            if ($type === 'svg+xml') $type = 'svg';

            $allowed = ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'];
            if (!in_array($type, $allowed)) {
                $type = 'png';
            }

            $decoded = base64_decode($data);
            if ($decoded === false) {
                http_response_code(400);
                echo json_encode(["success" => false, "error" => "Base64 decode failed."]);
                exit();
            }

            $newFileName = 'header_logo_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $type;
            $destPath = $uploadsDir . '/' . $newFileName;

            if (file_put_contents($destPath, $decoded)) {
                $logoUrl = '/uploads/' . $newFileName;
            } else {
                http_response_code(500);
                echo json_encode(["success" => false, "error" => "Failed to write logo file to disk."]);
                exit();
            }
        }
    } elseif (isset($input['logo_url']) && is_string($input['logo_url']) && filter_var($input['logo_url'], FILTER_VALIDATE_URL)) {
        $logoUrl = trim($input['logo_url']);
    }
}

if (!$logoUrl) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "No valid logo image provided."]);
    exit();
}

// Persist logo_path and logo_url into MySQL database settings table
try {
    $stmt = $pdo->prepare("
        INSERT INTO settings (setting_key, setting_value)
        VALUES ('logo_path', :logo), ('logo_url', :logo)
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
    ");
    $stmt->execute([':logo' => $logoUrl]);

    echo json_encode([
        "success" => true,
        "logo_url" => $logoUrl,
        "logo_path" => $logoUrl,
        "message" => "Header logo uploaded and updated in database successfully."
    ]);
} catch (Exception $e) {
    error_log("Logo database update failed: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Database update failed: " . $e->getMessage()]);
}
?>
