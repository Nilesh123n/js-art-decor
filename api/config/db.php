<?php
// Hostinger / MySQL Database Configuration
header("Content-Type: application/json; charset=UTF-8");

$host = getenv('DB_HOST') ?: 'localhost';
$db_name = getenv('DB_NAME') ?: 'u123456789_jsartdecor';
$username = getenv('DB_USER') ?: 'u123456789_jsuser';
$password = getenv('DB_PASS') ?: 'YourActualPassword123';

try {
    $pdo = new PDO("mysql:host=" . $host . ";dbname=" . $db_name . ";charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]);
} catch (PDOException $e) {
    error_log("Database connection error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection error. Please contact administrator."]);
    exit();
}
?>
