import db from './db.js';

(async () => {
  try {
    const result = await db.query('SELECT id,email,nom,prenom,role FROM users WHERE email=$1', ['testauteur@example.com']);
    console.log(result.rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
})();
