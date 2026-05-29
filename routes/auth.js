import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { generateAccessToken, generateRefreshToken } from '../auth.js';

const router = express.Router();

// Stockage en memoire des refresh tokens pour l'exemple
// En production, stockez ces tokens dans une base de donnees ou un store securise.
let refreshTokens = [];

// Route d'inscription
router.post('/register', async (req, res) => {
    try {
        console.log('\n--- [BACKEND] NOUVELLE TENTATIVE D\'INSCRIPTION ---');
        console.log('[BACKEND] req.body reçu :', req.body);
        let { email, password, nom, prenom, role } = req.body;
        role = String(role || 'utilisateur').trim().toLowerCase();
        const processedRole = role === 'auteur' ? 'auteur' : 'utilisateur';
        console.log(`[BACKEND] Données reçues : email=${email}, nom=${nom}, prenom=${prenom}, role=${role} -> processedRole=${processedRole}`);

        if (!email || !password || !nom || !prenom) {
            console.warn('[BACKEND] Échec : Champs manquants.');
            return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
        }

        console.log(`[BACKEND] Vérification si l'email ${email} existe déjà...`);
        // Requête à la base de données pour vérifier si l'utilisateur existe
        const existingUser = await db.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            console.warn(`[BACKEND] Échec : L'email ${email} est déjà utilisé.`);
            return res.status(409).json({ error: 'Email deja utilise' });
        }

        console.log('[BACKEND] Hachage du mot de passe...');
        // Hachage du mot de passe avec bcrypt pour la sécurité (facteur de coût: 10)
        const password_hash = await bcrypt.hash(password, 10);

        console.log('[BACKEND] Insertion du nouvel utilisateur dans la base de données...');
        console.log('[BACKEND] Paramètres SQL:', [email, password_hash, nom, prenom, processedRole]);
        // Insertion de l'utilisateur en base de données et récupération des données insérées
        const result = await db.query(
            `INSERT INTO users (email, password_hash, nom, prenom, role)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, email, nom, prenom, role`,
            [email, password_hash, nom, prenom, processedRole]
        );

        console.log(`[BACKEND] Succès : Utilisateur ${email} créé avec l'ID ${result.rows[0].id}.`);
        res.status(201).json({
            message: 'Inscription reussie',
            user: result.rows[0]
        });
    } catch (err) {
        console.error('[BACKEND] Erreur critique lors de l\'inscription:', err);
        res.status(500).json({ error: 'Erreur interne lors de l\'inscription' });
    }
});

// Route de connexion
router.post('/login', async (req, res) => {
    try {
        console.log('\n--- [BACKEND] NOUVELLE TENTATIVE DE CONNEXION ---');
        const { email, password } = req.body;
        console.log(`[BACKEND] Email reçu : ${email}`);

        // Recherche de l'utilisateur dans la base de données
        const result = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            console.warn(`[BACKEND] Échec : Aucun compte trouvé pour l'email ${email}.`);
            return res.status(401).json({ error: 'Identifiants incorrects' });
        }

        const user = result.rows[0];
        console.log('[BACKEND] Utilisateur trouvé. Vérification du mot de passe...');

        // Comparaison du mot de passe fourni avec le hash stocké en base de données
        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
            console.warn(`[BACKEND] Échec : Mot de passe incorrect pour l'email ${email}.`);
            return res.status(401).json({ error: 'Identifiants incorrects' });
        }

        console.log('[BACKEND] Mot de passe valide. Génération des tokens JWT...');
        // Création de la charge utile (payload) du token
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role
        };

        // Génération du token d'accès (courte durée) et du token de rafraîchissement (longue durée)
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        // Stockage du refresh token en mémoire (idéalement en DB en production)
        refreshTokens.push(refreshToken);

        console.log(`[BACKEND] Succès : Connexion réussie pour ${email}. Tokens générés.`);
        res.json({
            message: 'Connexion reussie',
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                nom: user.nom,
                prenom: user.prenom,
                role: user.role
            }
        });
    } catch (err) {
        console.error('[BACKEND] Erreur critique lors de la connexion:', err);
        res.status(500).json({ error: 'Erreur interne lors de la connexion' });
    }
});

// Route de rafraichissement du token
router.post('/token', async (req, res) => {
    try {
        console.log('\n--- [BACKEND] DEMANDE DE RAFRAÎCHISSEMENT DE TOKEN ---');
        const { refreshToken } = req.body;

        if (!refreshToken) {
            console.warn('[BACKEND] Échec : Aucun refresh token fourni.');
            return res.status(400).json({ error: 'Refresh token manquant' });
        }

        if (!refreshTokens.includes(refreshToken)) {
            console.warn('[BACKEND] Échec : Refresh token invalide ou inconnu.');
            return res.status(403).json({ error: 'Refresh token invalide' });
        }

        console.log('[BACKEND] Vérification de la validité du refresh token...');
        // Vérification de la validité cryptographique du refresh token
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        console.log('[BACKEND] Token valide. Génération d\'un nouveau token d\'accès...');
        // Génération d'un nouveau token d'accès avec les mêmes informations
        const accessToken = generateAccessToken({
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role
        });

        console.log(`[BACKEND] Succès : Nouveau token d'accès généré pour l'utilisateur ID ${decoded.userId}.`);
        res.json({ accessToken });
    } catch (err) {
        console.error('[BACKEND] Erreur lors du rafraichissement du token:', err);
        res.status(401).json({ error: 'Refresh token invalide ou expire' });
    }
});

// Route de deconnexion
router.post('/logout', (req, res) => {
    console.log('\n--- [BACKEND] TENTATIVE DE DÉCONNEXION ---');
    const { refreshToken } = req.body;

    // Suppression du refresh token de notre stockage en mémoire
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

    console.log('[BACKEND] Succès : Refresh token supprimé. Déconnexion effectuée.');
    res.json({ message: 'Deconnexion effectuee' });
});

export default router;
