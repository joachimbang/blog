// Middleware de verification des roles pour les routes protegees
const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Utilisateur non authentifie' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Acces non autorise' });
        }

        next();
    };
};

export { checkRole };
