<?php
require_once 'config.php';
checkAdminLogin();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';
    
    if (empty($password)) {
        die('密码不能为空');
    }
    
    if ($password !== $confirm_password) {
        die('两次输入的密码不一致');
    }
    
    try {
        $db = getDB();
        $hash = hashPassword($password);
        $stmt = $db->prepare("UPDATE admin_users SET password_hash = ? WHERE username = 'admin'");
        $stmt->execute([$hash]);
        
        redirect('admin.php?message=密码更新成功');
    } catch (PDOException $e) {
        die('更新密码失败: ' . $e->getMessage());
    }
} else {
    redirect('admin.php');
}
?>
