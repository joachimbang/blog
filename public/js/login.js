// Fonction principale pour gérer la soumission du formulaire de connexion
// NOTE: `apiBase` est défini dans `common.js` afin d'éviter les doublons de déclaration.
function handleLogin() {
    // Récupération de l'élément HTML du formulaire
    const form = document.getElementById('loginForm');

    // Si la page ne contient pas le formulaire (ex: on n'est pas sur login.html), on arrête ici
    if (!form) return;

    // Ajout d'un écouteur d'événement sur la soumission du formulaire
    form.addEventListener('submit', async (event) => {
        // Empêche le comportement par défaut du navigateur (rechargement de la page)
        event.preventDefault();

        // Récupération et nettoyage (trim) des valeurs saisies par l'utilisateur
        const email = form.email.value.trim();
        const password = form.password.value.trim();

        // Récupération du bouton pour modifier son état (indicateur de chargement)
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;

        // Désactivation du bouton et modification du texte pour indiquer le chargement
        submitBtn.disabled = true;
        submitBtn.textContent = 'Connexion en cours...';

        try {
                // Envoi de la requête HTTP POST au backend avec la méthode fetch
                // L'URL utilise `apiBase` (ex: http://localhost:3000/api)
                const response = await fetch(`${apiBase}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Conversion des données JavaScript en chaîne JSON pour le corps de la requête
                body: JSON.stringify({ email, password })
            });

            // Récupération de la réponse JSON du backend
            const data = await response.json();
            // Log pédagogique : affichage du retour du backend
            console.log('[FRONT][LOGIN] Réponse backend :', data);

            // Si la réponse n'est pas "ok" (status en dehors de 200-299), on affiche une erreur
            if (!response.ok) {
                // Affichage d'un message d'erreur visible à l'utilisateur
                showAlert(data.error || 'Erreur de connexion', 'error');
                console.warn('[FRONT][LOGIN] Échec connexion :', data);
                return;
            }

            // Si tout s'est bien passé, on enregistre les tokens et l'utilisateur dans le stockage local
            // Enregistrement des tokens et de l'utilisateur dans le stockage local
            setSession({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user });

            // Message de succès visible pour l'utilisateur
            showAlert('Connexion réussie ! Redirection...', 'success');

            // Redirection vers la page d'accueil après un court délai
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);

        } catch (error) {
            // Ce bloc s'exécute si le serveur est injoignable (ex: backend éteint) ou problème réseau
            console.error('[FRONT][LOGIN] Erreur réseau lors de la connexion :', error);
            showAlert('Impossible de se connecter au serveur. Vérifiez que le backend est allumé.', 'error');
        } finally {
            // Le bloc finally s'exécute toujours, que ça réussisse ou échoue
            // On restaure l'état initial du bouton
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });
}

// Le code à l'intérieur s'exécutera uniquement quand la structure de la page HTML sera complètement chargée
window.addEventListener('DOMContentLoaded', () => {
    attachHeaderListeners();  // Attache les événements aux boutons du header
    updateHeaderButtons();    // Met à jour l'affichage des boutons (Connexion/Déconnexion) selon l'état
    handleLogin();            // Initialise la gestion du formulaire
});
