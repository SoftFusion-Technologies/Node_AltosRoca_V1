/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 08 / 06 / 2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (CTS_TB_MealItems.js) contiene controladores para manejar operaciones CRUD
 * en el modelo Sequelize para la tabla meal_items.
 *
 * Tema: Controladores - Meal Items
 *
 * Capa: Backend
 *
 * Nomenclatura: OBR_ obtenerRegistro
 *               OBRS_obtenerRegistros(plural)
 *               CR_ crearRegistro
 *               ER_ eliminarRegistro
 *               UR_ actualizarRegistro
 */

// ----------------------------------------------------------------
// Controladores para operaciones CRUD en la tabla meal_items
// ----------------------------------------------------------------

import MealItemsModel from '../../Models/Diets/MD_TB_MealItems.js';

// Mostrar todos los registros de MealItemsModel
export const OBRS_MealItems_CTS = async (req, res) => {
  try {
    const registros = await MealItemsModel.findAll();
    res.json(registros);
  } catch (error) {
    console.error('Error al obtener meal items:', error);
    res.status(500).json({ mensajeError: 'Error al obtener meal items' });
  }
};

// Mostrar un registro específico de MealItemsModel por su ID
export const OBR_MealItems_CTS = async (req, res) => {
  try {
    const registro = await MealItemsModel.findByPk(req.params.id);
    if (!registro) {
      return res.status(404).json({ mensajeError: 'Meal item no encontrado' });
    }
    res.json(registro);
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Crear un nuevo registro en MealItemsModel
export const CR_MealItems_CTS = async (req, res) => {
  try {
    const nuevoItem = await MealItemsModel.create(req.body);
    res.status(201).json({
      message: 'Meal item creado correctamente',
      nuevoItem
    });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Eliminar un registro en MealItemsModel por su ID
export const ER_MealItems_CTS = async (req, res) => {
  try {
    const eliminado = await MealItemsModel.destroy({
      where: { id: req.params.id }
    });
    if (eliminado === 0) {
      return res.status(404).json({ mensajeError: 'Meal item no encontrado' });
    }
    res.json({ message: 'Meal item eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Actualizar un registro en MealItemsModel por su ID
export const UR_MealItems_CTS = async (req, res) => {
  try {
    const { id } = req.params;
    const [numRowsUpdated] = await MealItemsModel.update(req.body, {
      where: { id }
    });
    if (numRowsUpdated === 1) {
      const registroActualizado = await MealItemsModel.findByPk(id);
      res.json({
        message: 'Meal item actualizado correctamente',
        registroActualizado
      });
    } else {
      res.status(404).json({ mensajeError: 'Meal item no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};
