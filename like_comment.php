<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('index.php');
}

if (!isset($_POST['comment_id']) || !is_numeric($_POST['comment_id'])) {
    die('无效的评论ID');
}

$comment_id = intval($_POST['comment_id']);
$user_ip = getClientIP();

try {
    $db = getDB();
    
    // 检查是否已经点赞
    $stmt = $db->prepare("SELECT id FROM comment_likes WHERE comment_id = ? AND user_ip = ?");
    $stmt->execute([$comment_id, $user_ip]);
    
    if ($stmt->fetch()) {
        // 已经点过赞了
        redirect($_SERVER['HTTP_REFERER'] ?: 'index.php');
    }
    
    // 插入点赞记录
    $stmt = $db->prepare("INSERT INTO comment_likes (comment_id, user_ip) VALUES (?, ?)");
    $stmt->execute([$comment_id, $user_ip]);
    
    // 更新评论点赞数
    $stmt = $db->prepare("UPDATE comments SET like_count = like_count + 1 WHERE id = ?");
    $stmt->execute([$comment_id]);
    
    redirect($_SERVER['HTTP_REFERER'] ?: 'index.php');
} catch (PDOException $e) {
    die('点赞失败: ' . $e->getMessage());
}
?>
