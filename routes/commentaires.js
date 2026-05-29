import express from 'express';
import db from '../db.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// ============================================================================
// RECUPERER LES COMMENTAIRES D'UN BLOG
// ============================================================================
router.get('/blog/:blogId', async (req, res) => {
    try {
        const { blogId } = req.params;

        const result = await db.query(`
            SELECT c.*, u.nom, u.prenom, u.email
            FROM commentaires c
            LEFT JOIN users u ON c.auteur_id = u.id
            WHERE c.blog_id = $1
            ORDER BY c.date_creation ASC
        `, [blogId]);

        res.json({ commentaires: result.rows });
    } catch (err) {
        console.error('Erreur:', err);
        res.status(500).json({ error: 'Erreur lors de la recuperation des commentaires' });
    }
});

// ============================================================================
// CREER UN COMMENTAIRE
// ============================================================================
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { contenu, blog_id } = req.body;
        const auteur_id = req.user.userId;

        if (!contenu || !blog_id) {
            return res.status(400).json({ error: 'Contenu et blog_id obligatoires' });
        }

        const blog = await db.query('SELECT id FROM blogs WHERE id = $1', [blog_id]);
        if (blog.rows.length === 0) {
            return res.status(404).json({ error: 'Blog non trouve' });
        }

        const result = await db.query(
            `INSERT INTO commentaires (contenu, auteur_id, blog_id)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [contenu, auteur_id, blog_id]
        );

        res.status(201).json({
            message: 'Commentaire cree avec succes',
            commentaire: result.rows[0]
        });
    } catch (err) {
        console.error('Erreur:', err);
        res.status(500).json({ error: 'Erreur lors de la creation du commentaire' });
    }
});

// ============================================================================
// SUPPRIMER UN COMMENTAIRE
// ============================================================================
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;

        const commentaire = await db.query('SELECT * FROM commentaires WHERE id = $1', [id]);
        if (commentaire.rows.length === 0) {
            return res.status(404).json({ error: 'Commentaire non trouve' });
        }

        if (userRole !== 'admin' && commentaire.rows[0].auteur_id !== userId) {
            return res.status(403).json({ error: 'Acces non autorise' });
        }

        await db.query('DELETE FROM commentaires WHERE id = $1', [id]);

        res.json({ message: 'Commentaire supprime avec succes' });
    } catch (err) {
        console.error('Erreur:', err);
        res.status(500).json({ error: 'Erreur lors de la suppression du commentaire' });
    }
});

export default router;
