/*
 * Programador: Benjamin Orellana
 * Fecha creación: 14/04/2026
 * Versión: 1.0
 * Descripción: Controlador principal para publicaciones de galería social moderada de alumnos.
 * Tema: Galería de alumnos / Altos Roca
 * Capa: Controlador
 */

import { Op } from 'sequelize';
import db from '../../DataBase/db.js';
import StudentGalleryPostsModel from '../../Models/Galeria/MD_TB_StudentGalleryPosts.js';
import StudentGalleryMediaModel from '../../Models/Galeria/MD_TB_StudentGalleryMedia.js';
import StudentsModel from '../../Models/MD_TB_Students.js';
import UsersModel from '../../Models/Core/MD_TB_Users.js';

import fs from 'fs';
import path from 'path';

/* Benjamin Orellana - 2026/04/14 - Resuelve y elimina archivos físicos locales asociados a publicaciones completas de galería. */
const STUDENT_GALLERY_PUBLIC_PREFIX = '/student-gallery-files/';

const resolveStudentGalleryAbsolutePath = (fileUrl = null) => {
  if (!fileUrl || typeof fileUrl !== 'string') return null;

  const markerIndex = fileUrl.indexOf(STUDENT_GALLERY_PUBLIC_PREFIX);
  if (markerIndex === -1) return null;

  const relativeFile = fileUrl.slice(
    markerIndex + STUDENT_GALLERY_PUBLIC_PREFIX.length
  );

  if (!relativeFile) return null;

  return path.join(process.cwd(), 'public', 'student-gallery', relativeFile);
};

const removeStudentGalleryPhysicalFile = async (fileUrl = null) => {
  try {
    const absolutePath = resolveStudentGalleryAbsolutePath(fileUrl);

    if (!absolutePath) return;
    if (!fs.existsSync(absolutePath)) return;

    await fs.promises.unlink(absolutePath);
  } catch (error) {
    console.error(
      'No se pudo eliminar el archivo físico de galería:',
      error.message
    );
  }
};
/* Benjamin Orellana - 2026/04/14 - Obtiene el user_id desde distintos formatos de autenticación ya usados en el sistema. */
const getUserIdFromReq = (req) => {
  return (
    req?.user?.id ||
    req?.usuario?.id ||
    req?.auth?.id ||
    req?.body?.user_id ||
    req?.headers?.['x-auth-user-id'] ||
    null
  );
};

/* Benjamin Orellana - 2026/04/14 - Normaliza booleanos provenientes de body/query para evitar inconsistencias. */
const parseBoolean = (value, defaultValue = null) => {
  if (value === undefined || value === null || value === '')
    return defaultValue;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['1', 'true', 'si', 'sí', 'yes'].includes(normalized)) return true;
    if (['0', 'false', 'no'].includes(normalized)) return false;
  }
  return defaultValue;
};

/* Benjamin Orellana - 2026/04/14 - Fuerza enteros seguros para paginación y filtros. */
const parseInteger = (value, defaultValue = null) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
};

/* Benjamin Orellana - 2026/04/14 - Construye el include estándar para detalle y listados del módulo. */
const buildPostInclude = () => [
  {
    model: StudentsModel,
    as: 'student',
    attributes: ['id', 'nomyape', 'dni', 'telefono']
  },
  {
    model: UsersModel,
    as: 'creado_por',
    attributes: ['id', 'name', 'email'],
    required: false
  },
  {
    model: UsersModel,
    as: 'revisado_por',
    attributes: ['id', 'name', 'email'],
    required: false
  },
  {
    model: StudentGalleryMediaModel,
    as: 'media',
    attributes: [
      'id',
      'post_id',
      'tipo_archivo',
      'archivo_url',
      'thumbnail_url',
      'archivo_nombre_original',
      'mime_type',
      'peso_bytes',
      'ancho',
      'alto',
      'duracion_segundos',
      'orden',
      'es_portada',
      'estado',
      'created_at',
      'updated_at'
    ],
    where: { estado: 'activo' },
    required: false,
    separate: true,
    order: [
      ['orden', 'ASC'],
      ['id', 'ASC']
    ]
  }
];

/* Benjamin Orellana - 2026/04/14 - Lista publicaciones con filtros, paginación y relaciones necesarias para staff/admin. */
export const OBRS_StudentGalleryPosts_CTS = async (req, res) => {
  try {
    const page = Math.max(parseInteger(req.query.page, 1), 1);
    const limit = Math.min(Math.max(parseInteger(req.query.limit, 20), 1), 100);
    const offset = (page - 1) * limit;

    const q = (req.query.q || '').trim();
    const estado = req.query.estado?.trim() || null;
    const student_id = parseInteger(req.query.student_id, null);
    const destacada = parseBoolean(req.query.destacada, null);
    const mostrar_en_home = parseBoolean(req.query.mostrar_en_home, null);
    const consentimiento_publico = parseBoolean(
      req.query.consentimiento_publico,
      null
    );
    const canal_carga = req.query.canal_carga?.trim() || null;
    const tipo_publicacion = req.query.tipo_publicacion?.trim() || null;

    const where = {};

    if (estado) where.estado = estado;
    if (student_id) where.student_id = student_id;
    if (destacada !== null) where.destacada = destacada;
    if (mostrar_en_home !== null) where.mostrar_en_home = mostrar_en_home;
    if (consentimiento_publico !== null) {
      where.consentimiento_publico = consentimiento_publico;
    }
    if (canal_carga) where.canal_carga = canal_carga;
    if (tipo_publicacion) where.tipo_publicacion = tipo_publicacion;

    if (q) {
      where[Op.or] = [
        { titulo: { [Op.like]: `%${q}%` } },
        { descripcion: { [Op.like]: `%${q}%` } },
        { template_codigo: { [Op.like]: `%${q}%` } },
        { '$student.nomyape$': { [Op.like]: `%${q}%` } },
        { '$student.dni$': { [Op.like]: `%${q}%` } }
      ];
    }

    const { count, rows } = await StudentGalleryPostsModel.findAndCountAll({
      where,
      include: [
        {
          model: StudentsModel,
          as: 'student',
          attributes: ['id', 'nomyape', 'dni', 'telefono'],
          required: true
        }
      ],
      order: [
        ['destacada', 'DESC'],
        ['orden_home', 'ASC'],
        ['created_at', 'DESC'],
        ['id', 'DESC']
      ],
      distinct: true,
      subQuery: false,
      limit,
      offset
    });

    const ids = rows.map((row) => row.id);

    const rowsConDetalle =
      ids.length > 0
        ? await StudentGalleryPostsModel.findAll({
            where: { id: ids },
            include: buildPostInclude(),
            order: [
              ['destacada', 'DESC'],
              ['orden_home', 'ASC'],
              ['created_at', 'DESC'],
              ['id', 'DESC']
            ]
          })
        : [];

    return res.status(200).json({
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      rows: rowsConDetalle
    });
  } catch (error) {
    return res.status(500).json({
      mensajeError: error.message
    });
  }
};

/* Benjamin Orellana - 2026/04/14 - Devuelve publicaciones públicas aprobadas para la home o galería pública. */
export const OBRS_StudentGalleryPostsPublicHome_CTS = async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInteger(req.query.limit, 8), 1), 50);
    const destacadasPrimero = parseBoolean(req.query.destacadas_primero, true);

    const order = destacadasPrimero
      ? [
          ['destacada', 'DESC'],
          ['orden_home', 'ASC'],
          ['fecha_publicacion', 'DESC'],
          ['id', 'DESC']
        ]
      : [
          ['fecha_publicacion', 'DESC'],
          ['id', 'DESC']
        ];

    const rows = await StudentGalleryPostsModel.findAll({
      where: {
        estado: 'aprobado',
        mostrar_en_home: true,
        consentimiento_publico: true
      },
      include: buildPostInclude(),
      order,
      limit
    });

    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({
      mensajeError: error.message
    });
  }
};

/* Benjamin Orellana - 2026/04/14 - Obtiene el detalle completo de una publicación de galería. */
export const OBR_StudentGalleryPost_CTS = async (req, res) => {
  try {
    const { id } = req.params;

    const row = await StudentGalleryPostsModel.findByPk(id, {
      include: buildPostInclude()
    });

    if (!row) {
      return res.status(404).json({
        mensajeError: 'Publicación no encontrada.'
      });
    }

    return res.status(200).json(row);
  } catch (error) {
    return res.status(500).json({
      mensajeError: error.message
    });
  }
};

/* Benjamin Orellana - 2026/04/14 - Crea una publicación principal en estado moderable, lista para luego cargar medios. */
export const CR_StudentGalleryPost_CTS = async (req, res) => {
  const transaction = await db.transaction();

  try {
    const actorId = getUserIdFromReq(req);

    const {
      student_id,
      titulo = null,
      descripcion = null,
      tipo_publicacion = 'foto',
      template_codigo = 'altos-roca-classic',
      mostrar_nombre = true,
      mostrar_fecha = true,
      mostrar_en_home = true,
      destacada = false,
      orden_home = 0,
      consentimiento_publico = false,
      fecha_consentimiento = null,
      canal_carga = 'staff'
    } = req.body;

    if (!student_id) {
      await transaction.rollback();
      return res.status(400).json({
        mensajeError: 'El campo student_id es obligatorio.'
      });
    }

    const student = await StudentsModel.findByPk(student_id, { transaction });

    if (!student) {
      await transaction.rollback();
      return res.status(404).json({
        mensajeError: 'El alumno indicado no existe.'
      });
    }

    const consentimientoNormalizado = parseBoolean(
      consentimiento_publico,
      false
    );

    const created = await StudentGalleryPostsModel.create(
      {
        student_id,
        titulo,
        descripcion,
        estado: 'pendiente',
        tipo_publicacion,
        template_codigo,
        mostrar_nombre: parseBoolean(mostrar_nombre, true),
        mostrar_fecha: parseBoolean(mostrar_fecha, true),
        mostrar_en_home: parseBoolean(mostrar_en_home, true),
        destacada: parseBoolean(destacada, false),
        orden_home: parseInteger(orden_home, 0) || 0,
        consentimiento_publico: consentimientoNormalizado,
        fecha_consentimiento: consentimientoNormalizado
          ? fecha_consentimiento || new Date()
          : null,
        canal_carga,
        creado_por_user_id: actorId
      },
      { transaction }
    );

    await transaction.commit();

    const row = await StudentGalleryPostsModel.findByPk(created.id, {
      include: buildPostInclude()
    });

    return res.status(201).json(row);
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      mensajeError: error.message
    });
  }
};

/* Benjamin Orellana - 2026/04/14 - Actualiza campos editables de la publicación sin alterar su historial de moderación por endpoints separados. */
export const UR_StudentGalleryPost_CTS = async (req, res) => {
  const transaction = await db.transaction();

  try {
    const { id } = req.params;

    const row = await StudentGalleryPostsModel.findByPk(id, { transaction });

    if (!row) {
      await transaction.rollback();
      return res.status(404).json({
        mensajeError: 'Publicación no encontrada.'
      });
    }

    const payload = {};

    const editableFields = [
      'student_id',
      'titulo',
      'descripcion',
      'tipo_publicacion',
      'template_codigo',
      'canal_carga'
    ];

    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) payload[field] = req.body[field];
    });

    if (req.body.mostrar_nombre !== undefined) {
      payload.mostrar_nombre = parseBoolean(
        req.body.mostrar_nombre,
        row.mostrar_nombre
      );
    }

    if (req.body.mostrar_fecha !== undefined) {
      payload.mostrar_fecha = parseBoolean(
        req.body.mostrar_fecha,
        row.mostrar_fecha
      );
    }

    if (req.body.mostrar_en_home !== undefined) {
      payload.mostrar_en_home = parseBoolean(
        req.body.mostrar_en_home,
        row.mostrar_en_home
      );
    }

    if (req.body.destacada !== undefined) {
      payload.destacada = parseBoolean(req.body.destacada, row.destacada);
    }

    if (req.body.orden_home !== undefined) {
      payload.orden_home =
        parseInteger(req.body.orden_home, row.orden_home) || 0;
    }

    if (req.body.consentimiento_publico !== undefined) {
      payload.consentimiento_publico = parseBoolean(
        req.body.consentimiento_publico,
        row.consentimiento_publico
      );
      payload.fecha_consentimiento = payload.consentimiento_publico
        ? req.body.fecha_consentimiento ||
          row.fecha_consentimiento ||
          new Date()
        : null;
    } else if (req.body.fecha_consentimiento !== undefined) {
      payload.fecha_consentimiento = req.body.fecha_consentimiento;
    }

    if (payload.student_id) {
      const student = await StudentsModel.findByPk(payload.student_id, {
        transaction
      });

      if (!student) {
        await transaction.rollback();
        return res.status(404).json({
          mensajeError: 'El alumno indicado no existe.'
        });
      }
    }

    await row.update(payload, { transaction });
    await transaction.commit();

    const updated = await StudentGalleryPostsModel.findByPk(id, {
      include: buildPostInclude()
    });

    return res.status(200).json(updated);
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      mensajeError: error.message
    });
  }
};

/* Benjamin Orellana - 2026/04/14 - Aprueba una publicación para que pueda mostrarse públicamente en la web. */
export const APROBAR_StudentGalleryPost_CTS = async (req, res) => {
  const transaction = await db.transaction();

  try {
    const { id } = req.params;
    const actorId = getUserIdFromReq(req);

    const row = await StudentGalleryPostsModel.findByPk(id, {
      include: [
        {
          model: StudentGalleryMediaModel,
          as: 'media',
          where: { estado: 'activo' },
          required: false
        }
      ],
      transaction
    });

    if (!row) {
      await transaction.rollback();
      return res.status(404).json({
        mensajeError: 'Publicación no encontrada.'
      });
    }

    if (!row.consentimiento_publico) {
      await transaction.rollback();
      return res.status(400).json({
        mensajeError:
          'No se puede aprobar una publicación sin consentimiento_publico en true.'
      });
    }

    if (!row.media || row.media.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        mensajeError:
          'No se puede aprobar una publicación sin al menos un archivo activo asociado.'
      });
    }

    await row.update(
      {
        estado: 'aprobado',
        revisado_por_user_id: actorId,
        fecha_revision: new Date(),
        fecha_publicacion: row.fecha_publicacion || new Date(),
        motivo_rechazo: null
      },
      { transaction }
    );

    await transaction.commit();

    const updated = await StudentGalleryPostsModel.findByPk(id, {
      include: buildPostInclude()
    });

    return res.status(200).json(updated);
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      mensajeError: error.message
    });
  }
};

/* Benjamin Orellana - 2026/04/14 - Rechaza una publicación y registra motivo operativo para revisión posterior. */
export const RECHAZAR_StudentGalleryPost_CTS = async (req, res) => {
  const transaction = await db.transaction();

  try {
    const { id } = req.params;
    const actorId = getUserIdFromReq(req);
    const { motivo_rechazo = null } = req.body;

    const row = await StudentGalleryPostsModel.findByPk(id, { transaction });

    if (!row) {
      await transaction.rollback();
      return res.status(404).json({
        mensajeError: 'Publicación no encontrada.'
      });
    }

    await row.update(
      {
        estado: 'rechazado',
        revisado_por_user_id: actorId,
        fecha_revision: new Date(),
        motivo_rechazo
      },
      { transaction }
    );

    await transaction.commit();

    const updated = await StudentGalleryPostsModel.findByPk(id, {
      include: buildPostInclude()
    });

    return res.status(200).json(updated);
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      mensajeError: error.message
    });
  }
};

/* Benjamin Orellana - 2026/04/14 - Archiva una publicación para retirarla del circuito operativo sin perder trazabilidad. */
export const ARCHIVAR_StudentGalleryPost_CTS = async (req, res) => {
  const transaction = await db.transaction();

  try {
    const { id } = req.params;
    const actorId = getUserIdFromReq(req);

    const row = await StudentGalleryPostsModel.findByPk(id, { transaction });

    if (!row) {
      await transaction.rollback();
      return res.status(404).json({
        mensajeError: 'Publicación no encontrada.'
      });
    }

    await row.update(
      {
        estado: 'archivado',
        revisado_por_user_id: actorId,
        fecha_revision: new Date(),
        mostrar_en_home: false
      },
      { transaction }
    );

    await transaction.commit();

    const updated = await StudentGalleryPostsModel.findByPk(id, {
      include: buildPostInclude()
    });

    return res.status(200).json(updated);
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      mensajeError: error.message
    });
  }
};

/* Benjamin Orellana - 2026/04/14 - Elimina físicamente una publicación y sus medios asociados por cascada cuando la operación lo requiera. */
export const ER_StudentGalleryPost_CTS = async (req, res) => {
  const transaction = await db.transaction();

  try {
    const { id } = req.params;

    const row = await StudentGalleryPostsModel.findByPk(id, { transaction });

    if (!row) {
      await transaction.rollback();
      return res.status(404).json({
        mensajeError: 'Publicación no encontrada.'
      });
    }

    /* Benjamin Orellana - 2026/04/14 - Antes de eliminar el post se borran sus archivos físicos locales asociados. */
    const mediaRows = await StudentGalleryMediaModel.findAll({
      where: { post_id: id },
      transaction
    });

    for (const mediaRow of mediaRows) {
      await removeStudentGalleryPhysicalFile(mediaRow.archivo_url);

      if (
        mediaRow.thumbnail_url &&
        mediaRow.thumbnail_url !== mediaRow.archivo_url
      ) {
        await removeStudentGalleryPhysicalFile(mediaRow.thumbnail_url);
      }
    }

    await row.destroy({ transaction });
    await transaction.commit();

    return res.status(200).json({
      ok: true,
      mensaje: 'Publicación eliminada correctamente.'
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      mensajeError: error.message
    });
  }
};
