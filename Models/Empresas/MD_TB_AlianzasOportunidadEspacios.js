/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 13 / 04 / 2026
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (MD_TB_AlianzasOportunidadEspacios.js) contiene la definición del modelo Sequelize
 * para la tabla alianzas_oportunidad_espacios.
 *
 * Tema: Modelos - Alianzas Oportunidad Espacios
 *
 * Capa: Backend
 */

import dotenv from 'dotenv';
import { DataTypes, Sequelize } from 'sequelize';
import db from '../../DataBase/db.js';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Benjamin Orellana - 2026/04/13 - Modelo Sequelize de la tabla alianzas_oportunidad_espacios.
const AlianzasOportunidadEspaciosModel = db.define(
  'alianzas_oportunidad_espacios',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    oportunidad_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'alianzas_oportunidades',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    espacio_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'alianzas_espacios',
        key: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    },
    modalidad: {
      type: DataTypes.ENUM('fijo', 'rotativo', 'eventual'),
      allowNull: false,
      defaultValue: 'fijo'
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    frecuencia: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    precio_unitario: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true
    },
    descuento_pct: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      defaultValue: 0.0
    },
    precio_final: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true
    },
    fecha_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    fecha_fin: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    beneficios_texto: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    estado: {
      type: DataTypes.ENUM(
        'propuesto',
        'activo',
        'pausado',
        'finalizado',
        'cancelado'
      ),
      allowNull: false,
      defaultValue: 'propuesto'
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
    tableName: 'alianzas_oportunidad_espacios',
    timestamps: false,
    freezeTableName: true,
    indexes: [
      {
        name: 'idx_aoe_oportunidad',
        fields: ['oportunidad_id']
      },
      {
        name: 'idx_aoe_espacio',
        fields: ['espacio_id']
      },
      {
        name: 'idx_aoe_estado',
        fields: ['estado']
      }
    ]
  }
);

export default AlianzasOportunidadEspaciosModel;
