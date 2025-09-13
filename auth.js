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

// 注册功能 - 修改为使用用户名和密码
async function register(username, password) {
    // 使用用户名作为唯一标识符，生成一个虚拟邮箱
    const virtualEmail = `${username}@lzm-community.local`;
    
    const { data, error } = await supabase.auth.signUp({
        email: virtualEmail,
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

// 登录功能 - 修改为使用用户名和密码
async function login(username, password) {
    // 使用用户名生成虚拟邮箱
    const virtualEmail = `${username}@lzm-community.local`;
    
    const { data, error } = await supabase.auth.signInWithPassword({
        email: virtualEmail,
        password: password
    });

    if (error) {
        // 如果登录失败，尝试另一种可能的虚拟邮箱格式
        const virtualEmail2 = `${username.toLowerCase().replace(/\s+/g, '')}@lzm-community.local`;
        if (virtualEmail !== virtualEmail2) {
            const { data: data2, error: error2 } = await supabase.auth.signInWithPassword({
                email: virtualEmail2,
                password: password
            });
            
            if (error2) {
                throw error;
            }
            return data2;
        }
        throw error;
    }

    return data;
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
