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
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tel: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    // Benjamin Orellana - 2026-04-02 - Se agregan campos comerciales y de seguimiento para mejorar captación, segmentación y conversión de leads
    interes: {
      type: DataTypes.STRING,
      allowNull: true
    },
    origen: {
      type: DataTypes.ENUM(
        'web',
        'instagram',
        'facebook',
        'whatsapp',
        'referido',
        'otro'
      ),
      allowNull: false,
      defaultValue: 'web'
    },
    estado: {
      type: DataTypes.ENUM(
        'nuevo',
        'contactado',
        'interesado',
        'convertido',
        'perdido'
      ),
      allowNull: false,
      defaultValue: 'nuevo'
    },
    ultimo_contacto_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
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
