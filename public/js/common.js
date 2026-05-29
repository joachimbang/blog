const apiBase = 'http://localhost:3000/api';

/**
 * Récupère le token d'accès (courte durée) depuis le localStorage du navigateur.
 * Ce token est envoyé avec chaque requête sécurisée pour prouver notre identité.
 */
function getAccessToken() {
    return localStorage.getItem('accessToken');
}

/**
 * Récupère le token de rafraîchissement (longue durée) depuis le localStorage.
 * Ce token sert à demander un nouveau token d'accès quand l'ancien a expiré.
 */
function getRefreshToken() {
    return localStorage.getItem('refreshToken');
}

/**
 * Récupère les informations de l'utilisateur connecté depuis le localStorage.
 * Comme localStorage ne stocke que du texte, on utilise JSON.parse pour le retransformer en objet.
 */
function getUser() {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch (err) {
        return null; // En cas d'erreur (ex: format invalide), on retourne null
    }
}

/**
 * Enregistre les tokens et les données utilisateur dans la session (localStorage).
 * Le paramètre utilise la déstructuration d'objet { accessToken, refreshToken, user }.
 */
function setSession({ accessToken, refreshToken, user }) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Supprime toutes les informations de session côté client.
 */
function clearSession() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
}

/**
 * Demande un nouveau accessToken au backend en utilisant le refreshToken.
 */
async function refreshAccessToken() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
        return false; // Pas de refresh token disponible
    }

    const response = await fetch(`${apiBase}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
        clearSession();
        return false;
    }

    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    return true;
}

/**
 * Wrapper autour de fetch pour gérer automatiquement les tokens.
 */
async function apiRequest(url, options = {}) {
    const token = getAccessToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const finalUrl = url.startsWith('http') ? url : `${apiBase}${url}`;

    try {
        console.log('[API-REQ] Envoi :', { url: finalUrl, options: { ...options, headers } });
        let response = await fetch(finalUrl, { ...options, headers });

        if (response.status === 401 && getRefreshToken()) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                headers.Authorization = `Bearer ${getAccessToken()}`;
                response = await fetch(finalUrl, { ...options, headers });
            }
        }

        console.log('[API-REQ] Réponse :', { url: finalUrl, status: response.status });
        return response;
    } catch (err) {
        console.error('[API-REQ] Erreur réseau lors de la requête :', err);
        const alertEl = document.getElementById('alert');
        if (alertEl) {
            alertEl.textContent = 'Impossible de contacter le serveur. Vérifiez que le backend est démarré.';
            alertEl.className = 'alert error';
            alertEl.classList.remove('hidden');
        }
        throw err;
    }
}

/**
 * Affiche un message utilisateur en haut de page (succès / erreur).
 */
function showAlert(message, type = 'success') {
    const alert = document.getElementById('alert');
    if (!alert) return;

    alert.textContent = message;
    alert.className = `alert ${type}`;
    alert.classList.remove('hidden');

    setTimeout(() => {
        alert.classList.add('hidden');
    }, 5000);
}

/**
 * Met à jour la visibilité des boutons du header selon l'état de session.
 */
function updateHeaderButtons() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const user = getUser();

    if (user) {
        loginBtn?.classList.add('hidden');
        registerBtn?.classList.add('hidden');
        logoutBtn?.classList.remove('hidden');
    } else {
        loginBtn?.classList.remove('hidden');
        registerBtn?.classList.remove('hidden');
        logoutBtn?.classList.add('hidden');
    }
}

/**
 * Attache les événements du header (navigation et déconnexion).
 */
function attachHeaderListeners() {
    document.getElementById('articlesBtn')?.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    document.getElementById('loginBtn')?.addEventListener('click', () => {
        window.location.href = 'login.html';
    });

    document.getElementById('registerBtn')?.addEventListener('click', () => {
        window.location.href = 'register.html';
    });

    document.getElementById('publishBtn')?.addEventListener('click', () => {
        window.location.href = 'publish.html';
    });

    document.getElementById('authorBtn')?.addEventListener('click', () => {
        window.location.href = 'author.html';
    });

    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        const refreshToken = getRefreshToken();

        if (refreshToken) {
            await fetch(`${apiBase}/auth/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });
        }

        clearSession();
        showAlert('Déconnexion réussie', 'success');
        updateHeaderButtons();
        window.location.href = 'index.html';
    });
}
