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
        const { email, password, nom, prenom } = req.body;

        if (!email || !password || !nom || !prenom) {
            return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
        }

        const existingUser = await db.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'Email deja utilise' });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const result = await db.query(
            `INSERT INTO users (email, password_hash, nom, prenom)
             VALUES ($1, $2, $3, $4)
             RETURNING id, email, nom, prenom, role`,
            [email, password_hash, nom, prenom]
        );

        res.status(201).json({
            message: 'Inscription reussie',
            user: result.rows[0]
        });
    } catch (err) {
        console.error('Erreur lors de l\'inscription:', err);
        res.status(500).json({ error: 'Erreur lors de l\'inscription' });
    }
});

// Route de connexion
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Identifiants incorrects' });
        }

        const user = result.rows[0];
        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
            return res.status(401).json({ error: 'Identifiants incorrects' });
        }

        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        refreshTokens.push(refreshToken);

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
        console.error('Erreur lors de la connexion:', err);
        res.status(500).json({ error: 'Erreur lors de la connexion' });
    }
});

// Route de rafraichissement du token
router.post('/token', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token manquant' });
        }

        if (!refreshTokens.includes(refreshToken)) {
            return res.status(403).json({ error: 'Refresh token invalide' });
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const accessToken = generateAccessToken({
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role
        });

        res.json({ accessToken });
    } catch (err) {
        console.error('Erreur lors du rafraichissement du token:', err);
        res.status(401).json({ error: 'Refresh token invalide ou expire' });
    }
});

// Route de deconnexion
router.post('/logout', (req, res) => {
    const { refreshToken } = req.body;
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
    res.json({ message: 'Deconnexion effectuee' });
});

export default router;
