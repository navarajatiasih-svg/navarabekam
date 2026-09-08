const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function test() {
  console.log("=== VERIFIKASI PERFORMA QUERY LIVE DATABASE ===\n");

  const today = '2026-09-08';
  const tomorrow = '2026-09-09';
  const monthStart = '2026-09-01';
  const monthEnd = '2026-10-01';

  // Test 1: Monthly Finance Query
  console.log("1. Testing Query Finansial Bulanan (Range Scan):");
  const q1 = await pool.query(`
    EXPLAIN ANALYZE
    SELECT "type", SUM("amount") 
    FROM "finance_transactions"
    WHERE "date" >= $1 AND "date" < $2
    GROUP BY "type";
  `, [monthStart, monthEnd]);
  console.log(q1.rows.map(r => r['QUERY PLAN']).join('\n'));
  console.log("\n------------------------------------------------\n");

  // Test 2: Daily Visits Query
  console.log("2. Testing Query Kunjungan Harian (Range Scan):");
  const q2 = await pool.query(`
    EXPLAIN ANALYZE
    SELECT COUNT(*) 
    FROM "patient_visits"
    WHERE "visit_date" >= $1 AND "visit_date" < $2;
  `, [today, tomorrow]);
  console.log(q2.rows.map(r => r['QUERY PLAN']).join('\n'));
  console.log("\n------------------------------------------------\n");

  // Test 3: Therapist Service Commission lookup (eliminating N+1)
  console.log("3. Testing Query Komisi Terapis (Index Scan):");
  const q3 = await pool.query(`
    EXPLAIN ANALYZE
    SELECT * 
    FROM "therapist_service_commissions"
    WHERE "therapist_id" = 'T-001';
  `);
  console.log(q3.rows.map(r => r['QUERY PLAN']).join('\n'));
  console.log("\n------------------------------------------------\n");

  // Test 4: Finance Reference ID lookup
  console.log("4. Testing Query Reference ID (Index Scan):");
  const q4 = await pool.query(`
    EXPLAIN ANALYZE
    SELECT * 
    FROM "finance_transactions"
    WHERE "reference_id" = 'REF-123';
  `);
  console.log(q4.rows.map(r => r['QUERY PLAN']).join('\n'));

  await pool.end();
}

test().catch(console.error);
