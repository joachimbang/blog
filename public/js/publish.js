// Gestion de la page de publication et d'édition d'un article.
// Seuls les utilisateurs connectés avec le rôle "auteur" ou "admin" peuvent publier ou modifier un article.

function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function authorizePublishPage() {
    const user = getUser();
    const notice = document.getElementById('publishNotice');
    const form = document.getElementById('publishForm');

    if (!form || !notice) return false;

    const isAuthorized = user && (user.role === 'auteur' || user.role === 'admin');

    if (!isAuthorized) {
        form.querySelector('button[type="submit"]').disabled = true;
        form.querySelector('input, textarea').disabled = true;
        notice.innerHTML = user
            ? 'Vous devez être un auteur pour publier un article. <a href="login.html">Se reconnecter</a> ou <a href="register.html">créer un compte auteur</a>.'
            : 'Connectez-vous pour publier un article en tant qu’auteur. <a href="login.html">Se connecter</a>.';
        notice.classList.add('publish-notice-visible');
        notice.classList.add('error');
        return false;
    }

    notice.textContent = 'Vous êtes autorisé à publier un article.';
    notice.classList.remove('error');
    notice.classList.add('publish-notice-visible');
    return true;
}

async function loadBlogToEdit(blogId) {
    const response = await apiRequest(`/blogs/${blogId}`);
    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        showAlert(data.error || 'Impossible de charger l’article pour modification.', 'error');
        return null;
    }

    const data = await response.json();
    return data.blog;
}

async function handlePublishForm() {
    const form = document.getElementById('publishForm');
    if (!form) return;

    const articleId = getQueryParam('id');
    if (articleId) {
        const loadingMessage = document.getElementById('publishNotice');
        loadingMessage.textContent = 'Chargement de l’article pour modification...';
        const blog = await loadBlogToEdit(articleId);
        if (blog) {
            form.titre.value = blog.titre;
            form.contenu.value = blog.contenu;
            form.querySelector('button[type="submit"]').textContent = 'Mettre à jour';
            loadingMessage.textContent = 'Modification de votre article';
        }
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const titre = form.titre.value.trim();
        const contenu = form.contenu.value.trim();

        if (!titre || !contenu) {
            showAlert('Titre et contenu sont obligatoires.', 'error');
            return;
        }

        const articleId = getQueryParam('id');
        const method = articleId ? 'PUT' : 'POST';
        const url = articleId ? `/blogs/${articleId}` : '/blogs';

        try {
            const response = await apiRequest(url, {
                method,
                body: JSON.stringify({ titre, contenu })
            });

            const data = await response.json();
            console.log('[PUBLISH] réponse serveur :', data);

            if (!response.ok) {
                showAlert(data.error || 'Impossible de publier ou modifier l’article.', 'error');
                return;
            }

            const message = articleId ? 'Article modifié avec succès.' : 'Article publié avec succès.';
            showAlert(message, 'success');
            if (!articleId) {
                form.reset();
            }
        } catch (err) {
            console.error('[PUBLISH] erreur requête :', err);
            showAlert('Erreur réseau ou serveur. Vérifiez la console du navigateur.', 'error');
        }
    });
}

window.addEventListener('DOMContentLoaded', () => {
    attachHeaderListeners();
    updateHeaderButtons();
    if (authorizePublishPage()) {
        handlePublishForm();
    }
});
