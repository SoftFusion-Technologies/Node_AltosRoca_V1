/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 08 / 06 / 2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (CTS_TB_Diets.js) contiene controladores para manejar operaciones CRUD
 * en el modelo Sequelize para la tabla diets.
 *
 * Tema: Controladores - Dietas
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
// Controladores para operaciones CRUD en la tabla diets
// ----------------------------------------------------------------

import DietsModel from '../../Models/Diets/MD_TB_Diets.js';

// Mostrar todos los registros de DietsModel
export const OBRS_Diets_CTS = async (req, res) => {
  try {
    const registros = await DietsModel.findAll();
    res.json(registros);
  } catch (error) {
    console.error('Error al obtener dietas:', error);
    res.status(500).json({ mensajeError: 'Error al obtener dietas' });
  }
};

// Mostrar un registro específico de DietsModel por su ID
export const OBR_Diets_CTS = async (req, res) => {
  try {
    const registro = await DietsModel.findByPk(req.params.id);
    if (!registro) {
      return res.status(404).json({ mensajeError: 'Dieta no encontrada' });
    }
    res.json(registro);
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Crear un nuevo registro en DietsModel
export const CR_Diets_CTS = async (req, res) => {
  try {
    const nuevaDieta = await DietsModel.create(req.body);
    res.status(201).json({
      message: 'Dieta creada correctamente',
      nuevaDieta
    });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Eliminar un registro en DietsModel por su ID
export const ER_Diets_CTS = async (req, res) => {
  try {
    const eliminado = await DietsModel.destroy({
      where: { id: req.params.id }
    });
    if (eliminado === 0) {
      return res.status(404).json({ mensajeError: 'Dieta no encontrada' });
    }
    res.json({ message: 'Dieta eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Actualizar un registro en DietsModel por su ID
export const UR_Diets_CTS = async (req, res) => {
  try {
    const { id } = req.params;
    const [numRowsUpdated] = await DietsModel.update(req.body, {
      where: { id }
    });
    if (numRowsUpdated === 1) {
      const registroActualizado = await DietsModel.findByPk(id);
      res.json({
        message: 'Dieta actualizada correctamente',
        registroActualizado
      });
    } else {
      res.status(404).json({ mensajeError: 'Dieta no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};
