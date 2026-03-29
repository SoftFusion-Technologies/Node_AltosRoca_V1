/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 23 /05 / 2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (MD_TB_Users.js) contiene la definición del modelo Sequelize para la tabla users,
 * incluyendo la asociación con el modelo students.
 *
 * Tema: Modelos - Users
 *
 * Capa: Backend
 */

import dotenv from 'dotenv';
import db from '../DataBase/db.js';
import { DataTypes } from 'sequelize';
import StudentsModel from './MD_TB_Students.js'; // Importa el modelo de students para la asociación
import RoutinesModel from './MD_TB_Routines.js'; // Importa el modelo de students para la asociación

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const UsersModel = db.define(
  'users',
  {
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
    sede: {
      type: DataTypes.STRING,
      allowNull: true
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
    timestamps: false
  }
);

export default UsersModel;
