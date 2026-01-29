import mysql from "mysql2/promise"

declare global {
  // eslint-disable-next-line no-var
  var __pool: mysql.Pool | undefined
}

export function getPool() {
  if (!global.__pool) {
    global.__pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 3306),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      waitForConnections: true,
      connectionLimit: 5,
      enableKeepAlive: true,
    })
  }
  return global.__pool
}
