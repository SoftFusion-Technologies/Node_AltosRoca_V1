/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 14 / 04 / 2026
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (CTS_TB_AlianzasOportunidadEspacios.js) contiene controladores para manejar
 * operaciones CRUD del módulo alianzas_oportunidad_espacios.
 *
 * Tema: Controladores - Alianzas Oportunidad Espacios
 * Capa: Backend
 */

import { Op } from 'sequelize';
import AlianzasOportunidadEspaciosModel from '../../Models/Empresas/MD_TB_AlianzasOportunidadEspacios.js';
import AlianzasOportunidadesModel from '../../Models/Empresas/MD_TB_AlianzasOportunidades.js';
import AlianzasEspaciosModel from '../../Models/Empresas/MD_TB_AlianzasEspacios.js';
import AlianzasEmpresasModel from '../../Models/Empresas/MD_TB_AlianzasEmpresas.js';

/* ===========================
 * Helpers
 * =========================== */

// Benjamin Orellana - 2026/04/14 - Limpia strings vacíos para evitar persistir valores basura.
const cleanNullableString = (value) => {
  if (value === undefined || value === null) return null;
  const normalized = String(value).trim();
  return normalized === '' ? null : normalized;
};

// Benjamin Orellana - 2026/04/14 - Includes de detalle para ver la oportunidad y el espacio relacionados.
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
    model: AlianzasEspaciosModel,
    as: 'espacio',
    required: false
  }
];

// Benjamin Orellana - 2026/04/14 - Valida existencia y consistencia de claves foráneas y fechas.
const validarPayloadOportunidadEspacios = async ({
  oportunidad_id,
  espacio_id,
  fecha_inicio,
  fecha_fin
}) => {
  if (!oportunidad_id) {
    return 'oportunidad_id es requerido';
  }

  if (!espacio_id) {
    return 'espacio_id es requerido';
  }

  const oportunidad = await AlianzasOportunidadesModel.findByPk(oportunidad_id);
  if (!oportunidad) {
    return 'La oportunidad indicada no existe';
  }

  const espacio = await AlianzasEspaciosModel.findByPk(espacio_id);
  if (!espacio) {
    return 'El espacio indicado no existe';
  }

  if (
    fecha_inicio &&
    fecha_fin &&
    new Date(fecha_inicio) > new Date(fecha_fin)
  ) {
    return 'fecha_fin no puede ser anterior a fecha_inicio';
  }

  return null;
};

/* ===========================
 * CRUD
 * =========================== */

// Benjamin Orellana - 2026/04/14 - Obtiene relaciones oportunidad-espacio con filtros operativos.
export const OBRS_AlianzasOportunidadEspacios_CTS = async (req, res) => {
  try {
    const { oportunidad_id, espacio_id, estado, q } = req.query;

    const whereClause = {};

    if (oportunidad_id) whereClause.oportunidad_id = oportunidad_id;
    if (espacio_id) whereClause.espacio_id = espacio_id;
    if (estado) whereClause.estado = estado;

    if (q && String(q).trim() !== '') {
      const qTrim = String(q).trim();

      whereClause[Op.or] = [
        { modalidad: { [Op.like]: `%${qTrim}%` } },
        { frecuencia: { [Op.like]: `%${qTrim}%` } },
        { beneficios_texto: { [Op.like]: `%${qTrim}%` } },
        { observaciones: { [Op.like]: `%${qTrim}%` } },
        { '$espacio.nombre$': { [Op.like]: `%${qTrim}%` } },
        { '$espacio.codigo$': { [Op.like]: `%${qTrim}%` } },
        { '$oportunidad.titulo$': { [Op.like]: `%${qTrim}%` } },
        { '$oportunidad.empresa.razon_social$': { [Op.like]: `%${qTrim}%` } },
        { '$oportunidad.empresa.nombre_fantasia$': { [Op.like]: `%${qTrim}%` } }
      ];
    }

    const registros = await AlianzasOportunidadEspaciosModel.findAll({
      where: whereClause,
      include: buildDetalleIncludes(),
      order: [
        ['fecha_inicio', 'DESC'],
        ['created_at', 'DESC']
      ]
    });

    res.json(registros);
  } catch (error) {
    console.error('Error al obtener relaciones oportunidad-espacio:', error);
    res.status(500).json({
      mensajeError: 'Error al obtener relaciones oportunidad-espacio'
    });
  }
};

// Benjamin Orellana - 2026/04/14 - Obtiene una relación oportunidad-espacio por ID.
export const OBR_AlianzasOportunidadEspacios_CTS = async (req, res) => {
  try {
    const registro = await AlianzasOportunidadEspaciosModel.findByPk(
      req.params.id,
      {
        include: buildDetalleIncludes()
      }
    );

    if (!registro) {
      return res.status(404).json({
        mensajeError: 'Registro de oportunidad-espacio no encontrado'
      });
    }

    res.json(registro);
  } catch (error) {
    console.error('Error al obtener registro oportunidad-espacio:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// Benjamin Orellana - 2026/04/14 - Crea una relación entre oportunidad y espacio con validaciones de consistencia.
export const CR_AlianzasOportunidadEspacios_CTS = async (req, res) => {
  try {
    const datos = {
      oportunidad_id: req.body.oportunidad_id,
      espacio_id: req.body.espacio_id,
      modalidad: req.body.modalidad || 'fijo',
      cantidad:
        req.body.cantidad !== undefined && req.body.cantidad !== null
          ? Number(req.body.cantidad)
          : 1,
      frecuencia: cleanNullableString(req.body.frecuencia),
      precio_unitario: req.body.precio_unitario ?? null,
      descuento_pct:
        req.body.descuento_pct !== undefined && req.body.descuento_pct !== null
          ? req.body.descuento_pct
          : 0,
      precio_final: req.body.precio_final ?? null,
      fecha_inicio: req.body.fecha_inicio || null,
      fecha_fin: req.body.fecha_fin || null,
      beneficios_texto: cleanNullableString(req.body.beneficios_texto),
      observaciones: cleanNullableString(req.body.observaciones),
      estado: req.body.estado || 'propuesto'
    };

    if (Number.isNaN(datos.cantidad) || datos.cantidad <= 0) {
      return res.status(400).json({
        mensajeError: 'cantidad debe ser un número mayor a 0'
      });
    }

    const mensajeValidacion = await validarPayloadOportunidadEspacios(datos);
    if (mensajeValidacion) {
      return res.status(400).json({ mensajeError: mensajeValidacion });
    }

    const registroCreado = await AlianzasOportunidadEspaciosModel.create(datos);

    const detalleCreado = await AlianzasOportunidadEspaciosModel.findByPk(
      registroCreado.id,
      {
        include: buildDetalleIncludes()
      }
    );

    res.json({
      message: 'Registro de oportunidad-espacio creado correctamente',
      registroCreado: detalleCreado
    });
  } catch (error) {
    console.error('Error al crear registro oportunidad-espacio:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// Benjamin Orellana - 2026/04/14 - Actualiza una relación oportunidad-espacio por ID manteniendo consistencia de negocio.
export const UR_AlianzasOportunidadEspacios_CTS = async (req, res) => {
  try {
    const { id } = req.params;

    const existente = await AlianzasOportunidadEspaciosModel.findByPk(id);

    if (!existente) {
      return res.status(404).json({
        mensajeError: 'Registro de oportunidad-espacio no encontrado'
      });
    }

    const datosActualizar = {
      oportunidad_id:
        req.body.oportunidad_id !== undefined
          ? req.body.oportunidad_id
          : existente.oportunidad_id,
      espacio_id:
        req.body.espacio_id !== undefined
          ? req.body.espacio_id
          : existente.espacio_id,
      modalidad: req.body.modalidad ?? existente.modalidad,
      cantidad:
        req.body.cantidad !== undefined && req.body.cantidad !== null
          ? Number(req.body.cantidad)
          : existente.cantidad,
      frecuencia:
        req.body.frecuencia !== undefined
          ? cleanNullableString(req.body.frecuencia)
          : existente.frecuencia,
      precio_unitario:
        req.body.precio_unitario !== undefined
          ? req.body.precio_unitario
          : existente.precio_unitario,
      descuento_pct:
        req.body.descuento_pct !== undefined
          ? req.body.descuento_pct
          : existente.descuento_pct,
      precio_final:
        req.body.precio_final !== undefined
          ? req.body.precio_final
          : existente.precio_final,
      fecha_inicio:
        req.body.fecha_inicio !== undefined
          ? req.body.fecha_inicio || null
          : existente.fecha_inicio,
      fecha_fin:
        req.body.fecha_fin !== undefined
          ? req.body.fecha_fin || null
          : existente.fecha_fin,
      beneficios_texto:
        req.body.beneficios_texto !== undefined
          ? cleanNullableString(req.body.beneficios_texto)
          : existente.beneficios_texto,
      observaciones:
        req.body.observaciones !== undefined
          ? cleanNullableString(req.body.observaciones)
          : existente.observaciones,
      estado: req.body.estado ?? existente.estado
    };

    if (
      Number.isNaN(datosActualizar.cantidad) ||
      datosActualizar.cantidad <= 0
    ) {
      return res.status(400).json({
        mensajeError: 'cantidad debe ser un número mayor a 0'
      });
    }

    const mensajeValidacion =
      await validarPayloadOportunidadEspacios(datosActualizar);
    if (mensajeValidacion) {
      return res.status(400).json({ mensajeError: mensajeValidacion });
    }

    const [numFilasActualizadas] =
      await AlianzasOportunidadEspaciosModel.update(datosActualizar, {
        where: { id }
      });

    if (numFilasActualizadas !== 1) {
      return res.status(404).json({
        mensajeError: 'Registro de oportunidad-espacio no encontrado'
      });
    }

    const registroActualizado = await AlianzasOportunidadEspaciosModel.findByPk(
      id,
      {
        include: buildDetalleIncludes()
      }
    );

    res.json({
      message: 'Registro de oportunidad-espacio actualizado correctamente',
      registroActualizado
    });
  } catch (error) {
    console.error('Error al actualizar registro oportunidad-espacio:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// Benjamin Orellana - 2026/04/14 - Elimina físicamente una relación oportunidad-espacio por ID.
export const ER_AlianzasOportunidadEspacios_CTS = async (req, res) => {
  try {
    const { id } = req.params;

    const filasEliminadas = await AlianzasOportunidadEspaciosModel.destroy({
      where: { id }
    });

    if (filasEliminadas === 0) {
      return res.status(404).json({
        mensajeError: 'Registro de oportunidad-espacio no encontrado'
      });
    }

    res.json({
      message: 'Registro de oportunidad-espacio eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar registro oportunidad-espacio:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};
