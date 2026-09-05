<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/db.php';

// Helper to fetch ImageKit settings from database or environment
function getImageKitConfig($pdo) {
    $config = [
        'public_key' => getenv('IMAGEKIT_PUBLIC_KEY') ?: '',
        'private_key' => getenv('IMAGEKIT_PRIVATE_KEY') ?: '',
        'url_endpoint' => getenv('IMAGEKIT_URL_ENDPOINT') ?: ''
    ];

    try {
        $stmt = $pdo->query("SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('imagekit_public_key', 'imagekit_private_key', 'imagekit_url_endpoint')");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            if ($row['setting_key'] === 'imagekit_public_key' && !empty($row['setting_value'])) {
                $config['public_key'] = $row['setting_value'];
            }
            if ($row['setting_key'] === 'imagekit_private_key' && !empty($row['setting_value'])) {
                $config['private_key'] = $row['setting_value'];
            }
            if ($row['setting_key'] === 'imagekit_url_endpoint' && !empty($row['setting_value'])) {
                $config['url_endpoint'] = rtrim($row['setting_value'], '/');
            }
        }
    } catch (Exception $e) {
        // Fallback to env
    }

    return $config;
}

$action = $_GET['action'] ?? '';

// ACTION: TEST IMAGEKIT CONNECTION
if ($action === 'test') {
    $config = getImageKitConfig($pdo);
    if (empty($config['private_key'])) {
        echo json_encode([
            "success" => false,
            "message" => "ImageKit Private Key is not configured yet. Please enter it in Admin Settings."
        ]);
        exit();
    }

    // Ping ImageKit authentication or list files
    $ch = curl_init('https://api.imagekit.io/v1/files?limit=1');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_USERPWD, $config['private_key'] . ':');
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode >= 200 && $httpCode < 300) {
        echo json_encode([
            "success" => true,
            "message" => "ImageKit connected successfully to Hostinger!",
            "endpoint" => $config['url_endpoint']
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "ImageKit authentication failed (HTTP {$httpCode}). Please check your Private Key.",
            "raw" => $response
        ]);
    }
    exit();
}

// ACTION: GET AUTH PARAMS (Token, Expire, Signature) for Client-side Direct Upload
if ($action === 'auth') {
    $config = getImageKitConfig($pdo);
    if (empty($config['private_key'])) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "ImageKit Private Key not configured."
        ]);
        exit();
    }

    $token = bin2hex(random_bytes(16));
    $expire = time() + 1800; // 30 minutes
    $signature = hash_hmac('sha1', $token . $expire, $config['private_key']);

    echo json_encode([
        "token" => $token,
        "expire" => $expire,
        "signature" => $signature,
        "publicKey" => $config['public_key'],
        "urlEndpoint" => $config['url_endpoint']
    ]);
    exit();
}

// ACTION: UPLOAD FILE (Multipart or URL or Base64)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $config = getImageKitConfig($pdo);
    $folder = $_POST['folder'] ?? '/jsartdecor';
    $customName = $_POST['fileName'] ?? '';

    $fileToUpload = null;
    $fileName = null;

    // Check if uploaded as multipart file
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $fileToUpload = $_FILES['image']['tmp_name'];
        $fileName = $customName ?: $_FILES['image']['name'];
    } elseif (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $fileToUpload = $_FILES['file']['tmp_name'];
        $fileName = $customName ?: $_FILES['file']['name'];
    } else {
        // Check raw JSON body
        $rawInput = file_get_contents('php://input');
        $json = json_decode($rawInput, true);
        if ($json && !empty($json['file'])) {
            $fileToUpload = $json['file']; // can be remote URL or base64
            $fileName = $customName ?: ($json['fileName'] ?? 'image_' . time() . '.jpg');
            if (!empty($json['folder'])) {
                $folder = $json['folder'];
            }
        }
    }

    if (!$fileToUpload) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "No file or image URL provided for upload."
        ]);
        exit();
    }

    // If ImageKit credentials exist, upload to ImageKit via cURL
    if (!empty($config['private_key'])) {
        $postFields = [
            'fileName' => $fileName,
            'folder' => $folder,
            'useUniqueFileName' => 'true'
        ];

        // If it's a local temp file, use CURLFile
        if (is_string($fileToUpload) && file_exists($fileToUpload)) {
            $postFields['file'] = new CURLFile($fileToUpload, mime_content_type($fileToUpload), $fileName);
        } else {
            // URL or base64 string
            $postFields['file'] = $fileToUpload;
        }

        $ch = curl_init('https://upload.imagekit.io/api/v1/files/upload');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
        curl_setopt($ch, CURLOPT_USERPWD, $config['private_key'] . ':');
        curl_setopt($ch, CURLOPT_TIMEOUT, 60);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "ImageKit upload network error: " . $curlError
            ]);
            exit();
        }

        $resData = json_decode($response, true);

        if ($httpCode >= 200 && $httpCode < 300 && isset($resData['url'])) {
            echo json_encode([
                "success" => true,
                "url" => $resData['url'],
                "image_url" => $resData['url'],
                "thumbnailUrl" => $resData['thumbnailUrl'] ?? $resData['url'],
                "fileId" => $resData['fileId'] ?? '',
                "name" => $resData['name'] ?? $fileName,
                "provider" => "imagekit",
                "width" => $resData['width'] ?? null,
                "height" => $resData['height'] ?? null,
                "size" => $resData['size'] ?? null
            ]);
            exit();
        } else {
            // ImageKit rejected or error
            $errMessage = $resData['message'] ?? 'ImageKit upload failed.';
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => $errMessage,
                "details" => $resData
            ]);
            exit();
        }
    } else {
        // Fallback: Save to local Hostinger uploads folder until admin enters ImageKit keys
        $uploadsDir = __DIR__ . '/../../uploads';
        if (!is_dir($uploadsDir)) {
            mkdir($uploadsDir, 0755, true);
        }

        $cleanName = preg_replace('/[^a-zA-Z0-9._-]/', '_', $fileName);
        $targetFile = $uploadsDir . '/' . time() . '_' . $cleanName;

        if (is_string($fileToUpload) && file_exists($fileToUpload)) {
            if (move_uploaded_file($fileToUpload, $targetFile) || copy($fileToUpload, $targetFile)) {
                $relativeUrl = '/uploads/' . basename($targetFile);
                echo json_encode([
                    "success" => true,
                    "url" => $relativeUrl,
                    "image_url" => $relativeUrl,
                    "provider" => "local_hostinger",
                    "note" => "Saved locally. Add ImageKit keys in Admin Settings for instant CDN optimization."
                ]);
                exit();
            }
        }

        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Unable to process image. Configure ImageKit keys in Admin Settings."
        ]);
        exit();
    }
}
?>
