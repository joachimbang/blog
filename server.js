import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import blogRoutes from './routes/blogs.js';
import commentaireRoutes from './routes/commentaires.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares generaux
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/commentaires', commentaireRoutes);

// Route de test simple
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Serveur backend en cours d\'execution' });
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
    console.error('Erreur serveur :', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
});

app.listen(PORT, () => {
    console.log(`Serveur demarre sur http://localhost:${PORT}`);
});
