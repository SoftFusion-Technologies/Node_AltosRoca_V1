/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 13 / 04 / 2026
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (MD_TB_AlianzasEmpresas.js) contiene la definición del modelo Sequelize
 * para la tabla alianzas_empresas.
 *
 * Tema: Modelos - Alianzas Empresas
 *
 * Capa: Backend
 */

import dotenv from 'dotenv';
import { DataTypes, Sequelize } from 'sequelize';
import db from '../../DataBase/db.js';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Benjamin Orellana - 2026/04/13 - Modelo Sequelize de la tabla alianzas_empresas.
const AlianzasEmpresasModel = db.define(
  'alianzas_empresas',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    razon_social: {
      type: DataTypes.STRING(180),
      allowNull: false
    },
    nombre_fantasia: {
      type: DataTypes.STRING(180),
      allowNull: true
    },
    cuit: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: 'uq_ae_cuit'
    },
    rubro: {
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
    sitio_web: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    instagram: {
      type: DataTypes.STRING(120),
      allowNull: true
    },
    facebook: {
      type: DataTypes.STRING(120),
      allowNull: true
    },
    logo_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    descripcion_empresa: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ciudad: {
      type: DataTypes.STRING(120),
      allowNull: true
    },
    provincia: {
      type: DataTypes.STRING(120),
      allowNull: true
    },
    estado: {
      type: DataTypes.ENUM('activo', 'inactivo'),
      allowNull: false,
      defaultValue: 'activo'
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
    tableName: 'alianzas_empresas',
    timestamps: false,
    freezeTableName: true,
    indexes: [
      {
        name: 'idx_ae_razon_social',
        fields: ['razon_social']
      },
      {
        name: 'idx_ae_nombre_fantasia',
        fields: ['nombre_fantasia']
      },
      {
        name: 'idx_ae_rubro',
        fields: ['rubro']
      },
      {
        name: 'idx_ae_estado',
        fields: ['estado']
      },
      {
        name: 'uq_ae_cuit',
        unique: true,
        fields: ['cuit']
      }
    ]
  }
);

export default AlianzasEmpresasModel;
