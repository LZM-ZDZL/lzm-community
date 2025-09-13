<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('index.php');
}

if (!isset($_POST['post_id']) || !is_numeric($_POST['post_id'])) {
    die('无效的文章ID');
}

if (!isset($_POST['author_name']) || !isset($_POST['content']) || 
    empty(trim($_POST['author_name'])) || empty(trim($_POST['content']))) {
    die('姓名和评论内容不能为空');
}

$post_id = intval($_POST['post_id']);
$author_name = trim($_POST['author_name']);
$content = trim($_POST['content']);
$ip = getClientIP();
$location = getUserLocation($ip);

try {
    $db = getDB();
    
    // 验证文章是否存在
    $stmt = $db->prepare("SELECT id FROM posts WHERE id = ? AND status = 'published'");
    $stmt->execute([$post_id]);
    
    if (!$stmt->fetch()) {
        die('文章不存在');
    }
    
    // 插入评论
    $stmt = $db->prepare("INSERT INTO comments (post_id, author_name, content, location) VALUES (?, ?, ?, ?)");
    $stmt->execute([$post_id, $author_name, $content, $location]);
    
    redirect("post.php?id=$post_id");
} catch (PDOException $e) {
    die('发表评论失败: ' . $e->getMessage());
}
?>
