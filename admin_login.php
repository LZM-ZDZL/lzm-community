<?php
$page_title = '管理员登录';
require_once 'header.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $password = $_POST['password'] ?? '';
    
    try {
        $db = getDB();
        $stmt = $db->query("SELECT * FROM admin_users WHERE username = 'admin'");
        $admin = $stmt->fetch();
        
        if ($admin && verifyPassword($password, $admin['password_hash'])) {
            $_SESSION['admin_logged_in'] = true;
            redirect('admin.php');
        } else {
            $error = '密码错误';
        }
    } catch (PDOException $e) {
        $error = '登录失败: ' . $e->getMessage();
    }
}
?>

<div class="form-container">
    <h2>管理员登录</h2>
    <?php if (isset($error)): ?>
        <div class="message error"><?php echo $error; ?></div>
    <?php endif; ?>
    <form method="POST">
        <div class="form-group">
            <label for="password">管理员密码</label>
            <input type="password" id="password" name="password" required>
            <small>初始密码: 144123</small>
        </div>
        <button type="submit" class="btn">登录</button>
    </form>
</div>

<?php require_once 'footer.php'; ?>
