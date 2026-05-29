import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configuration de la connexion PostgreSQL via les variables d'environnement
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    // port: process.env.DB_PORT,
    max: 20,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});

// Export d'une fonction query simple pour l'utilisation dans l'application
const query = (text, params) => pool.query(text, params);

export { query, pool };
export default {
    query,
    pool
};
