<?php
// Public Blogs Listing & Detail Endpoint
require_once __DIR__ . '/../config/db.php';

header("Content-Type: application/json; charset=UTF-8");

$slug = $_GET['slug'] ?? null;
$id = $_GET['id'] ?? null;

function format_blog_data($b) {
    if (!$b) return null;
    return [
        "id" => (int)$b['id'],
        "title" => $b['title'],
        "slug" => $b['slug'],
        "category" => $b['category'] ?? 'Textile Guide',
        "featured_image" => $b['featured_image'] ?? $b['cover_image'] ?? '',
        "cover_image" => $b['cover_image'] ?? $b['featured_image'] ?? '',
        "short_description" => $b['short_description'] ?? $b['excerpt'] ?? '',
        "excerpt" => $b['excerpt'] ?? $b['short_description'] ?? '',
        "full_content" => $b['full_content'] ?? $b['content'] ?? '',
        "content" => $b['content'] ?? $b['full_content'] ?? '',
        "author" => $b['author'] ?? 'JSArt&Decor Editorial',
        "status" => $b['status'] ?? 'Published',
        "is_published" => (bool)($b['is_published'] ?? ($b['status'] === 'Published')),
        "created_at" => $b['created_at']
    ];
}

try {
    if ($slug || $id) {
        if ($slug) {
            $stmt = $pdo->prepare("SELECT * FROM blogs WHERE slug = :slug AND (is_published = 1 OR status = 'Published') LIMIT 1");
            $stmt->execute([':slug' => trim($slug)]);
        } else {
            $stmt = $pdo->prepare("SELECT * FROM blogs WHERE id = :id AND (is_published = 1 OR status = 'Published') LIMIT 1");
            $stmt->execute([':id' => (int)$id]);
        }
        $blog = $stmt->fetch();
        if (!$blog) {
            http_response_code(404);
            echo json_encode(["success" => false, "error" => "Article not found."]);
            exit();
        }
        echo json_encode(["success" => true, "data" => format_blog_data($blog)]);
    } else {
        $stmt = $pdo->query("SELECT * FROM blogs WHERE is_published = 1 OR status = 'Published' ORDER BY id DESC");
        $blogsRaw = $stmt->fetchAll();
        $blogs = array_map('format_blog_data', $blogsRaw);
        echo json_encode(["success" => true, "data" => $blogs]);
    }
} catch (Exception $e) {
    error_log("Public Blogs Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Failed to fetch blog articles."]);
}
?>
