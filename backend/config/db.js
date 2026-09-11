const { Pool } = require('pg');
let Database = null;
try {
    Database = require('better-sqlite3');
} catch (e) {
    // Better-sqlite3 native C++ bindings not available (e.g. AWS Lambda / Vercel Serverless)
    console.warn('⚠️ Native better-sqlite3 driver not available in this runtime.');
}
const path = require('path');
const fs = require('fs');

let pgPool = null;
let sqliteDb = null;
let activeEngine = 'sqlite';

const databaseUrl = process.env.DATABASE_URL;

function initializeDatabase() {
    if (databaseUrl && !process.env.FORCE_SQLITE) {
        try {
            // Serverless connection pool caching pattern
            if (!global.__pgPool) {
                global.__pgPool = new Pool({
                    connectionString: databaseUrl,
                    ssl: { rejectUnauthorized: false }, // Compatible with Supabase, Neon, AWS RDS in production
                    connectionTimeoutMillis: 5000,
                    max: process.env.VERCEL ? 1 : 10, // Prevent connection exhaustion in serverless lambdas
                    idleTimeoutMillis: 30000,
                });
                console.log('✅ Connected to PostgreSQL database pool.');
            }
            pgPool = global.__pgPool;
            activeEngine = 'postgres';
        } catch (err) {
            console.warn('⚠️ PostgreSQL connection failed, switching to embedded SQLite:', err.message);
            initSqlite();
        }
    } else {
        initSqlite();
    }
}

function initSqlite() {
    if (!Database) {
        console.warn('⚠️ SQLite engine unavailable. Please provide DATABASE_URL for PostgreSQL in serverless production.');
        return;
    }
    const dbPath = path.join(__dirname, '../skillbridge.db');
    sqliteDb = new Database(dbPath);
    sqliteDb.pragma('journal_mode = WAL');
    activeEngine = 'sqlite';
    console.log(`✅ Using embedded database at ${dbPath}`);
    runMigrations();
}

initializeDatabase();

// Execute a SQL query with parameter binding
async function query(text, params = []) {
    if (activeEngine === 'postgres' && pgPool) {
        try {
            const res = await pgPool.query(text, params);
            return { rows: res.rows, rowCount: res.rowCount };
        } catch (err) {
            // If postgres fails at runtime, fallback to SQLite
            console.error('Postgres query error:', err.message);
            throw err;
        }
    } else {
        // SQLite mode: Map Postgres $1, $2, ... placeholders to positional ? with ordered params
        let reorderedParams = [...params];
        let sqliteText = text;

        const matches = [...text.matchAll(/\$(\d+)/g)];
        if (matches.length > 0) {
            reorderedParams = matches.map(m => params[parseInt(m[1], 10) - 1]);
            sqliteText = text.replace(/\$(\d+)/g, '?');
        }

        // Check if query has RETURNING * clause (common in PG)
        const hasReturning = /RETURNING\s+(\*|\w+)/i.test(sqliteText);
        const returningCleaned = sqliteText.replace(/RETURNING\s+[\*\w,\s]+/i, '').trim();

        const trimmed = sqliteText.trim().toUpperCase();
        const isSelect = trimmed.startsWith('SELECT') || trimmed.startsWith('PRAGMA') || trimmed.startsWith('WITH');

        try {
            if (isSelect) {
                const stmt = sqliteDb.prepare(sqliteText);
                const rows = stmt.all(...reorderedParams);
                return { rows, rowCount: rows.length };
            } else {
                const stmt = sqliteDb.prepare(returningCleaned);
                const info = stmt.run(...reorderedParams);
                
                // If it was an insert/update with RETURNING, try to fetch inserted/updated row
                if (hasReturning && info.lastInsertRowid) {
                    return { rows: [{ id: reorderedParams[0] }], rowCount: info.changes, lastInsertRowid: info.lastInsertRowid };
                }
                return { rows: [], rowCount: info.changes, lastInsertRowid: info.lastInsertRowid };
            }
        } catch (err) {
            console.error('SQLite execution error on query:', sqliteText, 'Error:', err.message);
            throw err;
        }
    }
}

// Ensure tables exist
async function runMigrations() {
    const schemaFile = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaFile)) return;

    let ddl = fs.readFileSync(schemaFile, 'utf8');

    if (activeEngine === 'postgres') {
        try {
            await pgPool.query(ddl);
            console.log('✅ PostgreSQL migrations applied.');
        } catch (err) {
            console.error('Failed to run PostgreSQL migrations:', err.message);
        }
    } else {
        try {
            // SQLite DDL adjustments: replace TIMESTAMP DEFAULT CURRENT_TIMESTAMP with TEXT DEFAULT (datetime('now'))
            let sqliteDdl = ddl
                .replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP/gi, "DATETIME DEFAULT CURRENT_TIMESTAMP")
                .replace(/TIMESTAMP/gi, "DATETIME");
            
            sqliteDb.exec(sqliteDdl);
            const columnsToAdd = [
                "ALTER TABLE student_profiles ADD COLUMN verified_skills TEXT DEFAULT '[]'",
                "ALTER TABLE student_profiles ADD COLUMN skill_preferences TEXT DEFAULT '[]'",
                "ALTER TABLE student_profiles ADD COLUMN resume_summary TEXT",
                "ALTER TABLE student_profiles ADD COLUMN projects TEXT DEFAULT '[]'",
                "ALTER TABLE student_profiles ADD COLUMN experience TEXT DEFAULT '[]'",
                "ALTER TABLE student_profiles ADD COLUMN resume_settings TEXT DEFAULT '{}'",
                "ALTER TABLE student_profiles ADD COLUMN phone TEXT",
                "ALTER TABLE student_profiles ADD COLUMN location TEXT",
                "ALTER TABLE student_profiles ADD COLUMN leetcode_url TEXT",
                "ALTER TABLE student_profiles ADD COLUMN twitter_url TEXT"
            ];
            columnsToAdd.forEach(q => {
                try {
                    sqliteDb.exec(q);
                } catch (e) {
                    // Column may already exist
                }
            });
            console.log('✅ SQLite migrations applied.');
        } catch (err) {
            console.error('Failed to run SQLite migrations:', err.message);
        }
    }
}

module.exports = {
    query,
    runMigrations,
    getEngine: () => activeEngine,
    getPool: () => pgPool,
    getSqlite: () => sqliteDb
};
