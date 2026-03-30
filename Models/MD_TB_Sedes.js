/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 29 / 03 / 2026
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (MD_TB_Sedes.js) contiene la definición del modelo Sequelize para la tabla Sedes.
 *
 * Tema: Modelos - Sedes
 *
 * Capa: Backend
 */

import dotenv from 'dotenv';
import db from '../DataBase/db.js';
import { DataTypes } from 'sequelize';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const SedesModel = db.define(
  'Sedes',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    codigo: {
      type: DataTypes.STRING(10),
      allowNull: true,
      unique: true
    },
    direccion: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    ciudad: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    provincia: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'Tucumán'
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    responsable_nombre: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    responsable_dni: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    horario_apertura: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: '09:00:00'
    },
    horario_cierre: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: '18:00:00'
    },
    estado: {
      type: DataTypes.ENUM('activo', 'inactivo'),
      allowNull: true,
      defaultValue: 'activo'
    },
    creado_en: {
      type: DataTypes.DATE,
      allowNull: true
    },
    actualizado_en: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: 'Sedes',
    timestamps: false
  }
);

const SedeModel = SedesModel;

export { SedesModel, SedeModel };
export default SedesModel;
