export const queryAll = async <T>(statement: D1PreparedStatement): Promise<T[]> => {
  const result = await statement.all<T>()
  return result.results ?? []
}

export const queryFirst = async <T>(statement: D1PreparedStatement): Promise<T | null> => {
  return (await statement.first<T>()) ?? null
}

export const execute = async (statement: D1PreparedStatement) => {
  await statement.run()
}

export const nowIso = () => new Date().toISOString()

export const plusSecondsIso = (seconds: number) => new Date(Date.now() + seconds * 1000).toISOString()

let dbInitialized = false

export const ensureDbInitialized = async (db: D1Database) => {
  if (dbInitialized) return

  await db.batch([
    db.prepare(`
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        target TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('GET', 'TCP')),
        expected_status INTEGER,
        port INTEGER,
        timeout_ms INTEGER NOT NULL,
        enabled INTEGER NOT NULL CHECK (enabled IN (0, 1)),
        monitoring_started_at TEXT NOT NULL,
        last_check_at TEXT,
        last_check_ok INTEGER CHECK (last_check_ok IN (0, 1)),
        last_check_response_time_ms INTEGER,
        last_check_failure_message TEXT,
        current_state_started_at TEXT,
        consecutive_failures INTEGER NOT NULL DEFAULT 0,
        first_failure_at TEXT,
        open_incident_id INTEGER,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        CHECK ((type = 'GET' AND expected_status IS NOT NULL AND port IS NULL) OR (type = 'TCP' AND expected_status IS NULL AND port IS NOT NULL))
      )
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS incidents (
        id INTEGER PRIMARY KEY,
        service_id INTEGER NOT NULL,
        started_at TEXT NOT NULL,
        resolved_at TEXT,
        failure_message TEXT,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
      )
    `),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_incidents_service_resolved_at ON incidents(service_id, resolved_at)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_incidents_started_at ON incidents(started_at DESC)`),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `)
  ])

  dbInitialized = true
}
