<?php
// Admin Authentication Endpoint (password_verify, Session Security, CSRF Generation)
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/csrf.php';

header("Content-Type: application/json; charset=UTF-8");

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Check Session Status
    if (!empty($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
        echo json_encode([
            "authenticated" => true,
            "username" => $_SESSION['admin_username'] ?? 'admin',
            "csrf_token" => get_csrf_token()
        ]);
    } else {
        echo json_encode(["authenticated" => false]);
    }
    exit();
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? 'login';

    if ($action === 'logout') {
        $_SESSION = array();
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        session_destroy();
        echo json_encode(["success" => true, "message" => "Logged out successfully."]);
        exit();
    }

    if ($action === 'login') {
        $username = trim($input['username'] ?? '');
        $password = trim($input['password'] ?? '');

        if (empty($username) || empty($password)) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Username and password required."]);
            exit();
        }

        $stmt = $pdo->prepare("SELECT * FROM admins WHERE username = :u LIMIT 1");
        $stmt->execute([':u' => $username]);
        $admin = $stmt->fetch();

        if ($admin && password_verify($password, $admin['password_hash'])) {
            // Prevent Session Fixation
            session_regenerate_id(true);

            $_SESSION['admin_logged_in'] = true;
            $_SESSION['admin_user_id'] = $admin['id'];
            $_SESSION['admin_username'] = $admin['username'];

            $csrf_token = get_csrf_token();

            echo json_encode([
                "success" => true,
                "message" => "Authentication successful.",
                "username" => $admin['username'],
                "csrf_token" => $csrf_token
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["success" => false, "error" => "Invalid username or passcode."]);
        }
        exit();
    }
}

http_response_code(405);
echo json_encode(["success" => false, "error" => "Method not allowed."]);
?>
