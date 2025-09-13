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
        } else {
            // 如果还没有用户资料，重定向到完善资料页面
            window.location.href = 'complete-profile.html';
        }
    } else {
        updateUIForLoggedOutUser();
    }
}

// 更新UI为已登录状态
function updateUIForLoggedInUser() {
    document.getElementById('login-link').style.display = 'none';
    document.getElementById('register-link').style.display = 'none';
    document.getElementById('user-menu').style.display = 'flex';
}

// 更新用户资料UI
function updateProfileUI(profile) {
    document.getElementById('profile-link').textContent = profile.username;
    document.getElementById('profile-link').href = `profile.html?id=${profile.id}`;
    
    // 如果是管理员，显示管理链接
    if (profile.role === 'admin' || profile.role === 'moderator') {
        const adminLink = document.createElement('a');
        adminLink.href = 'admin.html';
        adminLink.textContent = '管理';
        document.querySelector('.nav-links').appendChild(adminLink);
    }
}

// 更新UI为未登录状态
function updateUIForLoggedOutUser() {
    document.getElementById('login-link').style.display = 'inline';
    document.getElementById('register-link').style.display = 'inline';
    document.getElementById('user-menu').style.display = 'none';
}

// 注册功能
async function register(email, password, username) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username
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

// 登录功能
async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
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
