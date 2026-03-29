/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 28 /05 / 2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (CTS_TB_Leads.js) contiene controladores para manejar operaciones CRUD
 * en el modelo Sequelize para la tabla leads.
 *
 * Tema: Controladores - Leads
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
// Controladores para operaciones CRUD en la tabla Leads
// ----------------------------------------------------------------

import LeadsModel from '../Models/MD_TB_Leads.js';

// Mostrar todos los registros de LeadsModel
export const OBRS_Leads_CTS = async (req, res) => {
  try {
    const registros = await LeadsModel.findAll();
    res.json(registros);
  } catch (error) {
    console.error('Error al obtener leads:', error);
    res.status(500).json({ mensajeError: 'Error al obtener leads' });
  }
};

// Mostrar un registro específico de LeadsModel por su ID
export const OBR_Leads_CTS = async (req, res) => {
  try {
    const registro = await LeadsModel.findByPk(req.params.id);
    if (!registro) {
      return res.status(404).json({ mensajeError: 'Lead no encontrado' });
    }
    res.json(registro);
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Crear un nuevo registro en LeadsModel
export const CR_Leads_CTS = async (req, res) => {
  try {
    const nuevoLead = await LeadsModel.create(req.body);
    res.status(201).json({
      message: 'Lead creado correctamente',
      nuevoLead
    });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Eliminar un registro en LeadsModel por su ID
export const ER_Leads_CTS = async (req, res) => {
  try {
    const eliminado = await LeadsModel.destroy({
      where: { id: req.params.id }
    });
    if (eliminado === 0) {
      return res.status(404).json({ mensajeError: 'Lead no encontrado' });
    }
    res.json({ message: 'Lead eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Actualizar un registro en LeadsModel por su ID
export const UR_Leads_CTS = async (req, res) => {
  try {
    const { id } = req.params;
    const [numRowsUpdated] = await LeadsModel.update(req.body, {
      where: { id }
    });
    if (numRowsUpdated === 1) {
      const registroActualizado = await LeadsModel.findByPk(id);
      res.json({
        message: 'Lead actualizado correctamente',
        registroActualizado
      });
    } else {
      res.status(404).json({ mensajeError: 'Lead no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};
