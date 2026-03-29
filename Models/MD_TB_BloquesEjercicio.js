/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 07 / 08 / 2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (MD_TB_BloquesEjercicio.js) contiene la definición del modelo Sequelize
 * para la tabla bloques_ejercicio, relacionada con ejercicios_profesor.
 *
 * Tema: Modelos - Bloques de Ejercicio
 *
 * Capa: Backend
 */

import { DataTypes } from 'sequelize';
import db from '../DataBase/db.js';
import EjerciciosProfesorModel from './MD_TB_EjerciciosProfesor.js';

const BloquesEjercicioModel = db.define(
  'bloques_ejercicio',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    ejercicio_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    contenido: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    creado_en: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  },
  {
    timestamps: false,
    tableName: 'bloques_ejercicio'
  }
);

// Asociación con EjerciciosProfesor
BloquesEjercicioModel.belongsTo(EjerciciosProfesorModel, {
  foreignKey: 'ejercicio_id',
  as: 'ejercicio'
});

EjerciciosProfesorModel.hasMany(BloquesEjercicioModel, {
  foreignKey: 'ejercicio_id',
  as: 'bloques'
});

export default BloquesEjercicioModel;
