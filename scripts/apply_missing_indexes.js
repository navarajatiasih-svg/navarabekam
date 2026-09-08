const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const connectionString =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.DATABASE_PUBLIC_URL ||
  process.env.POSTGRESQL_URL;

if (!connectionString) {
  console.error("\n❌ ERROR: URL Database tidak ditemukan!");
  console.error("Database Anda tersimpan di cloud (Supabase / Neon / remote server).");
  console.error("Script ini membutuhkan variabel POSTGRES_URL.\n");
  console.error("Pilihan solusi:");
  console.error("1. Buat file .env.local di folder root project berisi:");
  console.error('   POSTGRES_URL="postgresql://user:password@host:port/dbname?sslmode=require"');
  console.error("   Lalu jalankan: node scripts/apply_missing_indexes.js\n");
  console.error("2. ATAU copy seluruh isi file:");
  console.error("   drizzle/0005_add_missing_indexes.sql");
  console.error("   langsung ke menu SQL Editor di dashboard database Anda (Supabase / Neon / pgAdmin).\n");
  process.exit(1);
}

const isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");

const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000
});

async function main() {
  console.log("=== NAVARA DATABASE INDEXING RUNNER ===");
  console.log("Connecting to database...");

  // Test connection first
  let client;
  try {
    client = await pool.connect();
    console.log("Database connected successfully! ✅\n");
  } catch (connErr) {
    console.error(`\n❌ Gagal terhubung ke database: ${connErr.message}`);
    console.error("Pastikan host, user, password, dan port pada POSTGRES_URL sudah benar.\n");
    process.exit(1);
  } finally {
    if (client) client.release();
  }

  const sqlFilePath = path.join(__dirname, '..', 'drizzle', '0005_add_missing_indexes.sql');
  if (!fs.existsSync(sqlFilePath)) {
    console.error(`Migration file not found: ${sqlFilePath}`);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');
  const statements = sqlContent
    .split(/--> statement-breakpoint/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Found ${statements.length} index statements to execute.\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const rawStmt = statements[i];
    const lines = rawStmt.split('\n').filter(l => !l.trim().startsWith('--')).join(' ').trim();
    if (!lines) continue;

    const matchName = lines.match(/CREATE INDEX (?:IF NOT EXISTS )?"([^"]+)"/i);
    const indexName = matchName ? matchName[1] : `Index #${i + 1}`;

    process.stdout.write(`[${i + 1}/${statements.length}] Creating index "${indexName}"... `);

    try {
      await pool.query(lines);
      console.log("OK ✅");
      successCount++;
    } catch (err) {
      console.log(`FAILED ❌ (${err.message})`);
      failCount++;
    }
  }

  console.log(`\n=== Migration Complete: ${successCount} succeeded, ${failCount} failed ===\n`);

  try {
    const res = await pool.query(`
      SELECT tablename, indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      ORDER BY tablename, indexname;
    `);
    console.log(`Total active indexes in database: ${res.rows.length}`);
  } catch (err) {
    // Ignore verification query failure
  }

  await pool.end();
}

main().catch(err => {
  console.error("Migration fatal error:", err);
  process.exit(1);
});
