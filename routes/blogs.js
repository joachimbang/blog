import express from 'express';
import db from '../db.js';
import authMiddleware from '../middleware/auth.js';
import { checkRole } from '../middleware/roles.js';

const router = express.Router();

// Recuperer tous les blogs (lecture publique)
router.get('/', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT b.*, u.nom, u.prenom, u.email as auteur_email,
                   COUNT(c.id) as nombre_commentaires
            FROM blogs b
            LEFT JOIN users u ON b.auteur_id = u.id
            LEFT JOIN commentaires c ON b.id = c.blog_id
            GROUP BY b.id, u.nom, u.prenom, u.email
            ORDER BY b.date_creation DESC
        `);

        res.json({ blogs: result.rows });
    } catch (err) {
        console.error('Erreur lors de la recuperation des blogs :', err);
        res.status(500).json({ error: 'Erreur lors de la recuperation des blogs' });
    }
});

// Recuperer un blog par ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(`
            SELECT b.*, u.nom, u.prenom, u.email as auteur_email
            FROM blogs b
            LEFT JOIN users u ON b.auteur_id = u.id
            WHERE b.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Blog non trouve' });
        }

        res.json({ blog: result.rows[0] });
    } catch (err) {
        console.error('Erreur lors de la recuperation du blog :', err);
        res.status(500).json({ error: 'Erreur lors de la recuperation du blog' });
    }
});

// Creer un nouveau blog (auteur ou admin)
router.post('/', authMiddleware, checkRole('auteur', 'admin'), async (req, res) => {
    try {
        const { titre, contenu } = req.body;
        const auteur_id = req.user.userId;

        if (!titre || !contenu) {
            return res.status(400).json({ error: 'Titre et contenu obligatoires' });
        }

        const result = await db.query(
            `INSERT INTO blogs (titre, contenu, auteur_id)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [titre, contenu, auteur_id]
        );

        res.status(201).json({
            message: 'Blog cree avec succes',
            blog: result.rows[0]
        });
    } catch (err) {
        console.error('Erreur lors de la creation du blog :', err);
        res.status(500).json({ error: 'Erreur lors de la creation du blog' });
    }
});

// Modifier un blog existant (auteur ou admin)
router.put('/:id', authMiddleware, checkRole('auteur', 'admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { titre, contenu } = req.body;
        const userId = req.user.userId;
        const userRole = req.user.role;

        const blog = await db.query('SELECT * FROM blogs WHERE id = $1', [id]);
        if (blog.rows.length === 0) {
            return res.status(404).json({ error: 'Blog non trouve' });
        }

        if (userRole !== 'admin' && blog.rows[0].auteur_id !== userId) {
            return res.status(403).json({ error: 'Acces non autorise' });
        }

        const result = await db.query(
            `UPDATE blogs
             SET titre = $1, contenu = $2, date_modification = CURRENT_TIMESTAMP
             WHERE id = $3
             RETURNING *`,
            [titre, contenu, id]
        );

        res.json({
            message: 'Blog modifie avec succes',
            blog: result.rows[0]
        });
    } catch (err) {
        console.error('Erreur lors de la modification du blog :', err);
        res.status(500).json({ error: 'Erreur lors de la modification du blog' });
    }
});

// Supprimer un blog (auteur ou admin)
router.delete('/:id', authMiddleware, checkRole('auteur', 'admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;

        const blog = await db.query('SELECT * FROM blogs WHERE id = $1', [id]);
        if (blog.rows.length === 0) {
            return res.status(404).json({ error: 'Blog non trouve' });
        }

        if (userRole !== 'admin' && blog.rows[0].auteur_id !== userId) {
            return res.status(403).json({ error: 'Acces non autorise' });
        }

        await db.query('DELETE FROM blogs WHERE id = $1', [id]);

        res.json({ message: 'Blog supprime avec succes' });
    } catch (err) {
        console.error('Erreur lors de la suppression du blog :', err);
        res.status(500).json({ error: 'Erreur lors de la suppression du blog' });
    }
});

export default router;
