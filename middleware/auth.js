import jwt from 'jsonwebtoken';

// Middleware d'authentification JWT pour les routes proteges
const authMiddleware = (req, res, next) => {
    try {
        // Récupération de l'en-tête Authorization
        const authorization = req.header('Authorization');
        // On retire le préfixe "Bearer " pour ne garder que le token
        const token = authorization?.replace('Bearer ', '');

        // Si aucun token fourni, on refuse l'accès
        if (!token) {
            console.warn('[AUTH-MW] Token manquant pour la route', req.method, req.url);
            return res.status(401).json({ error: 'Token d\'authentification manquant' });
        }

        // Vérification du token JWT et décodage
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        // Stockage des informations décodées dans req.user pour les routes ultérieures
        req.user = decoded;

        console.log('[AUTH-MW] Token valide pour userId =', decoded.userId);
        next();
    } catch (err) {
        // Gestion des erreurs JWT courantes
        if (err.name === 'TokenExpiredError') {
            console.warn('[AUTH-MW] Token expiré');
            return res.status(401).json({ error: 'Token expire' });
        }

        if (err.name === 'JsonWebTokenError') {
            console.warn('[AUTH-MW] Token invalide :', err.message);
            return res.status(401).json({ error: 'Token invalide' });
        }

        // Erreur inattendue
        console.error('[AUTH-MW] Erreur lors de l\'authentification :', err);
        res.status(500).json({ error: 'Erreur lors de l\'authentification' });
    }
};

export default authMiddleware;
