<?php
// Admin General Image Upload Endpoint (Blogs, Products, Banners)
// Supports multipart/form-data and JSON Base64 data URIs
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/csrf.php';

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_admin_auth();
validate_csrf_token();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed. Only POST is accepted."]);
    exit();
}

// Ensure uploads directory exists
$uploadsDir = __DIR__ . '/../../uploads';
if (!file_exists($uploadsDir)) {
    mkdir($uploadsDir, 0755, true);
}

$finalUrl = null;
$allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'];

// Case 1: Multipart File Upload ($_FILES)
if (isset($_FILES['image']) || isset($_FILES['file'])) {
    $fileObj = $_FILES['image'] ?? $_FILES['file'];
    if ($fileObj['error'] === UPLOAD_ERR_OK) {
        $fileTmp = $fileObj['tmp_name'];
        $origName = $fileObj['name'];
        $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));

        if (!in_array($ext, $allowedExtensions)) {
            $ext = 'jpg';
        }

        $safeName = preg_replace('/[^a-zA-Z0-9_-]/', '', pathinfo($origName, PATHINFO_FILENAME));
        $newFileName = 'img_' . time() . '_' . substr($safeName, 0, 30) . '.' . $ext;
        $destPath = $uploadsDir . '/' . $newFileName;

        if (move_uploaded_file($fileTmp, $destPath)) {
            $finalUrl = '/uploads/' . $newFileName;
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Failed to save uploaded file."]);
            exit();
        }
    }
}

// Case 2: JSON Body with Base64 Data URI or Direct URL
if (!$finalUrl) {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);

    if ($input) {
        $payload = $input['image_data'] ?? $input['file'] ?? $input['image'] ?? '';
        $fileName = $input['fileName'] ?? 'blog_img';

        if (is_string($payload) && preg_match('/^data:image\/([a-zA-Z0-9\+\-]+);base64,(.+)$/', $payload, $matches)) {
            $ext = strtolower($matches[1]);
            if ($ext === 'svg+xml') $ext = 'svg';
            if (!in_array($ext, $allowedExtensions)) {
                $ext = 'jpg';
            }

            $base64Data = $matches[2];
            $decoded = base64_decode($base64Data);

            if ($decoded !== false) {
                $safeName = preg_replace('/[^a-zA-Z0-9_-]/', '', $fileName);
                $newFileName = 'img_' . time() . '_' . substr($safeName, 0, 30) . '.' . $ext;
                $destPath = $uploadsDir . '/' . $newFileName;

                if (file_put_contents($destPath, $decoded) !== false) {
                    $finalUrl = '/uploads/' . $newFileName;
                }
            }
        } elseif (is_string($payload) && (strpos($payload, 'http://') === 0 || strpos($payload, 'https://') === 0)) {
            $finalUrl = trim($payload);
        }
    }
}

if ($finalUrl) {
    echo json_encode([
        "success" => true,
        "url" => $finalUrl,
        "image_url" => $finalUrl,
        "message" => "Image uploaded successfully."
    ]);
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "No valid image data or file provided."]);
}
?>
