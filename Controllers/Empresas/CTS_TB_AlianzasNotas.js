/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 14 / 04 / 2026
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (CTS_TB_AlianzasNotas.js) contiene controladores para manejar
 * operaciones CRUD del módulo alianzas_notas.
 *
 * Tema: Controladores - Alianzas Notas
 * Capa: Backend
 */

import { Op } from 'sequelize';
import AlianzasNotasModel from '../../Models/Empresas/MD_TB_AlianzasNotas.js';
import AlianzasOportunidadesModel from '../../Models/Empresas/MD_TB_AlianzasOportunidades.js';
import AlianzasEmpresasModel from '../../Models/Empresas/MD_TB_AlianzasEmpresas.js';
import UsersModel from '../../Models/Core/MD_TB_Users.js';

/* ===========================
 * Helpers
 * =========================== */

// Benjamin Orellana - 2026/04/14 - Limpia strings vacíos para evitar persistir valores basura.
const cleanNullableString = (value) => {
  if (value === undefined || value === null) return null;
  const normalized = String(value).trim();
  return normalized === '' ? null : normalized;
};

// Benjamin Orellana - 2026/04/14 - Includes de detalle para visualizar la oportunidad, empresa y usuario.
const buildDetalleIncludes = () => [
  {
    model: AlianzasOportunidadesModel,
    as: 'oportunidad',
    required: false,
    include: [
      {
        model: AlianzasEmpresasModel,
        as: 'empresa',
        required: false
      }
    ]
  },
  {
    model: UsersModel,
    as: 'usuario',
    required: false,
    attributes: [
      'id',
      'name',
      'email',
      'level',
      'rol',
      'sede',
      'sede_id',
      'state',
      'created_at',
      'updated_at'
    ]
  }
];

// Benjamin Orellana - 2026/04/14 - Valida existencia y consistencia mínima del payload de notas.
const validarPayloadNota = async ({ oportunidad_id, usuario_id }) => {
  if (!oportunidad_id) {
    return 'oportunidad_id es requerido';
  }

  const oportunidad = await AlianzasOportunidadesModel.findByPk(oportunidad_id);
  if (!oportunidad) {
    return 'La oportunidad indicada no existe';
  }

  if (usuario_id) {
    const usuario = await UsersModel.findByPk(usuario_id);
    if (!usuario) {
      return 'El usuario indicado no existe';
    }
  }

  return null;
};

/* ===========================
 * CRUD
 * =========================== */

// Benjamin Orellana - 2026/04/14 - Obtiene notas con filtros por oportunidad, usuario, tipo y búsqueda general.
export const OBRS_AlianzasNotas_CTS = async (req, res) => {
  try {
    const { oportunidad_id, usuario_id, tipo, q } = req.query;

    const whereClause = {};

    if (oportunidad_id) whereClause.oportunidad_id = oportunidad_id;
    if (usuario_id) whereClause.usuario_id = usuario_id;
    if (tipo) whereClause.tipo = tipo;

    if (q && String(q).trim() !== '') {
      const qTrim = String(q).trim();

      whereClause[Op.or] = [
        { titulo: { [Op.like]: `%${qTrim}%` } },
        { nota: { [Op.like]: `%${qTrim}%` } },
        { '$oportunidad.titulo$': { [Op.like]: `%${qTrim}%` } },
        { '$oportunidad.empresa.razon_social$': { [Op.like]: `%${qTrim}%` } },
        {
          '$oportunidad.empresa.nombre_fantasia$': { [Op.like]: `%${qTrim}%` }
        },
        { '$usuario.name$': { [Op.like]: `%${qTrim}%` } },
        { '$usuario.email$': { [Op.like]: `%${qTrim}%` } }
      ];
    }

    const registros = await AlianzasNotasModel.findAll({
      where: whereClause,
      include: buildDetalleIncludes(),
      order: [
        ['fecha_recordatorio', 'ASC'],
        ['created_at', 'DESC']
      ]
    });

    res.json(registros);
  } catch (error) {
    console.error('Error al obtener notas:', error);
    res.status(500).json({ mensajeError: 'Error al obtener notas' });
  }
};

// Benjamin Orellana - 2026/04/14 - Obtiene una nota por ID.
export const OBR_AlianzasNotas_CTS = async (req, res) => {
  try {
    const registro = await AlianzasNotasModel.findByPk(req.params.id, {
      include: buildDetalleIncludes()
    });

    if (!registro) {
      return res.status(404).json({ mensajeError: 'Nota no encontrada' });
    }

    res.json(registro);
  } catch (error) {
    console.error('Error al obtener nota:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// Benjamin Orellana - 2026/04/14 - Crea una nota vinculada a una oportunidad comercial.
export const CR_AlianzasNotas_CTS = async (req, res) => {
  try {
    const datos = {
      oportunidad_id: req.body.oportunidad_id,
      usuario_id: req.body.usuario_id || null,
      tipo: req.body.tipo || 'nota',
      titulo: cleanNullableString(req.body.titulo),
      nota: cleanNullableString(req.body.nota),
      fecha_recordatorio: req.body.fecha_recordatorio || null
    };

    if (!datos.nota) {
      return res.status(400).json({ mensajeError: 'nota es requerido' });
    }

    const mensajeValidacion = await validarPayloadNota(datos);
    if (mensajeValidacion) {
      return res.status(400).json({ mensajeError: mensajeValidacion });
    }

    const registroCreado = await AlianzasNotasModel.create(datos);

    const detalleCreado = await AlianzasNotasModel.findByPk(registroCreado.id, {
      include: buildDetalleIncludes()
    });

    res.json({
      message: 'Nota creada correctamente',
      registroCreado: detalleCreado
    });
  } catch (error) {
    console.error('Error al crear nota:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// Benjamin Orellana - 2026/04/14 - Actualiza una nota por ID manteniendo validaciones de consistencia.
export const UR_AlianzasNotas_CTS = async (req, res) => {
  try {
    const { id } = req.params;

    const existente = await AlianzasNotasModel.findByPk(id);

    if (!existente) {
      return res.status(404).json({ mensajeError: 'Nota no encontrada' });
    }

    const datosActualizar = {
      oportunidad_id:
        req.body.oportunidad_id !== undefined
          ? req.body.oportunidad_id
          : existente.oportunidad_id,
      usuario_id:
        req.body.usuario_id !== undefined
          ? req.body.usuario_id || null
          : existente.usuario_id,
      tipo: req.body.tipo ?? existente.tipo,
      titulo:
        req.body.titulo !== undefined
          ? cleanNullableString(req.body.titulo)
          : existente.titulo,
      nota:
        req.body.nota !== undefined
          ? cleanNullableString(req.body.nota)
          : existente.nota,
      fecha_recordatorio:
        req.body.fecha_recordatorio !== undefined
          ? req.body.fecha_recordatorio || null
          : existente.fecha_recordatorio
    };

    if (!datosActualizar.nota) {
      return res.status(400).json({ mensajeError: 'nota es requerido' });
    }

    const mensajeValidacion = await validarPayloadNota(datosActualizar);
    if (mensajeValidacion) {
      return res.status(400).json({ mensajeError: mensajeValidacion });
    }

    const [numFilasActualizadas] = await AlianzasNotasModel.update(
      datosActualizar,
      {
        where: { id }
      }
    );

    if (numFilasActualizadas !== 1) {
      return res.status(404).json({ mensajeError: 'Nota no encontrada' });
    }

    const registroActualizado = await AlianzasNotasModel.findByPk(id, {
      include: buildDetalleIncludes()
    });

    res.json({
      message: 'Nota actualizada correctamente',
      registroActualizado
    });
  } catch (error) {
    console.error('Error al actualizar nota:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// Benjamin Orellana - 2026/04/14 - Elimina físicamente una nota por ID.
export const ER_AlianzasNotas_CTS = async (req, res) => {
  try {
    const { id } = req.params;

    const filasEliminadas = await AlianzasNotasModel.destroy({
      where: { id }
    });

    if (filasEliminadas === 0) {
      return res.status(404).json({ mensajeError: 'Nota no encontrada' });
    }

    res.json({ message: 'Nota eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar nota:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};
