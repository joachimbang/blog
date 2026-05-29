import db from './db.js';

(async () => {
  try {
    const rules = await db.query(`SELECT * FROM pg_rules WHERE schemaname = 'public' AND tablename = 'users'`);
    console.log('Rules:', rules.rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
})();
