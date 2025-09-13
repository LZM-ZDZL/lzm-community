<?php
require_once 'config.php';
checkAdminLogin();

$page_title = '管理后台';
require_once 'header.php';

// 获取统计数据
try {
    $db = getDB();
    
    // 文章总数
    $stmt = $db->query("SELECT COUNT(*) as count FROM posts");
    $post_count = $stmt->fetch()['count'];
    
    // 已发布文章数
    $stmt = $db->query("SELECT COUNT(*) as count FROM posts WHERE status = 'published'");
    $published_count = $stmt->fetch()['count'];
    
    // 评论总数
    $stmt = $db->query("SELECT COUNT(*) as count FROM comments");
    $comment_count = $stmt->fetch()['count'];
    
    // 总浏览量
    $stmt = $db->query("SELECT SUM(view_count) as total FROM posts");
    $total_views = $stmt->fetch()['total'] ?: 0;
} catch (PDOException $e) {
    die('获取统计数据失败: ' . $e->getMessage());
}
?>

<h2>博客管理后台</h2>

<div class="stats-grid">
    <div class="stat-card">
        <div class="stat-number"><?php echo $post_count; ?></div>
        <div class="stat-label">总文章数</div>
    </div>
    <div class="stat-card">
        <div class="stat-number"><?php echo $published_count; ?></div>
        <div class="stat-label">已发布文章</div>
    </div>
    <div class="stat-card">
        <div class="stat-number"><?php echo $comment_count; ?></div>
        <div class="stat-label">总评论数</div>
    </div>
    <div class="stat-card">
        <div class="stat-number"><?php echo $total_views; ?></div>
        <div class="stat-label">总浏览量</div>
    </div>
</div>

<div class="admin-tabs">
    <div class="admin-tab active" data-tab="posts">文章管理</div>
    <div class="admin-tab" data-tab="new-post">写文章</div>
    <div class="admin-tab" data-tab="comments">评论管理</div>
    <div class="admin-tab" data-tab="settings">设置</div>
</div>

<div id="posts-tab" class="tab-content active">
    <h3>文章列表</h3>
    <?php
    try {
        $stmt = $db->query("SELECT * FROM posts ORDER BY created_at DESC");
        $posts = $stmt->fetchAll();
        
        if (count($posts) > 0): ?>
            <div class="post-list">
                <?php foreach ($posts as $post): ?>
                    <div class="post-item">
                        <h4><?php echo htmlspecialchars($post['title']); ?></h4>
                        <p>状态: <?php echo $post['status'] === 'published' ? '已发布' : '草稿'; ?></p>
                        <p>创建时间: <?php echo date('Y-m-d H:i', strtotime($post['created_at'])); ?></p>
                        <p>浏览量: <?php echo $post['view_count']; ?></p>
                        <div class="post-actions">
                            <a href="edit_post.php?id=<?php echo $post['id']; ?>" class="btn">编辑</a>
                            <a href="delete_post.php?id=<?php echo $post['id']; ?>" class="btn danger" onclick="return confirm('确定要删除这篇文章吗？')">删除</a>
                            <?php if ($post['status'] === 'draft'): ?>
                                <a href="publish_post.php?id=<?php echo $post['id']; ?>" class="btn success">发布</a>
                            <?php else: ?>
                                <a href="unpublish_post.php?id=<?php echo $post['id']; ?>" class="btn warning">取消发布</a>
                            <?php endif; ?>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php else: ?>
            <p>暂无文章</p>
        <?php endif;
    } catch (PDOException $e) {
        echo '<p>加载文章失败: ' . $e->getMessage() . '</p>';
    }
    ?>
</div>

<div id="new-post-tab" class="tab-content">
    <h3>撰写新文章</h3>
    <form method="POST" action="save_post.php">
        <div class="form-group">
            <label for="post-title">标题</label>
            <input type="text" id="post-title" name="title" required>
        </div>
        <div class="form-group">
            <label for="post-content">内容 (Markdown格式)</label>
            <textarea id="post-content" name="content" rows="15" required></textarea>
        </div>
        <div class="form-group">
            <label for="post-excerpt">摘要 (可选)</label>
            <textarea id="post-excerpt" name="excerpt" rows="3"></textarea>
        </div>
        <div class="form-group">
            <label for="post-status">状态</label>
            <select id="post-status" name="status">
                <option value="draft">草稿</option>
                <option value="published">发布</option>
            </select>
        </div>
        <button type="submit" class="btn">保存</button>
    </form>
</div>

<div id="comments-tab" class="tab-content">
    <h3>评论管理</h3>
    <?php
    try {
        $stmt = $db->query("SELECT c.*, p.title as post_title FROM comments c LEFT JOIN posts p ON c.post_id = p.id ORDER BY c.created_at DESC");
        $comments = $stmt->fetchAll();
        
        if (count($comments) > 0): ?>
            <div class="post-list">
                <?php foreach ($comments as $comment): ?>
                    <div class="post-item">
                        <h4>文章: <?php echo htmlspecialchars($comment['post_title']); ?></h4>
                        <p><strong><?php echo htmlspecialchars($comment['author_name']); ?></strong> - <?php echo date('Y-m-d H:i', strtotime($comment['created_at'])); ?></p>
                        <?php if ($comment['location']): ?>
                            <p>来自: <?php echo htmlspecialchars($comment['location']); ?></p>
                        <?php endif; ?>
                        <p><?php echo nl2br(htmlspecialchars($comment['content'])); ?></p>
                        <p>点赞: <?php echo $comment['like_count']; ?></p>
                        <div class="post-actions">
                            <a href="delete_comment.php?id=<?php echo $comment['id']; ?>" class="btn danger" onclick="return confirm('确定要删除这条评论吗？')">删除评论</a>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php else: ?>
            <p>暂无评论</p>
        <?php endif;
    } catch (PDOException $e) {
        echo '<p>加载评论失败: ' . $e->getMessage() . '</p>';
    }
    ?>
</div>

<div id="settings-tab" class="tab-content">
    <h3>系统设置</h3>
    <form method="POST" action="change_password.php">
        <div class="form-group">
            <label for="admin-password">新密码</label>
            <input type="password" id="admin-password" name="password">
        </div>
        <div class="form-group">
            <label for="confirm-password">确认新密码</label>
            <input type="password" id="confirm-password" name="confirm_password">
        </div>
        <button type="submit" class="btn">更新密码</button>
    </form>
</div>

<script>
// 标签切换功能
document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        
        // 更新标签状态
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // 更新内容显示
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');
    });
});
</script>

<?php require_once 'footer.php'; ?>
