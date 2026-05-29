// Cette page gère l'affichage d'un article détaillé et de ses commentaires.
// Le paramètre `id` est lu depuis l'URL, puis l'article est chargé depuis le backend.

function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function renderCommentCard(comment) {
    const commentCard = document.createElement('div');
    commentCard.className = 'comment-card';
    commentCard.innerHTML = `
        <p>${comment.contenu}</p>
        <p class="meta">Par ${comment.nom || 'Anonyme'} ${comment.prenom || ''} (${comment.email}) le ${new Date(comment.date_creation).toLocaleString()}</p>
    `;
    return commentCard;
}

async function loadComments(blogId) {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;

    commentsList.innerHTML = '<p>Chargement des commentaires...</p>';

    const response = await apiRequest(`/commentaires/blog/${blogId}`);
    if (!response.ok) {
        commentsList.innerHTML = '<p>Impossible de charger les commentaires.</p>';
        return;
    }

    const data = await response.json();
    commentsList.innerHTML = '';

    if (data.commentaires.length === 0) {
        commentsList.innerHTML = '<p>Aucun commentaire pour cet article.</p>';
        return;
    }

    data.commentaires.forEach((comment) => {
        commentsList.appendChild(renderCommentCard(comment));
    });
}

async function loadArticle() {
    const blogId = getQueryParam('id');
    const titleEl = document.getElementById('blogTitle');
    const metaEl = document.getElementById('blogMeta');
    const contentEl = document.getElementById('blogContent');
    const alertEl = document.getElementById('alert');

    if (!blogId) {
        showAlert('Identifiant de l\'article manquant dans l\'URL.', 'error');
        return;
    }

    const response = await apiRequest(`/blogs/${blogId}`);
    if (!response.ok) {
        const data = await response.json();
        showAlert(data.error || 'Impossible de charger l\'article.', 'error');
        titleEl.textContent = 'Article introuvable';
        contentEl.innerHTML = '<p>Impossible d\'afficher cet article.</p>';
        return;
    }

    const data = await response.json();
    const blog = data.blog;

    titleEl.textContent = blog.titre;
    metaEl.textContent = `Écrit par ${blog.nom || 'Anonyme'} ${blog.prenom || ''} (${blog.auteur_email}) le ${new Date(blog.date_creation).toLocaleString()}`;
    contentEl.innerHTML = `<p>${blog.contenu.replace(/\n/g, '<br>')}</p>`;
    await loadComments(blogId);
}

function showCommentSection() {
    const user = getUser();
    const commentFormWrapper = document.getElementById('commentFormWrapper');
    const commentHint = document.getElementById('commentHint');

    if (!commentFormWrapper || !commentHint) return;

    if (!user) {
        commentFormWrapper.classList.add('hidden');
        commentHint.textContent = 'Connectez-vous pour poster un commentaire.';
        commentHint.classList.add('comment-hint-visible');
        return;
    }

    commentFormWrapper.classList.remove('hidden');
    commentHint.textContent = 'Votre commentaire sera publié après validation par le serveur.';
    commentHint.classList.add('comment-hint-visible');
}

function handleCommentSubmission() {
    const form = document.getElementById('commentForm');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const blogId = getQueryParam('id');
        const commentaire = form.commentaire.value.trim();

        if (!commentaire) {
            showAlert('Le commentaire ne peut pas être vide.', 'error');
            return;
        }

        const response = await apiRequest('/commentaires', {
            method: 'POST',
            body: JSON.stringify({ contenu: commentaire, blog_id: blogId })
        });

        const data = await response.json();
        if (!response.ok) {
            showAlert(data.error || 'Impossible de publier le commentaire.', 'error');
            return;
        }

        form.reset();
        showAlert('Commentaire publié.', 'success');
        await loadComments(blogId);
    });
}

window.addEventListener('DOMContentLoaded', () => {
    attachHeaderListeners();
    updateHeaderButtons();
    handleCommentSubmission();
    showCommentSection();
    loadArticle();
});
