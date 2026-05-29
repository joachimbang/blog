import db from './db.js';
import bcrypt from 'bcrypt';

(async () => {
  try {
    const password_hash = await bcrypt.hash('Secret123!', 10);
    const result = await db.query(
      `INSERT INTO users (email, password_hash, nom, prenom, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, nom, prenom, role`,
      ['testauteur2@example.com', password_hash, 'Test2', 'Auteur2', 'auteur']
    );
    console.log(result.rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
})();
