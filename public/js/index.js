function renderBlogCard(blog) {
    const card = document.createElement('article');
    card.className = 'blog-card';

    card.innerHTML = `
        <h3>${blog.titre}</h3>
        <p class="meta">Écrit par ${blog.nom || 'Anonyme'} ${blog.prenom || ''} - ${new Date(blog.date_creation).toLocaleDateString()}</p>
        <p>${blog.contenu.substring(0, 260)}${blog.contenu.length > 260 ? '...' : ''}</p>
        <p class="meta">Commentaires : ${blog.nombre_commentaires}</p>
        <a class="read-link" href="blog.html?id=${blog.id}">Lire l'article</a>
    `;

    return card;
}

async function loadBlogs() {
    const container = document.getElementById('blogList');
    if (!container) return;

    container.innerHTML = '<p>Chargement des articles...</p>';

    const response = await apiRequest('/blogs');
    if (!response.ok) {
        container.innerHTML = '<p>Impossible de charger les articles.</p>';
        return;
    }

    const data = await response.json();
    container.innerHTML = '';

    if (data.blogs.length === 0) {
        container.innerHTML = '<p>Aucun article disponible pour le moment.</p>';
        return;
    }

    data.blogs.forEach((blog) => {
        container.appendChild(renderBlogCard(blog));
    });
}

function initIndexPage() {
    attachHeaderListeners();
    updateHeaderButtons();
    loadBlogs();
}

window.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('blogList')) {
        initIndexPage();
    }
});
