<?php
if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    header('HTTP/1.0 404 Not Found');
    die('文章不存在');
}

$post_id = intval($_GET['id']);

try {
    $db = getDB();
    
    // 获取文章详情
    $stmt = $db->prepare("SELECT * FROM posts WHERE id = ? AND status = 'published'");
    $stmt->execute([$post_id]);
    $post = $stmt->fetch();
    
    if (!$post) {
        header('HTTP/1.0 404 Not Found');
        die('文章不存在');
    }
    
    // 更新浏览量
    $db->prepare("UPDATE posts SET view_count = view_count + 1 WHERE id = ?")
       ->execute([$post_id]);
    
    // 获取评论
    $stmt = $db->prepare("SELECT * FROM comments WHERE post_id = ? ORDER BY created_at DESC");
    $stmt->execute([$post_id]);
    $comments = $stmt->fetchAll();
    
    $page_title = $post['title'];
    require_once 'header.php';
} catch (PDOException $e) {
    die('获取文章失败: ' . $e->getMessage());
}
?>

<article id="post-content" class="post-detail">
    <header class="post-header">
        <h1><?php echo htmlspecialchars($post['title']); ?></h1>
        <div class="post-meta">
            <span>发布于: <?php echo date('Y-m-d H:i', strtotime($post['created_at'])); ?></span>
            <span>浏览: <?php echo $post['view_count']; ?>次</span>
        </div>
    </header>
    <div class="post-body">
        <?php echo parseMarkdown($post['content']); ?>
    </div>
</article>

<div class="comments-section">
    <h3>评论</h3>
    
    <div class="comment-form">
        <h4>发表评论</h4>
        <form method="POST" action="add_comment.php">
            <input type="hidden" name="post_id" value="<?php echo $post_id; ?>">
            <div class="form-group">
                <input type="text" name="author_name" placeholder="您的姓名" required>
            </div>
            <div class="form-group">
                <textarea name="content" placeholder="写下您的评论..." required></textarea>
            </div>
            <button type="submit" class="btn">提交评论</button>
        </form>
    </div>
    
    <div id="comments-list" class="comments-list">
        <?php if (count($comments) > 0): ?>
            <?php foreach ($comments as $comment): ?>
                <div class="comment">
                    <div class="comment-header">
                        <strong><?php echo htmlspecialchars($comment['author_name']); ?></strong>
                        <span><?php echo date('Y-m-d H:i', strtotime($comment['created_at'])); ?></span>
                        <?php if ($comment['location']): ?>
                            <span>来自: <?php echo htmlspecialchars($comment['location']); ?></span>
                        <?php endif; ?>
                    </div>
                    <div class="comment-content"><?php echo nl2br(htmlspecialchars($comment['content'])); ?></div>
                    <div class="comment-actions">
                        <form method="POST" action="like_comment.php" style="display:inline;">
                            <input type="hidden" name="comment_id" value="<?php echo $comment['id']; ?>">
                            <button type="submit" class="like-btn">👍 <span class="like-count"><?php echo $comment['like_count']; ?></span></button>
                        </form>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php else: ?>
            <p>暂无评论</p>
        <?php endif; ?>
    </div>
</div>

<?php require_once 'footer.php'; ?>
