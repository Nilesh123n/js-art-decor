<?php
// CSRF Protection Middleware
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Generate or retrieve the CSRF token for the current session
 */
function get_csrf_token() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * Validate incoming CSRF token for state-changing requests (POST, PUT, DELETE)
 */
function validate_csrf_token() {
    $method = $_SERVER['REQUEST_METHOD'];
    if (in_array($method, ['POST', 'PUT', 'DELETE', 'PATCH'])) {
        $headers = getallheaders();
        $token = $headers['X-CSRF-Token'] ?? $headers['x-csrf-token'] ?? $_POST['csrf_token'] ?? '';
        
        if (empty($token) || empty($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $token)) {
            http_response_code(403);
            header("Content-Type: application/json; charset=UTF-8");
            echo json_encode([
                "success" => false,
                "error" => "CSRF token validation failed. Unauthorized request signature."
            ]);
            exit();
        }
    }
}
?>
