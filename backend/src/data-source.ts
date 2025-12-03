import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

// Load env from backend/config.env if process.env doesn't already have the keys
function loadEnvFile(envPath: string) {
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const match = line.match(/^([^=]+)=(.*)$/);
      if (!match) continue;
      const key = match[1].trim();
      let value = match[2].trim();
      // remove surrounding quotes if present
      if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch (err) {
    // ignore if file not found; process.env may already be populated
  }
}

// Try to load backend/config.env relative to this file
const envPath = path.resolve(__dirname, '..', 'config.env');
loadEnvFile(envPath);

export const AppDataSource = new DataSource({
  type: 'mssql',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '1433', 10),
  username: process.env.DB_USERNAME ?? process.env.DB_USER ?? 'test',
  password: process.env.DB_PASSWORD ?? 'test',
  database: process.env.DB_NAME ?? 'Traceability',
  entities: [path.resolve(__dirname, '**', '*.entity.{ts,js}')],
  migrations: [path.resolve(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
});

export default AppDataSource;
