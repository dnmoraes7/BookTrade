import sql from "mssql";

const requiredVariables = ["DB_SERVER", "DB_NAME", "DB_USER", "DB_PASSWORD"];

export function getDatabaseConfig() {
  const missingVariables = requiredVariables.filter((name) => !process.env[name]);

  if (missingVariables.length > 0) {
    throw new Error(`Variáveis ausentes no .env: ${missingVariables.join(", ")}`);
  }

  return {
    server: process.env.DB_SERVER,
    port: Number(process.env.DB_PORT || 1433),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
      encrypt: process.env.DB_ENCRYPT === "true",
      trustServerCertificate:
        process.env.DB_TRUST_SERVER_CERTIFICATE !== "false",
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  };
}

let connectionPool;

export async function getConnection() {
  if (!connectionPool) {
    connectionPool = new sql.ConnectionPool(getDatabaseConfig()).connect();
  }

  try {
    return await connectionPool;
  } catch (error) {
    connectionPool = undefined;
    throw error;
  }
}

export async function closeConnection() {
  if (connectionPool) {
    const pool = await connectionPool;
    await pool.close();
    connectionPool = undefined;
  }
}

export { sql };
