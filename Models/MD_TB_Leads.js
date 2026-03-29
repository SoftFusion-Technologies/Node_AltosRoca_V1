/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 28 /05 / 2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (MD_TB_Leads.js) contiene la definición del modelo Sequelize para la tabla leads.
 *
 * Tema: Modelos - Leads
 *
 * Capa: Backend
 */

import dotenv from 'dotenv';
import db from '../DataBase/db.js';
import { DataTypes } from 'sequelize';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const LeadsModel = db.define(
  'leads',
  {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tel: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  },
  {
    timestamps: false,
    tableName: 'leads'
  }
);

export default LeadsModel;
