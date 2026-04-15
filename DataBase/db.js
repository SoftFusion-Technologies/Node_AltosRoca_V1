// Benjamin Orellana - 2026/04/14 - Se ajusta Sequelize para usar variables de entorno reales en Cloud.
import { Sequelize } from 'sequelize';
import {
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_USER,
  DB_PORT,
  NODE_ENV
} from './config.js';

const sequelizeOptions = {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  define: { freezeTableName: true },
  pool: {
    max: 15,
    min: 5,
    acquire: 30000,
    idle: 10000
  }
};

if (NODE_ENV === 'production' && process.env.DB_SSL === 'true') {
  sequelizeOptions.dialectOptions = {
    connectTimeout: 60000,
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };
}

const db = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, sequelizeOptions);

export default db;
