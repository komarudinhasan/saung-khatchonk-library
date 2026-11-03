-- STRUKTUR DATABASE PERPUSTAKAAN DIGITAL SAUNG KHATCHONK
-- Dapat diimplementasikan di Google Sheets atau PostgreSQL / Supabase (Gratis)

CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'MEMBER',
  category VARCHAR(30) DEFAULT 'MEMBER BIASA',
  status VARCHAR(20) DEFAULT 'AKTIF',
  reg_date DATE NOT NULL,
  expired_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE books (
  id VARCHAR(50) PRIMARY KEY, -- Kode Pengarsipan (Contoh: SK-2026-00001)
  title TEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  publisher VARCHAR(255) NOT NULL,
  year INT NOT NULL,
  isbn VARCHAR(50),
  category VARCHAR(20) NOT NULL, -- Biasa / VIP
  format VARCHAR(20) NOT NULL,   -- PDF, EPUB, DOC, dll
  status VARCHAR(30) DEFAULT 'Tersedia',
  description TEXT,
  cover_url TEXT,
  gdrive_file_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(id),
  amount INT NOT NULL,
  proof_url TEXT,
  status VARCHAR(30) DEFAULT 'MENUNGGU VERIFIKASI',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE physical_visits (
  id SERIAL PRIMARY KEY,
  member_name VARCHAR(255) NOT NULL,
  user_id VARCHAR(50),
  visit_date DATE NOT NULL,
  purpose TEXT,
  officer VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
