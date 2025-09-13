// Supabase 初始化
const supabaseUrl = 'https://ymkthiwxtxngjgtlncxt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlta3RoaXd4dHhuZ2pndGxuY3h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODEyOTYsImV4cCI6MjA3MzI1NzI5Nn0.Xk7HoZQjRZ_4gjTncMAJijQuwvKnIgMOw7tR1MDKvBY';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// 加载博客文章
async function loadBlogPosts() {
    const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
        
    if (error) {
        console.error('加载文章失败:', error);
        return;
    }
    
    const postsContainer = document.getElementById('posts-container');
    const loadingEl = document.getElementById('loading');
    const noPostsEl = document.getElementById('no-posts');
    
    if (posts.length === 0) {
        loadingEl.style.display = 'none';
        noPostsEl.style.display = 'block';
        return;
    }
    
    loadingEl.style.display = 'none';
    
    postsContainer.innerHTML = posts.map(post => {
        const postDate = new Date(post.published_at || post.created_at).toLocaleDateString('zh-CN');
        const excerpt = post.excerpt || post.content.substring(0, 150) + '...';
        
        return `
            <article class="post-card">
                <h2><a href="post.html?id=${post.id}">${post.title}</a></h2>
                <div class="post-meta">
                    <span>发布于: ${postDate}</span>
                    <span>浏览: ${post.view_count || 0}次</span>
                </div>
                <div class="post-excerpt">${excerpt}</div>
                <a href="post.html?id=${post.id}" class="read-more">阅读更多</a>
            </article>
        `;
    }).join('');
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadBlogPosts();
});
