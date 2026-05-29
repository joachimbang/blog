// Fonction principale pour gérer la soumission du formulaire d'inscription
function handleRegister() {
    // Récupération de l'élément HTML du formulaire
    const form = document.getElementById('registerForm');

    // Si on n'est pas sur la page d'inscription, on arrête la fonction
    if (!form) return;

    // Ajout d'un écouteur d'événement pour intercepter la validation du formulaire
    form.addEventListener('submit', async (event) => {
        // Empêche le rechargement de la page par défaut
        event.preventDefault();

        // Récupération des valeurs des champs et suppression des espaces superflus (trim)
        const nom = form.nom.value.trim();
        const prenom = form.prenom.value.trim();
        const email = form.email.value.trim();
        const password = form.password.value.trim();
        const role = document.querySelector('input[name="role"]:checked')?.value || 'utilisateur';

        // Récupération du bouton pour modifier son état (indicateur de chargement)
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;

        // Désactivation du bouton et modification du texte pour indiquer le chargement
        submitBtn.disabled = true;
        submitBtn.textContent = 'Inscription en cours...';

        try {
            // Envoi de la requête HTTP POST au backend avec la méthode fetch
            // L'URL utilise `apiBase` défini dans common.js (ex: http://localhost:3000/api)
            const response = await fetch(`${apiBase}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Conversion des données en chaîne JSON pour le transfert
                body: JSON.stringify({ nom, prenom, email, password, role })
            });

            // Récupération de la réponse JSON du serveur
            const data = await response.json();
            console.log('[FRONT][REGISTER] Réponse backend :', data);

            // Si la réponse indique une erreur (code HTTP 400 ou 500 par exemple)
            if (!response.ok) {
                // Affiche une alerte visible et log pour aider le debug
                showAlert(data.error || 'Erreur d’inscription', 'error');
                console.warn('[FRONT][REGISTER] Échec inscription :', data);
                return;
            }

            // Si l'inscription réussit, on affiche un message et on redirige vers la page de connexion
            showAlert('Inscription réussie. Vous allez être redirigé vers la page de connexion.', 'success');

            // Redirection après un délai court pour laisser le message apparaître
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);

        } catch (error) {
            // Interception des erreurs de réseau (ex: serveur backend éteint)
            console.error('[FRONT][REGISTER] Erreur réseau lors de l\'inscription :', error);
            showAlert('Impossible de contacter le serveur. Vérifiez que le backend est en cours d\'exécution.', 'error');
        } finally {
            // Toujours réactiver le bouton et remettre le texte original une fois l'opération terminée
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });
}

// Initialisation au chargement du Document Object Model (DOM)
window.addEventListener('DOMContentLoaded', () => {
    attachHeaderListeners();  // Active les boutons du header
    updateHeaderButtons();    // Met à jour la visibilité (Connecté/Non connecté)
    handleRegister();         // Initialise le formulaire d'inscription
});
