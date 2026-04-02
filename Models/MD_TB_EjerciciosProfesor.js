/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 07/08/2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (MD_TB_EjerciciosProfesor.js) contiene la definición del modelo Sequelize para la tabla ejercicios_profesor,
 * asociada a los ejercicios creados por cada profesor.
 * Tema: Modelos - EjerciciosProfesor
 * Capa: Backend
 */

import dotenv from 'dotenv';
import db from '../DataBase/db.js';
import { DataTypes } from 'sequelize';
import UsersModel from './Core/MD_TB_Users.js';
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const EjerciciosProfesorModel = db.define(
  'ejercicios_profesor',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    profesor_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    creado_en: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: 'ejercicios_profesor',
    timestamps: false
  }
);

EjerciciosProfesorModel.belongsTo(UsersModel, {
  foreignKey: 'profesor_id',
  as: 'profesor'
});
export default EjerciciosProfesorModel;
