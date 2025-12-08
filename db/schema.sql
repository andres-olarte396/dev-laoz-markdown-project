-- Schema for L4OZ Learning Platform Database
-- Version: 1.0.0
-- Created: 2025-12-07

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    display_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- COURSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY, -- e.g., 'teach-laoz-communication'
    title TEXT NOT NULL,
    description TEXT,
    level TEXT, -- 'Básico', 'Intermedio', 'Avanzado'
    duration_hours INTEGER,
    total_modules INTEGER,
    author TEXT,
    version TEXT,
    cover_image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- MODULES TABLE
-- TOPICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY, -- e.g., 'teach-laoz-communication/modulo1/presentacion'
    module_id TEXT NOT NULL,
    title TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Path to .md file
    audio_path TEXT, -- Path to .mp3 file (optional)
    evaluation_path TEXT, -- Path to .md evaluation file (optional)
    order_index INTEGER NOT NULL,
    estimated_minutes INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

-- ============================================
-- PROGRESS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course_id TEXT NOT NULL,
    module_id TEXT,
    topic_id TEXT,
    completed BOOLEAN DEFAULT 0,
    last_position INTEGER DEFAULT 0, -- For audio/scroll position
    time_spent_seconds INTEGER DEFAULT 0,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    UNIQUE(user_id, topic_id)
);

-- ============================================
-- EVALUATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS evaluations (
    id TEXT PRIMARY KEY, -- e.g., 'teach-laoz-communication/modulo1/evaluacion'
    module_id TEXT NOT NULL,
    title TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Path to evaluacion.md
    total_questions INTEGER,
    passing_score REAL DEFAULT 70.0,
    time_limit_minutes INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

-- ============================================
-- EVALUATION RESULTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS evaluation_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    evaluation_id TEXT NOT NULL,
    score REAL NOT NULL,
    max_score REAL NOT NULL,
    percentage REAL NOT NULL,
    answers JSON NOT NULL, -- JSON array of answers
    time_spent_seconds INTEGER,
    passed BOOLEAN DEFAULT 0,
    attempt_number INTEGER DEFAULT 1,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE CASCADE
);

-- ============================================
-- BOOKMARKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    topic_id TEXT NOT NULL,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    UNIQUE(user_id, topic_id)
);

-- ============================================
-- SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_settings (
    user_id INTEGER PRIMARY KEY,
    theme TEXT DEFAULT 'light', -- 'light' or 'dark'
    font_size TEXT DEFAULT 'medium', -- 'small', 'medium', 'large'
    audio_speed REAL DEFAULT 1.0,
    auto_play BOOLEAN DEFAULT 0,
    preferences JSON, -- Additional preferences as JSON
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_progress_user_course ON progress(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_progress_topic ON progress(topic_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_results_user ON evaluation_results(user_id);
CREATE INDEX IF NOT EXISTS idx_modules_course ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_topics_module ON topics(module_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_courses_timestamp 
AFTER UPDATE ON courses
BEGIN
    UPDATE courses SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_progress_timestamp 
AFTER UPDATE ON progress
BEGIN
    UPDATE progress SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ============================================
-- DEFAULT DATA
-- ============================================
-- Insert default user for local development
INSERT OR IGNORE INTO users (id, username, email, display_name) 
VALUES (1, 'guest', 'guest@l4oz.local', 'Guest User');

-- Insert default settings for guest user
INSERT OR IGNORE INTO user_settings (user_id) 
VALUES (1);
