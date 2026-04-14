/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 13 / 04 / 2026
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (CTS_TB_AlianzasContactos.js) contiene controladores para manejar
 * operaciones CRUD del módulo alianzas_contactos.
 *
 * Tema: Controladores - Alianzas Contactos
 * Capa: Backend
 */

import { Op } from 'sequelize';
import db from '../../DataBase/db.js';
import AlianzasContactosModel from '../../Models/Empresas/MD_TB_AlianzasContactos.js';
import AlianzasEmpresasModel from '../../Models/Empresas/MD_TB_AlianzasEmpresas.js';
import AlianzasOportunidadesModel from '../../Models/Empresas/MD_TB_AlianzasOportunidades.js';

/* ===========================
 * Helpers
 * =========================== */

// Benjamin Orellana - 2026/04/13 - Limpia strings vacíos para evitar persistir valores basura.
const cleanNullableString = (value) => {
  if (value === undefined || value === null) return null;
  const normalized = String(value).trim();
  return normalized === '' ? null : normalized;
};

// Benjamin Orellana - 2026/04/13 - Convierte valores booleanos o equivalentes a tinyint cuando corresponde.
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

// Benjamin Orellana - 2026/04/13 - Incluye empresa y oportunidades vinculadas al contacto como principal.
const buildContactoDetailIncludes = () => [
  {
    model: AlianzasEmpresasModel,
    as: 'empresa',
    required: false
  },
  {
    model: AlianzasOportunidadesModel,
    as: 'oportunidades_como_contacto_principal',
    required: false
  }
];

// Benjamin Orellana - 2026/04/13 - Valida existencia de empresa antes de crear o actualizar contactos.
const validarEmpresaExistente = async (empresa_id) => {
  if (!empresa_id) return 'empresa_id es requerido';

  const empresa = await AlianzasEmpresasModel.findByPk(empresa_id);
  if (!empresa) return 'La empresa indicada no existe';

  return null;
};

/* ===========================
 * CRUD
 * =========================== */

// Benjamin Orellana - 2026/04/13 - Obtiene contactos con filtros por empresa, principal y búsqueda general.
export const OBRS_AlianzasContactos_CTS = async (req, res) => {
  try {
    const { empresa_id, es_principal, q } = req.query;

    const whereClause = {};

    if (empresa_id) whereClause.empresa_id = empresa_id;

    const esPrincipalTinyInt = parseBooleanToTinyInt(es_principal);
    if (esPrincipalTinyInt !== null) {
      whereClause.es_principal = esPrincipalTinyInt;
    }

    if (q && String(q).trim() !== '') {
      const qTrim = String(q).trim();

      whereClause[Op.or] = [
        { nombre: { [Op.like]: `%${qTrim}%` } },
        { apellido: { [Op.like]: `%${qTrim}%` } },
        { cargo: { [Op.like]: `%${qTrim}%` } },
        { telefono: { [Op.like]: `%${qTrim}%` } },
        { email: { [Op.like]: `%${qTrim}%` } },
        { observaciones: { [Op.like]: `%${qTrim}%` } },
        { '$empresa.razon_social$': { [Op.like]: `%${qTrim}%` } },
        { '$empresa.nombre_fantasia$': { [Op.like]: `%${qTrim}%` } }
      ];
    }

    const registros = await AlianzasContactosModel.findAll({
      where: whereClause,
      include: [
        {
          model: AlianzasEmpresasModel,
          as: 'empresa',
          required: false
        }
      ],
      order: [
        ['es_principal', 'DESC'],
        ['nombre', 'ASC'],
        ['apellido', 'ASC'],
        ['created_at', 'DESC']
      ]
    });

    res.json(registros);
  } catch (error) {
    console.error('Error al obtener contactos:', error);
    res.status(500).json({ mensajeError: 'Error al obtener contactos' });
  }
};

// Benjamin Orellana - 2026/04/13 - Obtiene un contacto por ID con su empresa y oportunidades relacionadas.
export const OBR_AlianzasContactos_CTS = async (req, res) => {
  try {
    const registro = await AlianzasContactosModel.findByPk(req.params.id, {
      include: buildContactoDetailIncludes()
    });

    if (!registro) {
      return res.status(404).json({ mensajeError: 'Contacto no encontrado' });
    }

    res.json(registro);
  } catch (error) {
    console.error('Error al obtener contacto:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// Benjamin Orellana - 2026/04/13 - Crea un contacto y garantiza unicidad operativa del principal por empresa.
export const CR_AlianzasContactos_CTS = async (req, res) => {
  const transaction = await db.transaction();

  try {
    const datos = {
      empresa_id: req.body.empresa_id,
      nombre: cleanNullableString(req.body.nombre),
      apellido: cleanNullableString(req.body.apellido),
      cargo: cleanNullableString(req.body.cargo),
      telefono: cleanNullableString(req.body.telefono),
      email: cleanNullableString(req.body.email),
      es_principal:
        parseBooleanToTinyInt(req.body.es_principal) !== null
          ? parseBooleanToTinyInt(req.body.es_principal)
          : 0,
      observaciones: cleanNullableString(req.body.observaciones)
    };

    if (!datos.nombre) {
      await transaction.rollback();
      return res.status(400).json({ mensajeError: 'nombre es requerido' });
    }

    const mensajeEmpresa = await validarEmpresaExistente(datos.empresa_id);
    if (mensajeEmpresa) {
      await transaction.rollback();
      return res.status(400).json({ mensajeError: mensajeEmpresa });
    }

    if (datos.es_principal === 1) {
      await AlianzasContactosModel.update(
        { es_principal: 0 },
        {
          where: { empresa_id: datos.empresa_id },
          transaction
        }
      );
    }

    const registroCreado = await AlianzasContactosModel.create(datos, {
      transaction
    });

    await transaction.commit();

    const detalleCreado = await AlianzasContactosModel.findByPk(
      registroCreado.id,
      {
        include: buildContactoDetailIncludes()
      }
    );

    res.json({
      message: 'Contacto creado correctamente',
      registroCreado: detalleCreado
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear contacto:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// Benjamin Orellana - 2026/04/13 - Actualiza un contacto y mantiene un único principal por empresa.
export const UR_AlianzasContactos_CTS = async (req, res) => {
  const transaction = await db.transaction();

  try {
    const { id } = req.params;

    const existente = await AlianzasContactosModel.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!existente) {
      await transaction.rollback();
      return res.status(404).json({ mensajeError: 'Contacto no encontrado' });
    }

    const datosActualizar = {
      empresa_id:
        req.body.empresa_id !== undefined
          ? req.body.empresa_id
          : existente.empresa_id,
      nombre:
        req.body.nombre !== undefined
          ? cleanNullableString(req.body.nombre)
          : existente.nombre,
      apellido:
        req.body.apellido !== undefined
          ? cleanNullableString(req.body.apellido)
          : existente.apellido,
      cargo:
        req.body.cargo !== undefined
          ? cleanNullableString(req.body.cargo)
          : existente.cargo,
      telefono:
        req.body.telefono !== undefined
          ? cleanNullableString(req.body.telefono)
          : existente.telefono,
      email:
        req.body.email !== undefined
          ? cleanNullableString(req.body.email)
          : existente.email,
      es_principal:
        parseBooleanToTinyInt(req.body.es_principal) !== null
          ? parseBooleanToTinyInt(req.body.es_principal)
          : existente.es_principal,
      observaciones:
        req.body.observaciones !== undefined
          ? cleanNullableString(req.body.observaciones)
          : existente.observaciones
    };

    if (!datosActualizar.nombre) {
      await transaction.rollback();
      return res.status(400).json({ mensajeError: 'nombre es requerido' });
    }

    const mensajeEmpresa = await validarEmpresaExistente(
      datosActualizar.empresa_id
    );
    if (mensajeEmpresa) {
      await transaction.rollback();
      return res.status(400).json({ mensajeError: mensajeEmpresa });
    }

    if (datosActualizar.es_principal === 1) {
      await AlianzasContactosModel.update(
        { es_principal: 0 },
        {
          where: {
            empresa_id: datosActualizar.empresa_id,
            id: { [Op.ne]: id }
          },
          transaction
        }
      );
    }

    const [numFilasActualizadas] = await AlianzasContactosModel.update(
      datosActualizar,
      {
        where: { id },
        transaction
      }
    );

    if (numFilasActualizadas !== 1) {
      await transaction.rollback();
      return res.status(404).json({ mensajeError: 'Contacto no encontrado' });
    }

    await transaction.commit();

    const registroActualizado = await AlianzasContactosModel.findByPk(id, {
      include: buildContactoDetailIncludes()
    });

    res.json({
      message: 'Contacto actualizado correctamente',
      registroActualizado
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al actualizar contacto:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// Benjamin Orellana - 2026/04/13 - Elimina físicamente un contacto por ID.
export const ER_AlianzasContactos_CTS = async (req, res) => {
  try {
    const { id } = req.params;

    const filasEliminadas = await AlianzasContactosModel.destroy({
      where: { id }
    });

    if (filasEliminadas === 0) {
      return res.status(404).json({ mensajeError: 'Contacto no encontrado' });
    }

    res.json({ message: 'Contacto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar contacto:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};
