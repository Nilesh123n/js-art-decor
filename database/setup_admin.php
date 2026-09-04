<?php
// Command Line Script / First-Time Secure Admin Setup
// CLI Usage: php database/setup_admin.php <username> <password> [email]
require_once __DIR__ . '/../api/config/db.php';

if (php_sapi_name() === 'cli') {
    global $argv;
    $username = $argv[1] ?? null;
    $password = $argv[2] ?? null;
    $email = $argv[3] ?? 'admin@domain.com';

    if (!$username || !$password) {
        echo "Usage: php setup_admin.php <username> <password> [email]\n";
        exit(1);
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("INSERT INTO admins (username, password_hash, email) VALUES (:u, :p, :e) ON DUPLICATE KEY UPDATE password_hash = :p2");
    $stmt->execute([':u' => $username, ':p' => $hash, ':e' => $email, ':p2' => $hash]);
    echo "Admin user '{$username}' created/updated successfully.\n";
    exit(0);
} else {
    // If accessed via Web API, allow ONLY if admins table has 0 accounts
    $count = (int)$pdo->query("SELECT COUNT(*) FROM admins")->fetchColumn();
    if ($count > 0) {
        http_response_code(403);
        echo json_encode(["success" => false, "error" => "Admin setup disabled. Admin account already exists."]);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $username = trim($input['username'] ?? '');
    $password = trim($input['password'] ?? '');
    $email = trim($input['email'] ?? 'admin@domain.com');

    if (strlen($username) < 4 || strlen($password) < 8) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Username must be at least 4 characters and password at least 8 characters."]);
        exit();
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("INSERT INTO admins (username, password_hash, email) VALUES (:u, :p, :e)");
    $stmt->execute([':u' => $username, ':p' => $hash, ':e' => $email]);
    echo json_encode(["success" => true, "message" => "Initial admin account created successfully."]);
}
?>
