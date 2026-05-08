/**
 * Database adapter — SQLite (local) yoki PostgreSQL (production)
 * PostgreSQL o'rnatilmagan bo'lsa SQLite ishlatadi
 */
require('dotenv').config();
const path = require('path');
const fs = require('fs');

let pool;

// PostgreSQL urinib ko'rish
async function tryPostgres() {
  try {
    const { Pool } = require('pg');
    const p = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 3000,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    await p.query('SELECT 1');
    console.log('✅ PostgreSQL ulandi');
    return p;
  } catch (err) {
    console.log('⚠️  PostgreSQL ulashilmadi:', err.message);
    return null;
  }
}

// SQLite adapter — pg Pool interfeysi bilan mos
function createSQLitePool() {
  const Database = require('better-sqlite3');
  const dbPath = path.join(__dirname, 'itx.db');
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  console.log('✅ SQLite ishlatilmoqda:', dbPath);

  // pg Pool.query() ni taqlid qiluvchi adapter
  return {
    query: async (text, params = []) => {
      try {
        // PostgreSQL $1,$2 → ? ga o'tkazish
        let sql = text.replace(/\$(\d+)/g, '?');

        // RETURNING ni handle qilish
        const hasReturning = /RETURNING/i.test(sql);

        // ON CONFLICT handling
        sql = sql.replace(/ON CONFLICT DO NOTHING/gi, 'OR IGNORE');
        sql = sql.replace(/ON CONFLICT \(([^)]+)\) DO NOTHING/gi, 'OR IGNORE');
        // ON CONFLICT ... DO UPDATE SET → bu SQLite da ishlamaydi, alohida handle qilinadi
        // Agar ON CONFLICT ... DO UPDATE bo'lsa, OR REPLACE ga o'tkazamiz
        sql = sql.replace(/ON CONFLICT \(([^)]+)\) DO UPDATE SET[^;]*/gi, '');

        // PostgreSQL specific → SQLite
        sql = sql.replace(/NOW\(\)/gi, "datetime('now')");
        sql = sql.replace(/INTERVAL '(\d+) days'/gi, (_, n) => `'+${n} days'`);
        sql = sql.replace(/NOW\(\) - INTERVAL '(\d+) days'/gi, (_, n) => `datetime('now', '-${n} days')`);
        sql = sql.replace(/NOW\(\) \+ INTERVAL '(\d+) days'/gi, (_, n) => `datetime('now', '+${n} days')`);
        sql = sql.replace(/SERIAL PRIMARY KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT');
        sql = sql.replace(/BOOLEAN DEFAULT (TRUE|FALSE)/gi, (_, v) => `INTEGER DEFAULT ${v === 'TRUE' ? 1 : 0}`);
        sql = sql.replace(/\bTRUE\b/g, '1').replace(/\bFALSE\b/g, '0');
        sql = sql.replace(/VARCHAR\(\d+\)/gi, 'TEXT');
        sql = sql.replace(/INTEGER\[\]/gi, 'TEXT');
        sql = sql.replace(/TIMESTAMP(\(\d+\))?/gi, 'TEXT');
        sql = sql.replace(/CHECK \([^)]+\)/g, '');
        sql = sql.replace(/COLLATE "default"/g, '');
        sql = sql.replace(/NOT DEFERRABLE INITIALLY IMMEDIATE/g, '');
        sql = sql.replace(/CREATE INDEX IF NOT EXISTS[^;]+;/g, '');
        sql = sql.replace(/::text/gi, '');
        sql = sql.replace(/::integer/gi, '');

        const isSelect = /^\s*(SELECT|WITH)/i.test(sql);
        const isInsert = /^\s*INSERT/i.test(sql);
        const isUpdate = /^\s*UPDATE/i.test(sql);
        const isDelete = /^\s*DELETE/i.test(sql);

        // Params ni SQLite uchun convert
        const convertedParams = (params || []).map(p => {
          if (p === true) return 1;
          if (p === false) return 0;
          if (p instanceof Date) return p.toISOString();
          return p;
        });

        if (isSelect) {
          const stmt = db.prepare(sql);
          const rows = stmt.all(...convertedParams);
          // Boolean fields ni convert
          const converted = rows.map(row => {
            const r = { ...row };
            for (const k of Object.keys(r)) {
              if (r[k] === 1 && (k.includes('block') || k.includes('watch') || k.includes('pass') || k.includes('correct'))) r[k] = true;
              if (r[k] === 0 && (k.includes('block') || k.includes('watch') || k.includes('pass') || k.includes('correct'))) r[k] = false;
            }
            return r;
          });
          return { rows: converted, rowCount: converted.length };
        }

        if (isInsert && hasReturning) {
          // RETURNING ni olib tashlab, keyin SELECT qilamiz
          const cleanSql = sql.replace(/RETURNING[^;]*/i, '');
          const stmt = db.prepare(cleanSql);
          const info = stmt.run(...convertedParams);
          const tableName = sql.match(/INSERT INTO (\w+)/i)?.[1];
          if (tableName && info.lastInsertRowid) {
            const row = db.prepare(`SELECT * FROM ${tableName} WHERE rowid = ?`).get(info.lastInsertRowid);
            if (row) {
              // Boolean convert
              for (const k of Object.keys(row)) {
                if (row[k] === 1 && (k.includes('block') || k.includes('watch') || k.includes('pass') || k.includes('correct'))) row[k] = true;
                if (row[k] === 0 && (k.includes('block') || k.includes('watch') || k.includes('pass') || k.includes('correct'))) row[k] = false;
              }
              return { rows: [row], rowCount: 1 };
            }
          }
          return { rows: [], rowCount: info.changes };
        }

        if (isInsert || isUpdate || isDelete) {
          const cleanSql = sql.replace(/RETURNING[^;]*/i, '');
          const stmt = db.prepare(cleanSql);
          const info = stmt.run(...convertedParams);
          return { rows: [], rowCount: info.changes };
        }

        // DDL (CREATE TABLE, etc.)
        db.exec(sql);
        return { rows: [], rowCount: 0 };

      } catch (err) {
        console.error('SQLite query error:', err.message);
        console.error('SQL:', text.substring(0, 200));
        throw err;
      }
    },
    end: async () => { db.close(); },
    _db: db, // raw access
  };
}

// Schema yaratish (SQLite uchun)
function initSQLiteSchema(pool) {
  const db = pool._db;
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      plan TEXT DEFAULT 'free',
      plan_expires_at TEXT,
      is_blocked INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      profile_image TEXT,
      age INTEGER,
      location TEXT,
      avatar TEXT
    );

    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      icon TEXT,
      order_num INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      video_url TEXT,
      video_type TEXT DEFAULT 'youtube',
      duration_minutes INTEGER DEFAULT 0,
      order_num INTEGER DEFAULT 0,
      is_blocked INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      pass_percentage INTEGER DEFAULT 70,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS quiz_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
      question_text TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS quiz_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER REFERENCES quiz_questions(id) ON DELETE CASCADE,
      option_text TEXT NOT NULL,
      is_correct INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS user_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
      watched INTEGER DEFAULT 0,
      quiz_passed INTEGER DEFAULT 0,
      quiz_score INTEGER DEFAULT 0,
      completed_at TEXT,
      UNIQUE(user_id, lesson_id)
    );

    CREATE TABLE IF NOT EXISTS user_quiz_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
      score INTEGER DEFAULT 0,
      passed INTEGER DEFAULT 0,
      attempted_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      plan TEXT NOT NULL,
      amount INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      payment_proof_image TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS certificates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
      issued_at TEXT DEFAULT (datetime('now')),
      certificate_code TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      rating INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS statistics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total_users INTEGER DEFAULT 0,
      total_courses INTEGER DEFAULT 0,
      total_videos INTEGER DEFAULT 0,
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Migration: mavjud jadvalga yangi columnlar qo'shish
  try {
    db.exec(`ALTER TABLE lessons ADD COLUMN is_blocked INTEGER DEFAULT 0`);
    console.log('✅ lessons.is_blocked column qo\'shildi');
  } catch (e) { /* already exists */ }

  try {
    db.exec(`ALTER TABLE users ADD COLUMN is_super_admin INTEGER DEFAULT 0`);
  } catch (e) { /* already exists */ }

  try {
    db.exec(`ALTER TABLE user_quiz_attempts ADD COLUMN reset_count INTEGER DEFAULT 0`);
  } catch (e) { /* already exists */ }

  // Yangi jadvallar - Face ID monitoring uchun
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS admin_notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
        violation_type TEXT NOT NULL,
        violation_text TEXT,
        violation_count INTEGER DEFAULT 3,
        screenshot TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);
    console.log('✅ admin_notifications jadvali yaratildi');
  } catch (e) { /* already exists */ }

  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS quiz_retake_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'pending',
        reset_count INTEGER DEFAULT 0,
        reason TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT
      );
    `);
    console.log('✅ quiz_retake_requests jadvali yaratildi');
  } catch (e) { /* already exists */ }

  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS quiz_violations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
        violation_type TEXT NOT NULL,
        violation_text TEXT,
        screenshot TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);
    console.log('✅ quiz_violations jadvali yaratildi');
  } catch (e) { /* already exists */ }

  // Seed admin
  const bcrypt = require('bcryptjs');
  const adminHash = bcrypt.hashSync('ulugbek', 10);
  const existing = db.prepare("SELECT id FROM users WHERE username='ulugbek'").get();
  if (!existing) {
    db.prepare(`
      INSERT INTO users (first_name, last_name, email, phone, username, password_hash, role, plan)
      VALUES ('Ulugbek', 'Valiyev', 'admin@gmail.com', '+998901234567', 'ulugbek', ?, 'admin', 'vip')
    `).run(adminHash);
    console.log('✅ Admin yaratildi: ulugbek / ulugbek');
  } else {
    // Parolni yangilash
    db.prepare("UPDATE users SET password_hash=?, role='admin', plan='vip', first_name='Ulugbek', last_name='Valiyev' WHERE username='ulugbek'").run(adminHash);
    console.log('✅ Admin yangilandi: ulugbek / ulugbek');
  }

  // Seed courses
  const courseCount = db.prepare('SELECT COUNT(*) as c FROM courses').get();
  if (courseCount.c === 0) {
    const courses = [
      ['HTML & CSS Asoslari', 'html-css', 'Web sahifalar yaratishning asosiy tillari.', '🌐', 1],
      ['JavaScript', 'javascript', 'Dinamik va interaktiv veb-ilovalar yaratish.', '⚡', 2],
      ['Python', 'python', 'Eng mashhur dasturlash tillaridan biri.', '🐍', 3],
      ['React.js', 'reactjs', 'Zamonaviy SPA ilovalar yaratish.', '⚛️', 4],
      ['Node.js', 'nodejs', 'JavaScript bilan server dasturlash.', '🟢', 5],
      ['SQL & PostgreSQL', 'sql-postgresql', 'Ma\'lumotlar bazasi bilan ishlash.', '🗄️', 6],
      ['Git & GitHub', 'git-github', 'Versiya boshqaruv tizimi.', '🔀', 7],
      ['Linux & Terminal', 'linux-terminal', 'Linux va terminal buyruqlari.', '🐧', 8],
      ['Docker & DevOps', 'docker-devops', 'Konteynerizatsiya texnologiyasi.', '🐳', 9],
      ['Vue.js', 'vuejs', 'Progressive JavaScript framework.', '💚', 10],
      ['TypeScript', 'typescript', 'JavaScript ning kuchli versiyasi.', '🔷', 11],
      ['MongoDB', 'mongodb', 'NoSQL ma\'lumotlar bazasi.', '🍃', 12],
      ['Flutter & Dart', 'flutter-dart', 'Mobil ilovalar yaratish.', '📱', 13],
      ['Machine Learning', 'machine-learning', 'Sun\'iy intellekt asoslari.', '🤖', 14],
      ['Cybersecurity', 'cybersecurity', 'Axborot xavfsizligi asoslari.', '🔒', 15],
    ];
    const stmt = db.prepare('INSERT OR IGNORE INTO courses (title, slug, description, icon, order_num) VALUES (?, ?, ?, ?, ?)');
    courses.forEach(c => stmt.run(...c));
    console.log('✅ 15 ta kurs qo\'shildi');
  }

  // Seed statistics
  const statCount = db.prepare('SELECT COUNT(*) as c FROM statistics').get();
  if (statCount.c === 0) {
    db.prepare('INSERT INTO statistics (total_users, total_courses, total_videos) VALUES (1250, 15, 340)').run();
  }
}

// Init
async function init() {
  const pgPool = await tryPostgres();
  if (pgPool) {
    pool = pgPool;
  } else {
    pool = createSQLitePool();
    initSQLiteSchema(pool);
  }
  global.pool = pool;
}

// Proxy object — init tugaguncha kutadi
const handler = {
  get(target, prop) {
    if (prop === 'query') {
      return async (...args) => {
        if (!pool) await new Promise(r => setTimeout(r, 100));
        return pool.query(...args);
      };
    }
    if (prop === '_db') return pool?._db;
    return pool?.[prop];
  }
};

const proxyPool = new Proxy({}, handler);

// Start init
init().catch(err => {
  console.error('DB init error:', err.message);
  process.exit(1);
});

module.exports = proxyPool;
