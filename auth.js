// Supabase 初始化
const supabaseUrl = 'https://ymkthiwxtxngjgtlncxt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlta3RoaXd4dHhuZ2pndGxuY3h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODEyOTYsImV4cCI6MjA3MzI1NzI5Nn0.Xk7HoZQjRZ_4gjTncMAJijQuwvKnIgMOw7tR1MDKvBY';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// 认证状态管理
let currentUser = null;

// 检查用户登录状态
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        currentUser = session.user;
        updateUIForLoggedInUser();
        
        // 获取用户资料
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
            
        if (profile) {
            currentUser.profile = profile;
            updateProfileUI(profile);
        }
    } else {
        updateUIForLoggedOutUser();
    }
}

// 更新UI为已登录状态
function updateUIForLoggedInUser() {
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const userMenu = document.getElementById('user-menu');
    
    if (loginLink) loginLink.style.display = 'none';
    if (registerLink) registerLink.style.display = 'none';
    if (userMenu) userMenu.style.display = 'flex';
}

// 更新用户资料UI
function updateProfileUI(profile) {
    const profileLink = document.getElementById('profile-link');
    if (profileLink) {
        profileLink.textContent = profile.username;
        profileLink.href = `profile.html?id=${profile.id}`;
    }
    
    // 如果是管理员，显示管理链接
    if (profile.role === 'admin' || profile.role === 'moderator') {
        const navLinks = document.querySelector('.nav-links');
        if (navLinks && !document.querySelector('.admin-link')) {
            const adminLink = document.createElement('a');
            adminLink.href = 'admin.html';
            adminLink.textContent = '管理';
            adminLink.className = 'admin-link';
            navLinks.appendChild(adminLink);
        }
    }
}

// 更新UI为未登录状态
function updateUIForLoggedOutUser() {
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const userMenu = document.getElementById('user-menu');
    
    if (loginLink) loginLink.style.display = 'inline';
    if (registerLink) registerLink.style.display = 'inline';
    if (userMenu) userMenu.style.display = 'none';
}

// 注册功能 - 使用固定邮箱格式
async function register(username, password) {
    // 使用固定邮箱格式，将用户名存储在user_metadata中
    const fixedEmail = `user.${Date.now()}@example.com`;
    
    const { data, error } = await supabase.auth.signUp({
        email: fixedEmail,
        password: password,
        options: {
            data: {
                username: username
            }
        }
    });

    if (error) {
        throw error;
    }

    // 创建用户资料
    if (data.user) {
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([
                { 
                    id: data.user.id, 
                    username: username 
                }
            ]);

        if (profileError) {
            throw profileError;
        }
    }

    return data;
}

// 登录功能 - 通过用户名查找对应的邮箱
async function login(username, password) {
    try {
        // 首先在profiles表中查找用户名对应的用户ID
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username)
            .single();

        if (profileError) {
            throw new Error('用户名不存在');
        }

        // 然后通过用户ID查找auth.users表中的邮箱
        const { data: authUser, error: authError } = await supabase
            .from('auth.users')
            .select('email')
            .eq('id', profile.id)
            .single();

        if (authError) {
            throw new Error('用户认证信息不存在');
        }

        // 使用找到的邮箱进行登录
        const { data, error } = await supabase.auth.signInWithPassword({
            email: authUser.email,
            password: password
        });

        if (error) {
            throw error;
        }

        return data;
    } catch (error) {
        throw error;
    }
}

// 退出功能
async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('退出错误:', error);
    } else {
        currentUser = null;
        updateUIForLoggedOutUser();
        window.location.href = 'index.html';
    }
}

// 监听认证状态变化
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
        currentUser = session.user;
        updateUIForLoggedInUser();
        window.location.reload();
    } else if (event === 'SIGNED_OUT') {
        currentUser = null;
        updateUIForLoggedOutUser();
    }
});

// 初始化检查认证状态
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    
    // 绑定退出按钮事件
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
});
