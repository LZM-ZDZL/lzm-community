<?php
$page_title = '首页';
require_once 'header.php';

try {
    $db = getDB();
    $stmt = $db->query("SELECT * FROM posts WHERE status = 'published' ORDER BY created_at DESC");
    $posts = $stmt->fetchAll();
} catch (PDOException $e) {
    die('获取文章失败: ' . $e->getMessage());
}
?>

<div class="blog-header">
    <h1>欢迎来到<?php echo SITE_NAME; ?></h1>
    <p>分享知识与想法</p>
</div>

<div id="posts-container" class="posts-grid">
    <?php if (count($posts) > 0): ?>
        <?php foreach ($posts as $post): ?>
            <article class="post-card">
                <h2><a href="post.php?id=<?php echo $post['id']; ?>"><?php echo htmlspecialchars($post['title']); ?></a></h2>
                <div class="post-meta">
                    <span>发布于: <?php echo date('Y-m-d', strtotime($post['created_at'])); ?></span>
                    <span>浏览: <?php echo $post['view_count']; ?>次</span>
                </div>
                <div class="post-excerpt"><?php echo htmlspecialchars($post['excerpt'] ?: substr($post['content'], 0, 150) . '...'); ?></div>
                <a href="post.php?id=<?php echo $post['id']; ?>" class="read-more">阅读更多</a>
            </article>
        <?php endforeach; ?>
    <?php else: ?>
        <div class="no-posts">
            <p>暂无文章</p>
        </div>
    <?php endif; ?>
</div>

<?php require_once 'footer.php'; ?>
