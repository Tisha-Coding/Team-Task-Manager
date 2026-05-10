const { Pool } = require("pg");
require("dotenv").config();

const useUrl = !!process.env.DATABASE_URL;

const poolConfig = useUrl
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.PGSSL === "false" ? false : { rejectUnauthorized: false },
    }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    };

const pool = new Pool({
  ...poolConfig,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 20,
});

pool.on("error", () => {
  process.exit(-1);
});

module.exports = pool;
