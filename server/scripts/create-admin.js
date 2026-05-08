/**
 * Run: node scripts/create-admin.js
 * Admin: ulugbek / ulugbek
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const bcrypt = require('bcryptjs')
const pool = require('../db')

async function main() {
  const hash = bcrypt.hashSync('ulugbek', 10)
  console.log('Hash:', hash)
  console.log('Verify:', bcrypt.compareSync('ulugbek', hash))

  try {
    await pool.query(`
      INSERT INTO users (first_name, last_name, email, phone, username, password_hash, role, plan)
      VALUES ('Ulugbek', 'Admin', 'admin@gmail.com', '+998901234567', 'ulugbek', $1, 'admin', 'vip')
      ON CONFLICT (username) DO UPDATE SET
        password_hash = $1,
        role = 'admin',
        plan = 'vip',
        is_blocked = FALSE
    `, [hash])
    console.log('✅ Admin yaratildi: ulugbek / ulugbek')
  } catch (err) {
    console.error('❌ Xatolik:', err.message)
  } finally {
    await pool.end()
  }
}

main()
