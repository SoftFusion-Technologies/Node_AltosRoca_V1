/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 13 / 04 / 2026
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (CTS_TB_AlianzasEmpresas.js) contiene controladores para manejar
 * operaciones CRUD del módulo alianzas_empresas.
 *
 * Tema: Controladores - Alianzas Empresas
 * Capa: Backend
 */

import { Op } from 'sequelize';
import AlianzasEmpresasModel from '../../Models/Empresas/MD_TB_AlianzasEmpresas.js';
import AlianzasContactosModel from '../../Models/Empresas/MD_TB_AlianzasContactos.js';
import AlianzasOportunidadesModel from '../../Models/Empresas/MD_TB_AlianzasOportunidades.js';
import UsersModel from '../../Models/Core/MD_TB_Users.js';

/* ===========================
 * Helpers
 * =========================== */

// Benjamin Orellana - 2026/04/13 - Limpia strings vacíos para evitar persistir valores basura.
const cleanNullableString = (value) => {
  if (value === undefined || value === null) return null;
  const normalized = String(value).trim();
  return normalized === '' ? null : normalized;
};

// Benjamin Orellana - 2026/04/13 - Define includes de detalle para empresa con contactos y oportunidades.
const buildEmpresaDetailIncludes = () => [
  {
    model: AlianzasContactosModel,
    as: 'contactos',
    required: false
  },
  {
    model: AlianzasOportunidadesModel,
    as: 'oportunidades',
    required: false,
    include: [
      {
        model: UsersModel,
        as: 'staff_responsable',
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
    ]
  }
];

// Benjamin Orellana - 2026/04/13 - Valida CUIT duplicado cuando el campo viene informado.
const validarCuitDuplicado = async ({ cuit, excluirId = null }) => {
  const cuitLimpio = cleanNullableString(cuit);

  if (!cuitLimpio) return null;

  const whereClause = { cuit: cuitLimpio };

  if (excluirId) {
    whereClause.id = { [Op.ne]: excluirId };
  }

  const existente = await AlianzasEmpresasModel.findOne({
    where: whereClause
  });

  if (existente) {
    return 'Ya existe una empresa con el CUIT indicado';
  }

  return null;
};

/* ===========================
 * CRUD
 * =========================== */

// Benjamin Orellana - 2026/04/13 - Obtiene empresas con filtros por búsqueda, rubro, ciudad y estado.
export const OBRS_AlianzasEmpresas_CTS = async (req, res) => {
  try {
    const { q, rubro, ciudad, estado } = req.query;

    const whereClause = {};

    if (rubro) whereClause.rubro = rubro;
    if (ciudad) whereClause.ciudad = ciudad;
    if (estado) whereClause.estado = estado;

    if (q && String(q).trim() !== '') {
      const qTrim = String(q).trim();

      whereClause[Op.or] = [
        { razon_social: { [Op.like]: `%${qTrim}%` } },
        { nombre_fantasia: { [Op.like]: `%${qTrim}%` } },
        { cuit: { [Op.like]: `%${qTrim}%` } },
        { rubro: { [Op.like]: `%${qTrim}%` } },
        { telefono: { [Op.like]: `%${qTrim}%` } },
        { email: { [Op.like]: `%${qTrim}%` } },
        { ciudad: { [Op.like]: `%${qTrim}%` } },
        { provincia: { [Op.like]: `%${qTrim}%` } }
      ];
    }

    const registros = await AlianzasEmpresasModel.findAll({
      where: whereClause,
      order: [
        ['razon_social', 'ASC'],
        ['created_at', 'DESC']
      ]
    });

    res.json(registros);
  } catch (error) {
    console.error('Error al obtener empresas:', error);
    res.status(500).json({ mensajeError: 'Error al obtener empresas' });
  }
};

// Benjamin Orellana - 2026/04/13 - Obtiene una empresa por ID con sus contactos y oportunidades.
export const OBR_AlianzasEmpresas_CTS = async (req, res) => {
  try {
    const registro = await AlianzasEmpresasModel.findByPk(req.params.id, {
      include: buildEmpresaDetailIncludes(),
      order: [
        [
          { model: AlianzasContactosModel, as: 'contactos' },
          'es_principal',
          'DESC'
        ],
        [
          { model: AlianzasContactosModel, as: 'contactos' },
          'created_at',
          'ASC'
        ],
        [
          { model: AlianzasOportunidadesModel, as: 'oportunidades' },
          'created_at',
          'DESC'
        ]
      ]
    });

    if (!registro) {
      return res.status(404).json({ mensajeError: 'Empresa no encontrada' });
    }

    res.json(registro);
  } catch (error) {
    console.error('Error al obtener empresa:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// Benjamin Orellana - 2026/04/13 - Crea una empresa validando duplicidad de CUIT cuando corresponde.
export const CR_AlianzasEmpresas_CTS = async (req, res) => {
  try {
    const datos = {
      razon_social: cleanNullableString(req.body.razon_social),
      nombre_fantasia: cleanNullableString(req.body.nombre_fantasia),
      cuit: cleanNullableString(req.body.cuit),
      rubro: cleanNullableString(req.body.rubro),
      telefono: cleanNullableString(req.body.telefono),
      email: cleanNullableString(req.body.email),
      sitio_web: cleanNullableString(req.body.sitio_web),
      instagram: cleanNullableString(req.body.instagram),
      facebook: cleanNullableString(req.body.facebook),
      logo_url: cleanNullableString(req.body.logo_url),
      descripcion_empresa: cleanNullableString(req.body.descripcion_empresa),
      ciudad: cleanNullableString(req.body.ciudad),
      provincia: cleanNullableString(req.body.provincia),
      estado: req.body.estado || 'activo'
    };

    if (!datos.razon_social) {
      return res
        .status(400)
        .json({ mensajeError: 'razon_social es requerido' });
    }

    const mensajeCuitDuplicado = await validarCuitDuplicado({
      cuit: datos.cuit
    });

    if (mensajeCuitDuplicado) {
      return res.status(409).json({ mensajeError: mensajeCuitDuplicado });
    }

    const registroCreado = await AlianzasEmpresasModel.create(datos);

    res.json({
      message: 'Empresa creada correctamente',
      registroCreado
    });
  } catch (error) {
    console.error('Error al crear empresa:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// Benjamin Orellana - 2026/04/13 - Actualiza una empresa por ID validando CUIT duplicado si cambia.
export const UR_AlianzasEmpresas_CTS = async (req, res) => {
  try {
    const { id } = req.params;

    const existente = await AlianzasEmpresasModel.findByPk(id);

    if (!existente) {
      return res.status(404).json({ mensajeError: 'Empresa no encontrada' });
    }

    const datosActualizar = {
      razon_social:
        req.body.razon_social !== undefined
          ? cleanNullableString(req.body.razon_social)
          : existente.razon_social,
      nombre_fantasia:
        req.body.nombre_fantasia !== undefined
          ? cleanNullableString(req.body.nombre_fantasia)
          : existente.nombre_fantasia,
      cuit:
        req.body.cuit !== undefined
          ? cleanNullableString(req.body.cuit)
          : existente.cuit,
      rubro:
        req.body.rubro !== undefined
          ? cleanNullableString(req.body.rubro)
          : existente.rubro,
      telefono:
        req.body.telefono !== undefined
          ? cleanNullableString(req.body.telefono)
          : existente.telefono,
      email:
        req.body.email !== undefined
          ? cleanNullableString(req.body.email)
          : existente.email,
      sitio_web:
        req.body.sitio_web !== undefined
          ? cleanNullableString(req.body.sitio_web)
          : existente.sitio_web,
      instagram:
        req.body.instagram !== undefined
          ? cleanNullableString(req.body.instagram)
          : existente.instagram,
      facebook:
        req.body.facebook !== undefined
          ? cleanNullableString(req.body.facebook)
          : existente.facebook,
      logo_url:
        req.body.logo_url !== undefined
          ? cleanNullableString(req.body.logo_url)
          : existente.logo_url,
      descripcion_empresa:
        req.body.descripcion_empresa !== undefined
          ? cleanNullableString(req.body.descripcion_empresa)
          : existente.descripcion_empresa,
      ciudad:
        req.body.ciudad !== undefined
          ? cleanNullableString(req.body.ciudad)
          : existente.ciudad,
      provincia:
        req.body.provincia !== undefined
          ? cleanNullableString(req.body.provincia)
          : existente.provincia,
      estado: req.body.estado ?? existente.estado
    };

    if (!datosActualizar.razon_social) {
      return res
        .status(400)
        .json({ mensajeError: 'razon_social es requerido' });
    }

    const mensajeCuitDuplicado = await validarCuitDuplicado({
      cuit: datosActualizar.cuit,
      excluirId: id
    });

    if (mensajeCuitDuplicado) {
      return res.status(409).json({ mensajeError: mensajeCuitDuplicado });
    }

    const [numFilasActualizadas] = await AlianzasEmpresasModel.update(
      datosActualizar,
      {
        where: { id }
      }
    );

    if (numFilasActualizadas !== 1) {
      return res.status(404).json({ mensajeError: 'Empresa no encontrada' });
    }

    const registroActualizado = await AlianzasEmpresasModel.findByPk(id, {
      include: buildEmpresaDetailIncludes()
    });

    res.json({
      message: 'Empresa actualizada correctamente',
      registroActualizado
    });
  } catch (error) {
    console.error('Error al actualizar empresa:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// Benjamin Orellana - 2026/04/13 - Elimina una empresa por ID con borrado físico y cascada relacional.
export const ER_AlianzasEmpresas_CTS = async (req, res) => {
  try {
    const { id } = req.params;

    const filasEliminadas = await AlianzasEmpresasModel.destroy({
      where: { id }
    });

    if (filasEliminadas === 0) {
      return res.status(404).json({ mensajeError: 'Empresa no encontrada' });
    }

    res.json({ message: 'Empresa eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar empresa:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};
