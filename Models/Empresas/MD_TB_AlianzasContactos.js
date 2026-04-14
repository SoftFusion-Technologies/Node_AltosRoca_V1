/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 13 / 04 / 2026
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (MD_TB_AlianzasContactos.js) contiene la definición del modelo Sequelize
 * para la tabla alianzas_contactos.
 *
 * Tema: Modelos - Alianzas Contactos
 *
 * Capa: Backend
 */

import dotenv from 'dotenv';
import { DataTypes, Sequelize } from 'sequelize';
import db from '../../DataBase/db.js';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Benjamin Orellana - 2026/04/13 - Modelo Sequelize de la tabla alianzas_contactos.
const AlianzasContactosModel = db.define(
  'alianzas_contactos',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    empresa_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'alianzas_empresas',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    apellido: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    cargo: {
      type: DataTypes.STRING(120),
      allowNull: true
    },
    telefono: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    es_principal: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    observaciones: {
      type: DataTypes.STRING(255),
      allowNull: true
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
    tableName: 'alianzas_contactos',
    timestamps: false,
    freezeTableName: true,
    indexes: [
      {
        name: 'idx_ac_empresa',
        fields: ['empresa_id']
      },
      {
        name: 'idx_ac_principal',
        fields: ['empresa_id', 'es_principal']
      }
    ]
  }
);

export default AlianzasContactosModel;
