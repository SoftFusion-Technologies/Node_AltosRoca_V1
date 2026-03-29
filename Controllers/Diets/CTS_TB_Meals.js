/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 08 / 06 / 2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (CTS_TB_Meals.js) contiene controladores para manejar operaciones CRUD
 * en el modelo Sequelize para la tabla meals.
 *
 * Tema: Controladores - Meals
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
// Controladores para operaciones CRUD en la tabla meals
// ----------------------------------------------------------------

import MealsModel from '../../Models/Diets/MD_TB_Meals.js';

// Mostrar todos los registros de MealsModel
export const OBRS_Meals_CTS = async (req, res) => {
  try {
    const registros = await MealsModel.findAll();
    res.json(registros);
  } catch (error) {
    console.error('Error al obtener comidas:', error);
    res.status(500).json({ mensajeError: 'Error al obtener comidas' });
  }
};

// Mostrar un registro específico de MealsModel por su ID
export const OBR_Meals_CTS = async (req, res) => {
  try {
    const registro = await MealsModel.findByPk(req.params.id);
    if (!registro) {
      return res.status(404).json({ mensajeError: 'Comida no encontrada' });
    }
    res.json(registro);
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Crear un nuevo registro en MealsModel
export const CR_Meals_CTS = async (req, res) => {
  try {
    const nuevaComida = await MealsModel.create(req.body);
    res.status(201).json({
      message: 'Comida creada correctamente',
      nuevaComida
    });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Eliminar un registro en MealsModel por su ID
export const ER_Meals_CTS = async (req, res) => {
  try {
    const eliminado = await MealsModel.destroy({
      where: { id: req.params.id }
    });
    if (eliminado === 0) {
      return res.status(404).json({ mensajeError: 'Comida no encontrada' });
    }
    res.json({ message: 'Comida eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Actualizar un registro en MealsModel por su ID
export const UR_Meals_CTS = async (req, res) => {
  try {
    const { id } = req.params;
    const [numRowsUpdated] = await MealsModel.update(req.body, {
      where: { id }
    });
    if (numRowsUpdated === 1) {
      const registroActualizado = await MealsModel.findByPk(id);
      res.json({
        message: 'Comida actualizada correctamente',
        registroActualizado
      });
    } else {
      res.status(404).json({ mensajeError: 'Comida no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};
