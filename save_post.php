<?php
require_once 'config.php';
checkAdminLogin();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = $_POST['title'] ?? '';
    $content = $_POST['content'] ?? '';
    $excerpt = $_POST['excerpt'] ?? '';
    $status = $_POST['status'] ?? 'draft';
    
    if (empty($title) || empty($content)) {
        die('标题和内容不能为空');
    }
    
    try {
        $db = getDB();
        $stmt = $db->prepare("INSERT INTO posts (title, content, excerpt, status, published_at) VALUES (?, ?, ?, ?, ?)");
        
        $published_at = $status === 'published' ? date('Y-m-d H:i:s') : null;
        $stmt->execute([$title, $content, $excerpt, $status, $published_at]);
        
        redirect('admin.php');
    } catch (PDOException $e) {
        die('保存文章失败: ' . $e->getMessage());
    }
} else {
    redirect('admin.php');
}
?>
