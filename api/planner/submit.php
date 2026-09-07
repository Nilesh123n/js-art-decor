<?php
// Public Art & Decor Planner Submission Handler
require_once __DIR__ . '/../config/db.php';

header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed. Only POST is accepted."]);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['name']) || empty($input['phone'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Name and contact phone number are required."]);
    exit();
}

$name = htmlspecialchars(trim($input['name']));
$phone = htmlspecialchars(trim($input['phone'] ?? $input['mobile'] ?? ''));
$email = filter_var(trim($input['email'] ?? ''), FILTER_VALIDATE_EMAIL) ? trim($input['email']) : ($phone . '@jsartdecor.in');
$segment = htmlspecialchars(trim($input['segment'] ?? 'All Segments'));
$spaceScale = htmlspecialchars(trim($input['space_scale'] ?? 'Not specified'));
$theme = htmlspecialchars(trim($input['theme'] ?? 'Standard'));
$budgetRange = htmlspecialchars(trim($input['budget_range'] ?? 'Standard'));
$timeline = htmlspecialchars(trim($input['timeline'] ?? 'Flexible'));
$city = htmlspecialchars(trim($input['city'] ?? ''));
$notes = htmlspecialchars(trim($input['notes'] ?? ''));

$scopeItems = [];
if (isset($input['scope']) && is_array($input['scope'])) {
    $scopeItems = array_map('htmlspecialchars', $input['scope']);
} elseif (isset($input['scope']) && is_string($input['scope'])) {
    $scopeItems = [htmlspecialchars($input['scope'])];
}
$scopeStr = implode(', ', $scopeItems);

$refId = 'PLAN-' . strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 6));

$fullMessage = "--- ART & DECOR PLANNER SUBMISSION ---\n"
    . "Reference ID: " . $refId . "\n"
    . "Target Segment: " . $segment . "\n"
    . "Property / Event Scale: " . $spaceScale . "\n"
    . "Planning Scope / Items: " . ($scopeStr ?: 'Comprehensive Styling') . "\n"
    . "Preferred Theme: " . $theme . "\n"
    . "Budget Estimate: " . $budgetRange . "\n"
    . "Target Timeline: " . $timeline . "\n"
    . "City / Location: " . $city . "\n"
    . "Client Notes: " . ($notes ?: 'None provided');

$subject = "Decor Plan: " . $segment . " (" . $spaceScale . ")";
$enquiryType = "Art & Decor Planner - " . $segment;

try {
    $stmt = $pdo->prepare("
        INSERT INTO contact_messages (name, email, mobile, enquiry_type, subject, message, is_read, created_at)
        VALUES (:name, :email, :mobile, :etype, :subj, :msg, 0, NOW())
    ");

    $stmt->execute([
        ':name' => $name,
        ':email' => $email,
        ':mobile' => $phone,
        ':etype' => $enquiryType,
        ':subj' => $subject,
        ':msg' => $fullMessage
    ]);

    echo json_encode([
        "success" => true,
        "reference_id" => $refId,
        "message" => "Your Art & Decor Planning request has been submitted successfully! Our senior decor stylist will contact you with customized proposals and quotations shortly."
    ]);

} catch (Exception $e) {
    error_log("Planner Submission DB Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Database error while saving planning request."]);
}
?>
