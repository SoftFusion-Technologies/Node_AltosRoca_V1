/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 08 / 06 / 2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (MD_TB_Meals.js) contiene la definición del modelo Sequelize para la tabla meals.
 * Tema: Modelos - Comidas
 * Capa: Backend
 */

// Importa la configuración de la base de datos y los tipos de datos necesarios
import dotenv from 'dotenv';
import db from '../../DataBase/db.js';
import { DataTypes } from 'sequelize';
import DietsModel from './MD_TB_Diets.js';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Modelo para la tabla "meals"
const MealsModel = db.define(
  'meals',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    diet_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  },
  {
    timestamps: false
  }
);

// Relaciones
MealsModel.belongsTo(DietsModel, {
  foreignKey: 'diet_id',
  as: 'diet'
});

DietsModel.hasMany(MealsModel, {
  foreignKey: 'diet_id',
  as: 'meals'
});

export default MealsModel;
