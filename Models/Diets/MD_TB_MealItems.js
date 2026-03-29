/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 08 / 06 / 2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (MD_TB_MealItems.js) contiene la definición del modelo Sequelize para la tabla meal_items.
 * Tema: Modelos - Elementos de comidas
 * Capa: Backend
 */

// Importa la configuración de la base de datos y los tipos de datos necesarios
import dotenv from 'dotenv';
import db from '../../DataBase/db.js';
import { DataTypes } from 'sequelize';
import MealsModel from './MD_TB_Meals.js';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Modelo para la tabla "meal_items"
const MealItemsModel = db.define(
  'meal_items',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    meal_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  },
  {
    timestamps: false
  }
);

// Relaciones
MealItemsModel.belongsTo(MealsModel, {
  foreignKey: 'meal_id',
  as: 'meal'
});

MealsModel.hasMany(MealItemsModel, {
  foreignKey: 'meal_id',
  as: 'items'
});

export default MealItemsModel;
