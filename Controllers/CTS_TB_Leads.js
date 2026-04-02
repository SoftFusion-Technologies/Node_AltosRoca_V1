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

import { Op } from 'sequelize';
import LeadsModel from '../Models/MD_TB_Leads.js';

const sanitizarPayloadLead = (body = {}) => ({
  nombre: body.nombre?.trim?.() || body.nombre || null,
  tel: body.tel?.trim?.() || body.tel || null,
  email: body.email?.trim?.() || body.email || null,
  mensaje: body.mensaje?.trim?.() || body.mensaje || null,

  // Benjamin Orellana - 2026-04-02 - Se incorporan campos comerciales y de seguimiento del lead en forma controlada
  interes: body.interes?.trim?.() || body.interes || null,
  origen: body.origen || 'web',
  estado: body.estado || 'nuevo',
  ultimo_contacto_at: body.ultimo_contacto_at || null
});

// Mostrar todos los registros de LeadsModel
export const OBRS_Leads_CTS = async (req, res) => {
  try {
    const { estado, origen, interes, q } = req.query;

    const where = {};

    if (estado) where.estado = estado;
    if (origen) where.origen = origen;
    if (interes) where.interes = interes;

    if (q) {
      where[Op.or] = [
        { nombre: { [Op.like]: `%${q}%` } },
        { tel: { [Op.like]: `%${q}%` } },
        { email: { [Op.like]: `%${q}%` } },
        { mensaje: { [Op.like]: `%${q}%` } }
      ];
    }

    const registros = await LeadsModel.findAll({
      where,
      order: [['created_at', 'DESC']]
    });

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
    console.error('Error al obtener lead:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// Crear un nuevo registro en LeadsModel
export const CR_Leads_CTS = async (req, res) => {
  try {
    const payload = sanitizarPayloadLead(req.body);

    if (!payload.nombre || !payload.tel || !payload.mensaje) {
      return res.status(400).json({
        mensajeError: 'Los campos nombre, tel y mensaje son obligatorios'
      });
    }

    const nuevoLead = await LeadsModel.create(payload);

    res.status(201).json({
      message: 'Lead creado correctamente',
      nuevoLead
    });
  } catch (error) {
    console.error('Error al crear lead:', error);
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
    console.error('Error al eliminar lead:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// Actualizar un registro en LeadsModel por su ID
export const UR_Leads_CTS = async (req, res) => {
  try {
    const { id } = req.params;

    const registro = await LeadsModel.findByPk(id);

    if (!registro) {
      return res.status(404).json({ mensajeError: 'Lead no encontrado' });
    }

    const payload = sanitizarPayloadLead(req.body);

    await registro.update(payload);

    res.json({
      message: 'Lead actualizado correctamente',
      registroActualizado: registro
    });
  } catch (error) {
    console.error('Error al actualizar lead:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};
