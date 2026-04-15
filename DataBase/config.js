// Benjamin Orellana - 2026/04/14 - Se centraliza la carga del .env productivo y de desarrollo desde Security/.env.
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, '..', 'Security', '.env')
});

export const PORT = process.env.PORT || 3000;
export const DB_HOST = process.env.DB_HOST || 'localhost';
export const DB_USER = process.env.DB_USER || 'root';
export const DB_PASSWORD = process.env.DB_PASSWORD || '';
export const DB_NAME = process.env.DB_NAME || '';
export const DB_PORT = Number(process.env.DB_PORT || 3306);
export const NODE_ENV = process.env.NODE_ENV || 'development';
