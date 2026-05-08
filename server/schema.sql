-- ITX Platform Database Schema

-- Sessions table for connect-pg-simple
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  plan VARCHAR(10) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'max', 'vip')),
  plan_expires_at TIMESTAMP,
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  profile_image VARCHAR(500),
  age INTEGER,
  location VARCHAR(200),
  avatar VARCHAR(500)
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  order_num INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url VARCHAR(500),
  video_type VARCHAR(10) DEFAULT 'youtube' CHECK (video_type IN ('youtube', 'local')),
  duration_minutes INTEGER DEFAULT 0,
  order_num INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  pass_percentage INTEGER DEFAULT 70,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Quiz questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Quiz options table
CREATE TABLE IF NOT EXISTS quiz_options (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES quiz_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  watched BOOLEAN DEFAULT FALSE,
  quiz_passed BOOLEAN DEFAULT FALSE,
  quiz_score INTEGER DEFAULT 0,
  completed_at TIMESTAMP,
  UNIQUE(user_id, lesson_id)
);

-- User quiz attempts table
CREATE TABLE IF NOT EXISTS user_quiz_attempts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  passed BOOLEAN DEFAULT FALSE,
  reset_count INTEGER DEFAULT 0,
  attempted_at TIMESTAMP DEFAULT NOW()
);

-- Admin notifications table (3 ta ogohlantirish → SMS)
CREATE TABLE IF NOT EXISTS admin_notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  violation_type VARCHAR(50) NOT NULL,
  violation_text TEXT,
  violation_count INTEGER DEFAULT 3,
  screenshot TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Quiz retake requests table (Qayta topshirish so'rovlari)
CREATE TABLE IF NOT EXISTS quiz_retake_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reset_count INTEGER DEFAULT 0,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- Quiz violations table (Quizdan yiqilganlar - barcha ogohlantirishlar)
CREATE TABLE IF NOT EXISTS quiz_violations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  violation_type VARCHAR(50) NOT NULL,
  violation_text TEXT,
  screenshot TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  plan VARCHAR(10) NOT NULL CHECK (plan IN ('pro', 'max', 'vip')),
  amount INTEGER NOT NULL,
  status VARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  payment_proof_image VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  issued_at TIMESTAMP DEFAULT NOW(),
  certificate_code VARCHAR(100) UNIQUE NOT NULL
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Statistics table
CREATE TABLE IF NOT EXISTS statistics (
  id SERIAL PRIMARY KEY,
  total_users INTEGER DEFAULT 0,
  total_courses INTEGER DEFAULT 0,
  total_videos INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_lesson_id ON comments(lesson_id);

-- Seed: Admin user (password: ulugbek)
INSERT INTO users (first_name, last_name, email, phone, username, password_hash, role, plan)
VALUES (
  'Ulugbek', 'Admin', 'admin@gmail.com', '+998901234567', 'ulugbek',
  '$2a$10$UXxTg/xJp3M0rRUp22HL9Ov87MEcvq0BHs5CypyPJ91J8Na4XdaaG',
  'admin', 'vip'
) ON CONFLICT (username) DO UPDATE SET
  password_hash = '$2a$10$UXxTg/xJp3M0rRUp22HL9Ov87MEcvq0BHs5CypyPJ91J8Na4XdaaG',
  role = 'admin',
  plan = 'vip';

-- Seed: 15 Courses
INSERT INTO courses (title, slug, description, icon, order_num) VALUES
('HTML & CSS Asoslari', 'html-css', 'Web sahifalar yaratishning asosiy tillari - HTML va CSS ni o''rganib, zamonaviy veb-sahifalar yarating.', '🌐', 1),
('JavaScript', 'javascript', 'Dinamik va interaktiv veb-ilovalar yaratish uchun JavaScript dasturlash tilini o''rganing.', '⚡', 2),
('Python', 'python', 'Eng mashhur dasturlash tillaridan biri bo''lgan Python ni noldan professional darajagacha o''rganing.', '🐍', 3),
('React.js', 'reactjs', 'Facebook tomonidan yaratilgan React kutubxonasi bilan zamonaviy SPA ilovalar yarating.', '⚛️', 4),
('Node.js', 'nodejs', 'JavaScript yordamida server tomonida dasturlash - Express.js va REST API yaratish.', '🟢', 5),
('SQL & PostgreSQL', 'sql-postgresql', 'Ma''lumotlar bazasi bilan ishlash - SQL so''rovlari, jadvallar va PostgreSQL.', '🗄️', 6),
('Git & GitHub', 'git-github', 'Versiya boshqaruv tizimi Git va GitHub platformasini professional darajada o''rganing.', '🔀', 7),
('Linux & Terminal', 'linux-terminal', 'Linux operatsion tizimi va terminal buyruqlari bilan ishlashni o''rganing.', '🐧', 8),
('Docker & DevOps', 'docker-devops', 'Konteynerizatsiya texnologiyasi Docker va DevOps amaliyotlarini o''rganing.', '🐳', 9),
('Vue.js', 'vuejs', 'Progressive JavaScript framework Vue.js bilan zamonaviy veb-ilovalar yarating.', '💚', 10),
('TypeScript', 'typescript', 'JavaScript ning kuchli versiyasi TypeScript bilan xavfsiz va kengaytiriladigan kod yozing.', '🔷', 11),
('MongoDB', 'mongodb', 'NoSQL ma''lumotlar bazasi MongoDB bilan ishlashni va Mongoose ORM ni o''rganing.', '🍃', 12),
('Flutter & Dart', 'flutter-dart', 'Google ning Flutter framework i bilan iOS va Android uchun mobil ilovalar yarating.', '📱', 13),
('Machine Learning', 'machine-learning', 'Sun''iy intellekt va machine learning asoslarini Python bilan o''rganing.', '🤖', 14),
('Cybersecurity', 'cybersecurity', 'Axborot xavfsizligi asoslari, etik hacking va himoya usullarini o''rganing.', '🔒', 15)
ON CONFLICT (slug) DO NOTHING;

-- Seed: Statistics
INSERT INTO statistics (total_users, total_courses, total_videos)
VALUES (1250, 15, 340)
ON CONFLICT DO NOTHING;
