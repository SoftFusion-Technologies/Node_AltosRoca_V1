/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 13 / 04 / 2026
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (MD_TB_AlianzasEspacios.js) contiene la definición del modelo Sequelize
 * para la tabla alianzas_espacios.
 *
 * Tema: Modelos - Alianzas Espacios
 *
 * Capa: Backend
 */

import dotenv from 'dotenv';
import { DataTypes, Sequelize } from 'sequelize';
import db from '../../DataBase/db.js';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Benjamin Orellana - 2026/04/13 - Modelo Sequelize de la tabla alianzas_espacios.
const AlianzasEspaciosModel = db.define(
  'alianzas_espacios',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    codigo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: 'uq_ae_codigo'
    },
    nombre: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    categoria: {
      type: DataTypes.ENUM(
        'redes',
        'web',
        'pantallas',
        'carteleria',
        'sponsor',
        'convenio',
        'otro'
      ),
      allowNull: false,
      defaultValue: 'otro'
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    activo: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    },
    orden: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    // Benjamin Orellana - 2026/04/14 - Se corrige defaultValue de updated_at para evitar SQL inválido en INSERT.
updated_at: {
  type: DataTypes.DATE,
  allowNull: false,
  defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
}
  },
  {
    tableName: 'alianzas_espacios',
    timestamps: false,
    freezeTableName: true,
    indexes: [
      {
        name: 'uq_ae_codigo',
        unique: true,
        fields: ['codigo']
      },
      {
        name: 'idx_ae_categoria',
        fields: ['categoria']
      },
      {
        name: 'idx_ae_activo',
        fields: ['activo']
      }
    ]
  }
);

export default AlianzasEspaciosModel;
