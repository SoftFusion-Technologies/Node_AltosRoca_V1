/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 06/08/2025
 * Versión: 1.2
 *
 * Descripción:
 * Modelo Sequelize para la tabla `rutinas`.
 * Agrega `instructor_id` para filtrar solicitudes por profesor.
 * Tema: Modelos - Rutinas
 * Capa: Backend
 */

import dotenv from 'dotenv';
import db from '../../DataBase/db.js';
import { DataTypes } from 'sequelize';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const RutinasModel = db.define(
  'rutinas',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    /* Benjamin Orellana - 06/04/2026 - Se habilita student_id nullable para soportar rutinas base sin alumno asignado */
    student_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: { model: 'students', key: 'id' },
      onDelete: 'CASCADE'
    },
    // 🔹 NUEVO: instructor_id
    instructor_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true // ponelo en false cuando completes el backfill
      // references: { model: 'instructors', key: 'id' },
      // onDelete: 'SET NULL'
    },

    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: db.literal('CURRENT_TIMESTAMP')
    },
    desde: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: db.literal('CURRENT_TIMESTAMP')
    },
    hasta: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    created_at: { type: DataTypes.DATE, allowNull: true },
    updated_at: { type: DataTypes.DATE, allowNull: true }
  },
  {
    tableName: 'rutinas',
    timestamps: false,
    indexes: [
      { fields: ['student_id'] },
      { fields: ['instructor_id'] } // ✅ acelera el filtro por instructor
    ]
  }
);

export default RutinasModel;
