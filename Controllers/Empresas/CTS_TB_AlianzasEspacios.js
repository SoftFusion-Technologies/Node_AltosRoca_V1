/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 14 / 04 / 2026
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (CTS_TB_AlianzasEspacios.js) contiene controladores para manejar
 * operaciones CRUD del módulo alianzas_espacios.
 *
 * Tema: Controladores - Alianzas Espacios
 * Capa: Backend
 */

import { Op } from 'sequelize';
import AlianzasEspaciosModel from '../../Models/Empresas/MD_TB_AlianzasEspacios.js';
import AlianzasOportunidadEspaciosModel from '../../Models/Empresas/MD_TB_AlianzasOportunidadEspacios.js';
import AlianzasOportunidadesModel from '../../Models/Empresas/MD_TB_AlianzasOportunidades.js';
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

// Benjamin Orellana - 2026/04/14 - Convierte valores booleanos o equivalentes a tinyint cuando corresponde.
const parseBooleanToTinyInt = (value) => {
  if (
    value === true ||
    value === 'true' ||
    value === '1' ||
    value === 1 ||
    value === 'si' ||
    value === 'sí'
  ) {
    return 1;
  }

  if (
    value === false ||
    value === 'false' ||
    value === '0' ||
    value === 0 ||
    value === 'no'
  ) {
    return 0;
  }

  return null;
};

// Benjamin Orellana - 2026/04/14 - Includes de detalle para visualizar dónde se está utilizando cada espacio.
const buildEspacioDetailIncludes = () => [
  {
    model: AlianzasOportunidadEspaciosModel,
    as: 'oportunidades_espacios',
    required: false,
    include: [
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
      }
    ]
  }
];

// Benjamin Orellana - 2026/04/14 - Valida duplicidad de código para espacios comerciales.
const validarCodigoDuplicado = async ({ codigo, excluirId = null }) => {
  const codigoLimpio = cleanNullableString(codigo);

  if (!codigoLimpio) return 'codigo es requerido';

  const whereClause = { codigo: codigoLimpio };

  if (excluirId) {
    whereClause.id = { [Op.ne]: excluirId };
  }

  const existente = await AlianzasEspaciosModel.findOne({
    where: whereClause
  });

  if (existente) {
    return 'Ya existe un espacio con el código indicado';
  }

  return null;
};

/* ===========================
 * CRUD
 * =========================== */

// Benjamin Orellana - 2026/04/14 - Obtiene espacios con filtros por categoría, activo y búsqueda general.
export const OBRS_AlianzasEspacios_CTS = async (req, res) => {
  try {
    const { categoria, activo, q } = req.query;

    const whereClause = {};

    if (categoria) whereClause.categoria = categoria;

    const activoTinyInt = parseBooleanToTinyInt(activo);
    if (activoTinyInt !== null) {
      whereClause.activo = activoTinyInt;
    }

    if (q && String(q).trim() !== '') {
      const qTrim = String(q).trim();

      whereClause[Op.or] = [
        { codigo: { [Op.like]: `%${qTrim}%` } },
        { nombre: { [Op.like]: `%${qTrim}%` } },
        { descripcion: { [Op.like]: `%${qTrim}%` } },
        { categoria: { [Op.like]: `%${qTrim}%` } }
      ];
    }

    const registros = await AlianzasEspaciosModel.findAll({
      where: whereClause,
      order: [
        ['orden', 'ASC'],
        ['nombre', 'ASC'],
        ['created_at', 'DESC']
      ]
    });

    res.json(registros);
  } catch (error) {
    console.error('Error al obtener espacios:', error);
    res.status(500).json({ mensajeError: 'Error al obtener espacios' });
  }
};

// Benjamin Orellana - 2026/04/14 - Obtiene un espacio por ID con sus vinculaciones operativas.
export const OBR_AlianzasEspacios_CTS = async (req, res) => {
  try {
    const registro = await AlianzasEspaciosModel.findByPk(req.params.id, {
      include: buildEspacioDetailIncludes(),
      order: [
        [
          {
            model: AlianzasOportunidadEspaciosModel,
            as: 'oportunidades_espacios'
          },
          'created_at',
          'DESC'
        ]
      ]
    });

    if (!registro) {
      return res.status(404).json({ mensajeError: 'Espacio no encontrado' });
    }

    res.json(registro);
  } catch (error) {
    console.error('Error al obtener espacio:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// Benjamin Orellana - 2026/04/14 - Crea un espacio comercial validando unicidad de código.
export const CR_AlianzasEspacios_CTS = async (req, res) => {
  try {
    const datos = {
      codigo: cleanNullableString(req.body.codigo),
      nombre: cleanNullableString(req.body.nombre),
      categoria: req.body.categoria || 'otro',
      descripcion: cleanNullableString(req.body.descripcion),
      activo:
        parseBooleanToTinyInt(req.body.activo) !== null
          ? parseBooleanToTinyInt(req.body.activo)
          : 1,
      orden: req.body.orden !== undefined ? Number(req.body.orden) : 0
    };

    if (!datos.nombre) {
      return res.status(400).json({ mensajeError: 'nombre es requerido' });
    }

    if (Number.isNaN(datos.orden)) {
      return res.status(400).json({ mensajeError: 'orden debe ser numérico' });
    }

    const mensajeCodigoDuplicado = await validarCodigoDuplicado({
      codigo: datos.codigo
    });

    if (mensajeCodigoDuplicado) {
      return res.status(409).json({ mensajeError: mensajeCodigoDuplicado });
    }

    const registroCreado = await AlianzasEspaciosModel.create(datos);

    res.json({
      message: 'Espacio creado correctamente',
      registroCreado
    });
  } catch (error) {
    console.error('Error al crear espacio:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// Benjamin Orellana - 2026/04/14 - Actualiza un espacio por ID validando unicidad de código.
export const UR_AlianzasEspacios_CTS = async (req, res) => {
  try {
    const { id } = req.params;

    const existente = await AlianzasEspaciosModel.findByPk(id);

    if (!existente) {
      return res.status(404).json({ mensajeError: 'Espacio no encontrado' });
    }

    const datosActualizar = {
      codigo:
        req.body.codigo !== undefined
          ? cleanNullableString(req.body.codigo)
          : existente.codigo,
      nombre:
        req.body.nombre !== undefined
          ? cleanNullableString(req.body.nombre)
          : existente.nombre,
      categoria: req.body.categoria ?? existente.categoria,
      descripcion:
        req.body.descripcion !== undefined
          ? cleanNullableString(req.body.descripcion)
          : existente.descripcion,
      activo:
        parseBooleanToTinyInt(req.body.activo) !== null
          ? parseBooleanToTinyInt(req.body.activo)
          : existente.activo,
      orden:
        req.body.orden !== undefined ? Number(req.body.orden) : existente.orden
    };

    if (!datosActualizar.nombre) {
      return res.status(400).json({ mensajeError: 'nombre es requerido' });
    }

    if (!datosActualizar.codigo) {
      return res.status(400).json({ mensajeError: 'codigo es requerido' });
    }

    if (Number.isNaN(datosActualizar.orden)) {
      return res.status(400).json({ mensajeError: 'orden debe ser numérico' });
    }

    const mensajeCodigoDuplicado = await validarCodigoDuplicado({
      codigo: datosActualizar.codigo,
      excluirId: id
    });

    if (mensajeCodigoDuplicado) {
      return res.status(409).json({ mensajeError: mensajeCodigoDuplicado });
    }

    const [numFilasActualizadas] = await AlianzasEspaciosModel.update(
      datosActualizar,
      {
        where: { id }
      }
    );

    if (numFilasActualizadas !== 1) {
      return res.status(404).json({ mensajeError: 'Espacio no encontrado' });
    }

    const registroActualizado = await AlianzasEspaciosModel.findByPk(id, {
      include: buildEspacioDetailIncludes()
    });

    res.json({
      message: 'Espacio actualizado correctamente',
      registroActualizado
    });
  } catch (error) {
    console.error('Error al actualizar espacio:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// Benjamin Orellana - 2026/04/14 - Elimina físicamente un espacio por ID.
export const ER_AlianzasEspacios_CTS = async (req, res) => {
  try {
    const { id } = req.params;

    const filasEliminadas = await AlianzasEspaciosModel.destroy({
      where: { id }
    });

    if (filasEliminadas === 0) {
      return res.status(404).json({ mensajeError: 'Espacio no encontrado' });
    }

    res.json({ message: 'Espacio eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar espacio:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};
