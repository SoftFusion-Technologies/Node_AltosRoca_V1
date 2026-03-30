/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 23 /05 / 2025
 * Versión: 1.1
 *
 * Descripción:
 * Este archivo (MD_TB_Users.js) contiene la definición del modelo Sequelize para la tabla users,
 * incluyendo la nueva asociación con la tabla Sedes.
 *
 * Tema: Modelos - Users
 *
 * Capa: Backend
 */

import dotenv from 'dotenv';
import db from '../DataBase/db.js';
import { DataTypes } from 'sequelize';
import SedesModel from './MD_TB_Sedes.js';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const UsersModel = db.define(
  'users',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email_verified_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    level: {
      type: DataTypes.STRING,
      allowNull: false
    },

    // Benjamin Orellana - 29 / 03 / 2026 - Se agrega el rol formal del usuario para normalizar permisos
    rol: {
      type: DataTypes.ENUM('admin', 'socio', 'vendedor', 'instructor'),
      allowNull: false
    },

    sede: {
      type: DataTypes.STRING,
      allowNull: true
    },

    // Benjamin Orellana - 29 / 03 / 2026 - Se agrega la relación física del usuario con la tabla Sedes
    sede_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Sedes',
        key: 'id'
      }
    },

    state: {
      type: DataTypes.STRING,
      allowNull: false
    },
    remember_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: 'users',
    timestamps: false
  }
);

// Benjamin Orellana - 29 / 03 / 2026 - Asociación entre users y Sedes usando sede_id
UsersModel.belongsTo(SedesModel, {
  foreignKey: 'sede_id',
  as: 'sedeRelacion'
});

SedesModel.hasMany(UsersModel, {
  foreignKey: 'sede_id',
  as: 'usuarios'
});

const UserModel = UsersModel;

export { UsersModel, UserModel };
export default UsersModel;
