<?php
// Public Contact / Enquiry Submission Handler
require_once __DIR__ . '/../config/db.php';

header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed."]);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['name']) || empty($input['email']) || empty($input['message'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Name, email, and message are required."]);
    exit();
}

$name = htmlspecialchars(trim($input['name']));
$email = filter_var(trim($input['email']), FILTER_VALIDATE_EMAIL);
$mobile = htmlspecialchars(trim($input['mobile'] ?? ''));
$enquiry_type = htmlspecialchars(trim($input['enquiry_type'] ?? 'General'));
$subject = htmlspecialchars(trim($input['subject'] ?? 'Website Inquiry'));
$message = htmlspecialchars(trim($input['message']));

if (!$email) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Invalid email address."]);
    exit();
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO contact_messages (name, email, mobile, enquiry_type, subject, message, is_read, created_at)
        VALUES (:name, :email, :mobile, :etype, :subj, :msg, 0, NOW())
    ");

    $stmt->execute([
        ':name' => $name,
        ':email' => $email,
        ':mobile' => $mobile,
        ':etype' => $enquiry_type,
        ':subj' => $subject,
        ':msg' => $message
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Thank you! Your message has been received. Our JSArt&Decor team will contact you shortly."
    ]);

} catch (Exception $e) {
    error_log("Submit Contact Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Failed to submit enquiry. Please try again."]);
}
?>
