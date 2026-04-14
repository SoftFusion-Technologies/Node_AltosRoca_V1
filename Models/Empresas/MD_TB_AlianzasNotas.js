/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 13 / 04 / 2026
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (MD_TB_AlianzasNotas.js) contiene la definición del modelo Sequelize
 * para la tabla alianzas_notas.
 *
 * Tema: Modelos - Alianzas Notas
 *
 * Capa: Backend
 */

import dotenv from 'dotenv';
import { DataTypes, Sequelize } from 'sequelize';
import db from '../../DataBase/db.js';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Benjamin Orellana - 2026/04/13 - Modelo Sequelize de la tabla alianzas_notas.
const AlianzasNotasModel = db.define(
  'alianzas_notas',
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
    usuario_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true
    },
    tipo: {
      type: DataTypes.ENUM(
        'nota',
        'llamada',
        'reunion',
        'seguimiento',
        'recordatorio'
      ),
      allowNull: false,
      defaultValue: 'nota'
    },
    titulo: {
      type: DataTypes.STRING(180),
      allowNull: true
    },
    nota: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    fecha_recordatorio: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
  },
  {
    tableName: 'alianzas_notas',
    timestamps: false,
    freezeTableName: true,
    indexes: [
      {
        name: 'idx_an_oportunidad',
        fields: ['oportunidad_id']
      },
      {
        name: 'idx_an_usuario',
        fields: ['usuario_id']
      },
      {
        name: 'idx_an_tipo',
        fields: ['tipo']
      },
      {
        name: 'idx_an_recordatorio',
        fields: ['fecha_recordatorio']
      }
    ]
  }
);

export default AlianzasNotasModel;
