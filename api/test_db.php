<?php
// Hostinger Database Connection Verification Utility
// Accessible via: https://yourdomain.com/api/test_db.php
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/config/db.php';

try {
    // 1. Verify basic query execution
    $versionStmt = $pdo->query("SELECT VERSION() as mysql_version");
    $version = $versionStmt->fetchColumn();

    // 2. Query available tables in this database
    $tablesStmt = $pdo->query("SHOW TABLES");
    $tables = $tablesStmt->fetchAll(PDO::FETCH_COLUMN);

    $tableCounts = [];
    $requiredTables = ['admins', 'products', 'orders', 'order_items', 'blogs', 'partners', 'contact_messages', 'site_settings'];
    $missingTables = [];

    foreach ($requiredTables as $tbl) {
        if (in_array($tbl, $tables)) {
            $cnt = $pdo->query("SELECT COUNT(*) FROM `{$tbl}`")->fetchColumn();
            $tableCounts[$tbl] = (int)$cnt;
        } else {
            $missingTables[] = $tbl;
        }
    }

    $allReady = count($missingTables) === 0;

    echo json_encode([
        "success" => true,
        "message" => $allReady 
            ? "MySQL Database connected successfully! All required tables are present." 
            : "Connected to MySQL, but some required tables are missing. Please import database/schema.sql in Hostinger phpMyAdmin.",
        "database" => [
            "host" => $host,
            "database_name" => $db_name,
            "username" => $username,
            "mysql_version" => $version,
            "total_tables_found" => count($tables),
            "tables_found" => $tables,
            "table_record_counts" => $tableCounts,
            "missing_tables" => $missingTables
        ],
        "next_steps" => $allReady 
            ? "Your Hostinger MySQL database is 100% configured and operational." 
            : "Go to Hostinger hPanel -> Databases -> phpMyAdmin -> Click Import -> Select 'database/schema.sql' -> Click Go."
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database test query failed.",
        "error" => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>
