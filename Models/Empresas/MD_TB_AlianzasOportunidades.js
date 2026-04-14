/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 13 / 04 / 2026
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (MD_TB_AlianzasOportunidades.js) contiene la definición del modelo Sequelize
 * para la tabla alianzas_oportunidades.
 *
 * Tema: Modelos - Alianzas Oportunidades
 *
 * Capa: Backend
 */

import dotenv from 'dotenv';
import { DataTypes, Sequelize } from 'sequelize';
import db from '../../DataBase/db.js';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Benjamin Orellana - 2026/04/13 - Modelo Sequelize de la tabla alianzas_oportunidades.
const AlianzasOportunidadesModel = db.define(
  'alianzas_oportunidades',
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
    contacto_principal_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'alianzas_contactos',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    staff_responsable_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true
    },
    tipo_relacion: {
      type: DataTypes.ENUM('publicidad', 'convenio', 'ambos'),
      allowNull: false,
      defaultValue: 'publicidad'
    },
    origen: {
      type: DataTypes.ENUM(
        'web',
        'instagram',
        'whatsapp',
        'referido',
        'staff',
        'otro'
      ),
      allowNull: false,
      defaultValue: 'web'
    },
    estado: {
      type: DataTypes.ENUM(
        'nuevo',
        'contactado',
        'reunion_pendiente',
        'propuesta_enviada',
        'negociacion',
        'activo',
        'pausado',
        'cerrado',
        'rechazado'
      ),
      allowNull: false,
      defaultValue: 'nuevo'
    },
    titulo: {
      type: DataTypes.STRING(180),
      allowNull: false
    },
    mensaje_inicial: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    beneficios_ofrecidos: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    observaciones_internas: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fecha_primer_contacto: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fecha_proxima_accion: {
      type: DataTypes.DATE,
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
    monto_estimado: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true
    },
    moneda: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'ARS'
    },
    logo_aprobado: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    contrato_firmado: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    creado_desde_publico: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    },
    created_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true
    },
    updated_by: {
      type: DataTypes.BIGINT.UNSIGNED,
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
    tableName: 'alianzas_oportunidades',
    timestamps: false,
    freezeTableName: true,
    indexes: [
      {
        name: 'idx_ao_empresa',
        fields: ['empresa_id']
      },
      {
        name: 'idx_ao_contacto',
        fields: ['contacto_principal_id']
      },
      {
        name: 'idx_ao_staff',
        fields: ['staff_responsable_id']
      },
      {
        name: 'idx_ao_estado',
        fields: ['estado']
      },
      {
        name: 'idx_ao_tipo_relacion',
        fields: ['tipo_relacion']
      },
      {
        name: 'idx_ao_origen',
        fields: ['origen']
      },
      {
        name: 'idx_ao_fecha_proxima_accion',
        fields: ['fecha_proxima_accion']
      }
    ]
  }
);

export default AlianzasOportunidadesModel;
