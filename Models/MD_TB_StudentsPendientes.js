/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 05 / 08 / 2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (MD_TB_StudentsPendientes.js) contiene la definición del modelo Sequelize para la tabla students_pendientes.
 *
 * Tema: Modelos - Students Pendientes
 *
 * Capa: Backend
 */

import dotenv from 'dotenv';
import db from '../DataBase/db.js';
import { DataTypes } from 'sequelize';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const StudentsPendientesModel = db.define(
  'students_pendientes',
  {
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    nomyape: {
      type: DataTypes.STRING,
      allowNull: false
    },
    telefono: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    dni: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    objetivo: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'en revision', 'autorizado'),
      allowNull: false,
      defaultValue: 'pendiente'
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

export default StudentsPendientesModel;
