<?php
require_once 'config.php';
checkAdminLogin();

if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    redirect('admin.php');
}

$id = intval($_GET['id']);

try {
    $db = getDB();
    $stmt = $db->prepare("UPDATE posts SET status = 'published', published_at = NOW() WHERE id = ?");
    $stmt->execute([$id]);
    
    redirect('admin.php');
} catch (PDOException $e) {
    die('发布文章失败: ' . $e->getMessage());
}
?>
