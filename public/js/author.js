function renderAuthorArticleCard(blog) {
    const card = document.createElement('article');
    card.className = 'blog-card';

    card.innerHTML = `
        <h3>${blog.titre}</h3>
        <p class="meta">Publié le ${new Date(blog.date_creation).toLocaleDateString()}</p>
        <p>${blog.contenu.substring(0, 220)}${blog.contenu.length > 220 ? '...' : ''}</p>
        <div class="author-actions">
            <button class="edit-btn" data-id="${blog.id}">Modifier</button>
            <button class="delete-btn" data-id="${blog.id}">Supprimer</button>
        </div>
    `;

    return card;
}

async function loadAuthorArticles() {
    const container = document.getElementById('authorArticles');
    if (!container) return;

    container.innerHTML = '<p>Chargement de vos articles...</p>';

    const response = await apiRequest('/blogs');
    if (!response.ok) {
        container.innerHTML = '<p>Impossible de charger vos articles. Vérifiez que vous êtes connecté.</p>';
        return;
    }

    const data = await response.json();
    const user = getUser();
    const articles = data.blogs.filter((blog) => blog.auteur_email === user?.email);

    if (articles.length === 0) {
        container.innerHTML = '<p>Aucun article publié pour le moment.</p>';
        return;
    }

    container.innerHTML = '';
    articles.forEach((blog) => {
        container.appendChild(renderAuthorArticleCard(blog));
    });
}

async function handleAuthorActions(event) {
    const editBtn = event.target.closest('.edit-btn');
    const deleteBtn = event.target.closest('.delete-btn');

    if (!editBtn && !deleteBtn) return;

    const articleId = editBtn?.dataset.id || deleteBtn?.dataset.id;
    if (!articleId) return;

    if (deleteBtn) {
        const confirmed = confirm('Voulez-vous vraiment supprimer cet article ?');
        if (!confirmed) return;

        const response = await apiRequest(`/blogs/${articleId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const data = await response.json();
            showAlert(data.error || 'Erreur lors de la suppression.', 'error');
            return;
        }

        showAlert('Article supprimé avec succès.', 'success');
        await loadAuthorArticles();
        return;
    }

    if (editBtn) {
        window.location.href = `publish.html?id=${articleId}`;
    }
}

function initAuthorPage() {
    attachHeaderListeners();
    updateHeaderButtons();
    document.getElementById('authorArticles')?.addEventListener('click', handleAuthorActions);
    loadAuthorArticles();
}

window.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('authorArticles')) {
        initAuthorPage();
    }
});
