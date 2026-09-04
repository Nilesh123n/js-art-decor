<?php
// Session & Administrative Authentication Middleware
if (session_status() === PHP_SESSION_NONE) {
    // Configure secure session cookie options BEFORE starting session
    $is_secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443);
    
    session_set_cookie_params([
        'lifetime' => 86400, // 24 hours
        'path' => '/',
        'domain' => '',
        'secure' => $is_secure,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    
    ini_set('session.use_strict_mode', 1);
    session_start();
}

/**
 * Ensures request is from an authenticated admin session
 */
function require_admin_auth() {
    if (empty($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
        http_response_code(401);
        header("Content-Type: application/json; charset=UTF-8");
        echo json_encode([
            "success" => false,
            "error" => "Unauthorized access. Valid admin session required."
        ]);
        exit();
    }
}
?>
