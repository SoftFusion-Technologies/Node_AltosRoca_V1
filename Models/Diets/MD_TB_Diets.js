/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 08 / 06 / 2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (MD_TB_Diets.js) contiene la definición del modelo Sequelize para la tabla diets.
 * Tema: Modelos - Dietas
 * Capa: Backend
 */

// Importa la configuración de la base de datos y los tipos de datos necesarios
import dotenv from 'dotenv';
import db from '../../DataBase/db.js';
import { DataTypes } from 'sequelize';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Modelo para la tabla "diets"
const DietsModel = db.define(
  'diets',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    calories_daily: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fat_min: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    },
    fat_max: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    },
    protein_min: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    },
    protein_max: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    },
    carbs_min: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    },
    carbs_max: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    },
    recommendations: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    allowed: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_template: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  },
  {
    timestamps: false
  }
);

export default DietsModel;
