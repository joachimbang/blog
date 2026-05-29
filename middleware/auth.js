import jwt from 'jsonwebtoken';

// Middleware d'authentification JWT pour les routes proteges
const authMiddleware = (req, res, next) => {
    try {
        const authorization = req.header('Authorization');
        const token = authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'Token d\'authentification manquant' });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;

        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expire' });
        }

        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Token invalide' });
        }

        console.error('Erreur d\'authentification:', err);
        res.status(500).json({ error: 'Erreur lors de l\'authentification' });
    }
};

export default authMiddleware;
