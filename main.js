let currentPage = 1;
let currentFilter = 'new';
let isLoading = false;
let hasMore = true;

// 加载帖子
async function loadPosts(page = 1, filter = 'new') {
    if (isLoading) return;
    
    isLoading = true;
    document.getElementById('loading').style.display = 'block';
    
    let query = supabase
        .from('posts')
        .select(`
            *,
            profiles:user_id (username, avatar_url),
            post_likes(count)
        `)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
    
    // 应用过滤器
    if (filter === 'hot') {
        query = query.order('like_count', { ascending: false });
    } else if (filter === 'top') {
        query = query.eq('is_pinned', true).order('created_at', { ascending: false });
    }
    
    // 分页
    const from = (page - 1) * 10;
    const to = from + 9;
    query = query.range(from, to);
    
    const { data: posts, error } = await query;
    
    isLoading = false;
    document.getElementById('loading').style.display = 'none';
    
    if (error) {
        console.error('加载帖子错误:', error);
        return;
    }
    
    if (posts.length === 0) {
        hasMore = false;
        document.getElementById('no-more').style.display = 'block';
        return;
    }
    
    // 渲染帖子
    renderPosts(posts, page === 1);
    
    // 如果是第一页，重置滚动位置
    if (page === 1) {
        window.scrollTo(0, 0);
    }
}

// 渲染帖子
function renderPosts(posts, clear = false) {
    const container = document.getElementById('posts-container');
    
    if (clear) {
        container.innerHTML = '';
    }
    
    posts.forEach(post => {
        const postElement = createPostElement(post);
        container.appendChild(postElement);
    });
}

// 创建帖子元素
function createPostElement(post) {
    const postEl = document.createElement('div');
    postEl.className = 'post';
    if (post.is_pinned) {
        postEl.classList.add('pinned');
    }
    if (post.is_highlighted) {
        postEl.classList.add('highlighted');
    }
    
    const createdAt = new Date(post.created_at).toLocaleDateString('zh-CN');
    const tagsHtml = post.tags && post.tags.length > 0 ? 
        post.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : '';
    
    postEl.innerHTML = `
        <div class="post-header">
            <div class="post-meta">
                <img src="${post.profiles.avatar_url || 'default-avatar.png'}" alt="${post.profiles.username}" class="avatar">
                <div class="post-author">
                    <a href="profile.html?id=${post.user_id}">${post.profiles.username}</a>
                    <span class="post-date">${createdAt}</span>
                </div>
            </div>
            <div class="post-actions">
                ${currentUser && currentUser.profile && (currentUser.profile.role === 'admin' || currentUser.profile.role === 'moderator') ? `
                <button class="btn-admin" data-post-id="${post.id}">管理</button>
                ` : ''}
            </div>
        </div>
        <h2 class="post-title"><a href="post.html?id=${post.id}">${post.title}</a></h2>
        <div class="post-content">${post.content.substring(0, 200)}${post.content.length > 200 ? '...' : ''}</div>
        <div class="post-footer">
            <div class="post-tags">${tagsHtml}</div>
            <div class="post-stats">
                <span class="stat"><i class="icon-eye"></i> ${post.view_count || 0}</span>
                <span class="stat"><i class="icon-like"></i> ${post.like_count || 0}</span>
                <span class="stat"><i class="icon-comment"></i> ${post.comment_count || 0}</span>
            </div>
        </div>
    `;
    
    return postEl;
}

// 初始化主页
document.addEventListener('DOMContentLoaded', function() {
    // 加载第一页帖子
    loadPosts(currentPage, currentFilter);
    
    // 滚动加载更多
    window.addEventListener('scroll', function() {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && hasMore && !isLoading) {
            currentPage++;
            loadPosts(currentPage, currentFilter);
        }
    });
    
    // 过滤器切换
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            currentFilter = this.dataset.filter;
            currentPage = 1;
            hasMore = true;
            document.getElementById('no-more').style.display = 'none';
            
            loadPosts(currentPage, currentFilter);
        });
    });
    
    // 标签筛选
    const tags = document.querySelectorAll('.tag');
    tags.forEach(tag => {
        tag.addEventListener('click', function(e) {
            e.preventDefault();
            // 实现标签筛选逻辑
        });
    });
});
