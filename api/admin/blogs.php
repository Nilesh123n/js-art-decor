<?php
// Admin Blog Management Endpoint (Individual CRUD Operations with Session & CSRF Protection)
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/csrf.php';

header("Content-Type: application/json; charset=UTF-8");

require_admin_auth();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? null;

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM blogs ORDER BY id DESC");
        $blogs = $stmt->fetchAll();
        foreach ($blogs as &$b) {
            $b['id'] = (int)$b['id'];
            $b['is_published'] = (bool)($b['is_published'] ?? ($b['status'] === 'Published'));
            $b['featured_image'] = $b['featured_image'] ?? $b['cover_image'] ?? '';
            $b['cover_image'] = $b['cover_image'] ?? $b['featured_image'] ?? '';
            $b['short_description'] = $b['short_description'] ?? $b['excerpt'] ?? '';
            $b['full_content'] = $b['full_content'] ?? $b['content'] ?? '';
            $b['category'] = $b['category'] ?? 'Textile Guide';
            $b['status'] = $b['status'] ?? ($b['is_published'] ? 'Published' : 'Draft');
        }
        echo json_encode(["success" => true, "data" => $blogs]);
    } catch (Exception $e) {
        error_log("Get Admin Blogs Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to fetch blogs."]);
    }
    exit();
}

validate_csrf_token();

if ($action === 'create' || ($method === 'POST' && $action !== 'update' && $action !== 'delete')) {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Payload required."]);
        exit();
    }

    // Handle Bulk Array Update
    if (!empty($input['blogs']) && is_array($input['blogs'])) {
        try {
            $pdo->beginTransaction();
            foreach ($input['blogs'] as $b) {
                if (empty($b['title'])) continue;
                $title = trim($b['title']);
                $slug = !empty($b['slug']) ? trim($b['slug']) : strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title)));
                $category = !empty($b['category']) ? trim($b['category']) : 'Textile Guide';
                $featured_image = $b['featured_image'] ?? $b['cover_image'] ?? '';
                $short_description = $b['short_description'] ?? $b['excerpt'] ?? '';
                $full_content = $b['full_content'] ?? $b['content'] ?? '';
                $author = !empty($b['author']) ? trim($b['author']) : 'JSArt&Decor Editorial';
                $status = !empty($b['status']) ? trim($b['status']) : (!empty($b['is_published']) ? 'Published' : 'Draft');
                $is_published = ($status === 'Published') ? 1 : 0;

                if (!empty($b['id'])) {
                    $stmt = $pdo->prepare("
                        UPDATE blogs SET title = :title, slug = :slug, category = :cat, featured_image = :fimg, cover_image = :cimg,
                        excerpt = :sdesc, short_description = :sdesc, content = :fcontent, full_content = :fcontent,
                        author = :author, status = :status, is_published = :pub, updated_at = NOW()
                        WHERE id = :id
                    ");
                    $stmt->execute([
                        ':id' => (int)$b['id'], ':title' => $title, ':slug' => $slug, ':cat' => $category,
                        ':fimg' => $featured_image, ':cimg' => $featured_image, ':sdesc' => $short_description,
                        ':fcontent' => $full_content, ':author' => $author, ':status' => $status, ':pub' => $is_published
                    ]);
                } else {
                    $stmt = $pdo->prepare("
                        INSERT INTO blogs (title, slug, category, featured_image, cover_image, excerpt, short_description, content, full_content, author, status, is_published, created_at, updated_at)
                        VALUES (:title, :slug, :cat, :fimg, :cimg, :sdesc, :sdesc, :fcontent, :fcontent, :author, :status, :pub, NOW(), NOW())
                    ");
                    $stmt->execute([
                        ':title' => $title, ':slug' => $slug, ':cat' => $category,
                        ':fimg' => $featured_image, ':cimg' => $featured_image, ':sdesc' => $short_description,
                        ':fcontent' => $full_content, ':author' => $author, ':status' => $status, ':pub' => $is_published
                    ]);
                }
            }
            $pdo->commit();
            echo json_encode(["success" => true, "message" => "Blogs updated successfully."]);
        } catch (Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            error_log("Bulk Blog Save Error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Failed to save blogs."]);
        }
        exit();
    }

    try {
        $title = trim($input['title']);
        $slug = !empty($input['slug']) ? trim($input['slug']) : strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title)));
        $category = !empty($input['category']) ? trim($input['category']) : 'Textile Guide';
        $featured_image = $input['featured_image'] ?? $input['cover_image'] ?? '';
        $short_description = $input['short_description'] ?? $input['excerpt'] ?? '';
        $full_content = $input['full_content'] ?? $input['content'] ?? '';
        $author = !empty($input['author']) ? trim($input['author']) : 'JSArt&Decor Editorial';
        $status = !empty($input['status']) ? trim($input['status']) : (!empty($input['is_published']) ? 'Published' : 'Draft');
        $is_published = ($status === 'Published') ? 1 : 0;

        $stmt = $pdo->prepare("
            INSERT INTO blogs (title, slug, category, featured_image, cover_image, excerpt, short_description, content, full_content, author, status, is_published, created_at, updated_at)
            VALUES (:title, :slug, :cat, :fimg, :cimg, :sdesc, :sdesc, :fcontent, :fcontent, :author, :status, :pub, NOW(), NOW())
        ");

        $stmt->execute([
            ':title' => $title,
            ':slug' => $slug,
            ':cat' => $category,
            ':fimg' => $featured_image,
            ':cimg' => $featured_image,
            ':sdesc' => $short_description,
            ':fcontent' => $full_content,
            ':author' => $author,
            ':status' => $status,
            ':pub' => $is_published
        ]);

        echo json_encode([
            "success" => true,
            "id" => (int)$pdo->lastInsertId(),
            "message" => "Blog article created successfully."
        ]);

    } catch (Exception $e) {
        error_log("Create Blog Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to create blog article."]);
    }
    exit();
}

if ($action === 'update' || $method === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || empty($input['id']) || empty($input['title'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Article ID and Title are required for update."]);
        exit();
    }

    try {
        $id = (int)$input['id'];
        $title = trim($input['title']);
        $slug = !empty($input['slug']) ? trim($input['slug']) : strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title)));
        $category = !empty($input['category']) ? trim($input['category']) : 'Textile Guide';
        $featured_image = $input['featured_image'] ?? $input['cover_image'] ?? '';
        $short_description = $input['short_description'] ?? $input['excerpt'] ?? '';
        $full_content = $input['full_content'] ?? $input['content'] ?? '';
        $author = !empty($input['author']) ? trim($input['author']) : 'JSArt&Decor Editorial';
        $status = !empty($input['status']) ? trim($input['status']) : (!empty($input['is_published']) ? 'Published' : 'Draft');
        $is_published = ($status === 'Published') ? 1 : 0;

        $stmt = $pdo->prepare("
            UPDATE blogs SET 
                title = :title, slug = :slug, category = :cat, featured_image = :fimg, cover_image = :cimg,
                excerpt = :sdesc, short_description = :sdesc, content = :fcontent, full_content = :fcontent,
                author = :author, status = :status, is_published = :pub, updated_at = NOW()
            WHERE id = :id
        ");

        $stmt->execute([
            ':id' => $id,
            ':title' => $title,
            ':slug' => $slug,
            ':cat' => $category,
            ':fimg' => $featured_image,
            ':cimg' => $featured_image,
            ':sdesc' => $short_description,
            ':fcontent' => $full_content,
            ':author' => $author,
            ':status' => $status,
            ':pub' => $is_published
        ]);

        echo json_encode(["success" => true, "message" => "Blog article updated successfully."]);

    } catch (Exception $e) {
        error_log("Update Blog Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to update blog article."]);
    }
    exit();
}

if ($action === 'delete' || $method === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = (int)($input['id'] ?? $_GET['id'] ?? 0);

    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Article ID required for deletion."]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM blogs WHERE id = :id");
        $stmt->execute([':id' => $id]);
        echo json_encode(["success" => true, "message" => "Blog article deleted successfully."]);
    } catch (Exception $e) {
        error_log("Delete Blog Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to delete blog article."]);
    }
    exit();
}
?>
