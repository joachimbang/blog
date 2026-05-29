import db from './db.js';

(async () => {
  try {
    const defaults = await db.query(`
      SELECT column_name, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
        AND column_name = 'role'
    `);
    console.log('Defaults:', defaults.rows);

    const triggers = await db.query(`
      SELECT tgname, pg_get_triggerdef(t.oid) AS definition
      FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      WHERE c.relname = 'users'
        AND NOT t.tgisinternal
    `);
    console.log('Triggers:', triggers.rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
})();
