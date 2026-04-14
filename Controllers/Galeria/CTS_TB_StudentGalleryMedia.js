/*
 * Programador: Benjamin Orellana
 * Fecha creación: 14/04/2026
 * Versión: 1.0
 * Descripción: Controlador para archivos multimedia asociados a publicaciones de galería social moderada de alumnos.
 * Tema: Galería de alumnos / Altos Roca
 * Capa: Controlador
 */

import { Op } from 'sequelize';
import db from '../../DataBase/db.js';
import StudentGalleryPostsModel from '../../Models/Galeria/MD_TB_StudentGalleryPosts.js';
import StudentGalleryMediaModel from '../../Models/Galeria/MD_TB_StudentGalleryMedia.js';
import StudentsModel from '../../Models/MD_TB_Students.js';
import fs from 'fs';
import path from 'path';

/* Benjamin Orellana - 2026/04/14 - Resuelve y elimina archivos físicos locales del módulo de galería cuando corresponde. */
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
/* Benjamin Orellana - 2026/04/14 - Normaliza enteros para ids, orden y paginación. */
const parseInteger = (value, defaultValue = null) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
};

/* Benjamin Orellana - 2026/04/14 - Normaliza booleanos provenientes de body/query. */
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

/* Benjamin Orellana - 2026/04/14 - Construye el include estándar del medio con su publicación y alumno asociado. */
const buildMediaInclude = () => [
  {
    model: StudentGalleryPostsModel,
    as: 'post',
    attributes: [
      'id',
      'student_id',
      'titulo',
      'descripcion',
      'estado',
      'tipo_publicacion',
      'template_codigo',
      'mostrar_nombre',
      'mostrar_fecha',
      'mostrar_en_home',
      'destacada',
      'orden_home',
      'consentimiento_publico',
      'canal_carga',
      'fecha_publicacion',
      'created_at',
      'updated_at'
    ],
    include: [
      {
        model: StudentsModel,
        as: 'student',
        attributes: ['id', 'nomyape', 'dni', 'telefono']
      }
    ]
  }
];

/* Benjamin Orellana - 2026/04/14 - Obtiene el siguiente orden disponible dentro de una publicación. */
const getNextOrdenForPost = async (postId, transaction = null) => {
  const maxOrden = await StudentGalleryMediaModel.max('orden', {
    where: {
      post_id: postId,
      estado: 'activo'
    },
    transaction
  });

  return (maxOrden || 0) + 1;
};

/* Benjamin Orellana - 2026/04/14 - Verifica si una publicación ya tiene una portada activa definida. */
const postHasPortada = async (postId, transaction = null) => {
  const portada = await StudentGalleryMediaModel.findOne({
    where: {
      post_id: postId,
      estado: 'activo',
      es_portada: true
    },
    transaction
  });

  return !!portada;
};

/* Benjamin Orellana - 2026/04/14 - Lista medios con filtros operativos y soporte de paginación. */
export const OBRS_StudentGalleryMedia_CTS = async (req, res) => {
  try {
    const page = Math.max(parseInteger(req.query.page, 1), 1);
    const limit = Math.min(Math.max(parseInteger(req.query.limit, 20), 1), 100);
    const offset = (page - 1) * limit;

    const post_id = parseInteger(req.query.post_id, null);
    const tipo_archivo = req.query.tipo_archivo?.trim() || null;
    const estado = req.query.estado?.trim() || 'activo';
    const q = (req.query.q || '').trim();

    const where = {};

    if (post_id) where.post_id = post_id;
    if (tipo_archivo) where.tipo_archivo = tipo_archivo;
    if (estado) where.estado = estado;

    if (q) {
      where[Op.or] = [
        { archivo_url: { [Op.like]: `%${q}%` } },
        { thumbnail_url: { [Op.like]: `%${q}%` } },
        { archivo_nombre_original: { [Op.like]: `%${q}%` } },
        { mime_type: { [Op.like]: `%${q}%` } }
      ];
    }

    const { count, rows } = await StudentGalleryMediaModel.findAndCountAll({
      where,
      include: buildMediaInclude(),
      order: [
        ['post_id', 'ASC'],
        ['es_portada', 'DESC'],
        ['orden', 'ASC'],
        ['id', 'ASC']
      ],
      distinct: true,
      limit,
      offset
    });

    return res.status(200).json({
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      rows
    });
  } catch (error) {
    return res.status(500).json({
      mensajeError: error.message
    });
  }
};

/* Benjamin Orellana - 2026/04/14 - Lista únicamente los medios activos de una publicación para slider o gestión puntual. */
export const OBRS_StudentGalleryMediaByPost_CTS = async (req, res) => {
  try {
    const { post_id } = req.params;

    const post = await StudentGalleryPostsModel.findByPk(post_id);

    if (!post) {
      return res.status(404).json({
        mensajeError: 'La publicación indicada no existe.'
      });
    }

    const rows = await StudentGalleryMediaModel.findAll({
      where: {
        post_id,
        estado: 'activo'
      },
      include: buildMediaInclude(),
      order: [
        ['es_portada', 'DESC'],
        ['orden', 'ASC'],
        ['id', 'ASC']
      ]
    });

    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({
      mensajeError: error.message
    });
  }
};

/* Benjamin Orellana - 2026/04/14 - Devuelve el detalle de un medio puntual con su contexto completo. */
export const OBR_StudentGalleryMedia_CTS = async (req, res) => {
  try {
    const { id } = req.params;

    const row = await StudentGalleryMediaModel.findByPk(id, {
      include: buildMediaInclude()
    });

    if (!row) {
      return res.status(404).json({
        mensajeError: 'Archivo multimedia no encontrado.'
      });
    }

    return res.status(200).json(row);
  } catch (error) {
    return res.status(500).json({
      mensajeError: error.message
    });
  }
};

/* Benjamin Orellana - 2026/04/14 - Crea uno o varios medios asociados a una publicación, respetando orden y portada. */
export const CR_StudentGalleryMedia_CTS = async (req, res) => {
  const transaction = await db.transaction();

  try {
    const {
      post_id,
      media = null,
      tipo_archivo,
      archivo_url,
      thumbnail_url = null,
      archivo_nombre_original = null,
      mime_type = null,
      peso_bytes = null,
      ancho = null,
      alto = null,
      duracion_segundos = null,
      orden = null,
      es_portada = null
    } = req.body;

    if (!post_id) {
      await transaction.rollback();
      return res.status(400).json({
        mensajeError: 'El campo post_id es obligatorio.'
      });
    }

    const post = await StudentGalleryPostsModel.findByPk(post_id, {
      transaction
    });

    if (!post) {
      await transaction.rollback();
      return res.status(404).json({
        mensajeError: 'La publicación indicada no existe.'
      });
    }

    const mediaItems =
      Array.isArray(media) && media.length > 0
        ? media
        : [
            {
              tipo_archivo,
              archivo_url,
              thumbnail_url,
              archivo_nombre_original,
              mime_type,
              peso_bytes,
              ancho,
              alto,
              duracion_segundos,
              orden,
              es_portada
            }
          ];

    const sanitizedItems = mediaItems.filter(
      (item) =>
        item && item.archivo_url && String(item.archivo_url).trim() !== ''
    );

    if (sanitizedItems.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        mensajeError:
          'Debe enviar al menos un archivo válido con archivo_url para registrar el medio.'
      });
    }

    const alreadyHasPortada = await postHasPortada(post_id, transaction);
    let nextOrden = await getNextOrdenForPost(post_id, transaction);

    const createdRows = [];

    for (let i = 0; i < sanitizedItems.length; i += 1) {
      const item = sanitizedItems[i];

      const ordenNormalizado =
        parseInteger(item.orden, null) !== null
          ? parseInteger(item.orden, null)
          : nextOrden++;

      const shouldBePortada =
        parseBoolean(item.es_portada, null) === true ||
        (!alreadyHasPortada && createdRows.length === 0 && i === 0);

      const created = await StudentGalleryMediaModel.create(
        {
          post_id,
          tipo_archivo: item.tipo_archivo || 'imagen',
          archivo_url: item.archivo_url,
          thumbnail_url: item.thumbnail_url || null,
          archivo_nombre_original: item.archivo_nombre_original || null,
          mime_type: item.mime_type || null,
          peso_bytes: item.peso_bytes || null,
          ancho: item.ancho || null,
          alto: item.alto || null,
          duracion_segundos: item.duracion_segundos || null,
          orden: ordenNormalizado,
          es_portada: shouldBePortada,
          estado: 'activo'
        },
        { transaction }
      );

      createdRows.push(created);
    }

    const createdPortada = createdRows.find((item) => item.es_portada);

    if (createdPortada) {
      await StudentGalleryMediaModel.update(
        { es_portada: false },
        {
          where: {
            post_id,
            estado: 'activo',
            id: { [Op.ne]: createdPortada.id }
          },
          transaction
        }
      );
    }

    await transaction.commit();

    const ids = createdRows.map((item) => item.id);

    const rows = await StudentGalleryMediaModel.findAll({
      where: { id: ids },
      include: buildMediaInclude(),
      order: [
        ['orden', 'ASC'],
        ['id', 'ASC']
      ]
    });

    return res.status(201).json(rows);
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      mensajeError: error.message
    });
  }
};

/* Benjamin Orellana - 2026/04/14 - Actualiza metadatos editables del medio sin alterar su vinculación histórica. */
export const UR_StudentGalleryMedia_CTS = async (req, res) => {
  const transaction = await db.transaction();

  try {
    const { id } = req.params;

    const row = await StudentGalleryMediaModel.findByPk(id, { transaction });

    if (!row) {
      await transaction.rollback();
      return res.status(404).json({
        mensajeError: 'Archivo multimedia no encontrado.'
      });
    }

    const payload = {};

    const editableFields = [
      'tipo_archivo',
      'archivo_url',
      'thumbnail_url',
      'archivo_nombre_original',
      'mime_type',
      'peso_bytes',
      'ancho',
      'alto',
      'duracion_segundos'
    ];

    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) payload[field] = req.body[field];
    });

    if (req.body.orden !== undefined) {
      payload.orden = parseInteger(req.body.orden, row.orden) || row.orden;
    }

    if (req.body.es_portada !== undefined) {
      payload.es_portada = parseBoolean(req.body.es_portada, row.es_portada);
    }

    await row.update(payload, { transaction });

    if (payload.es_portada === true) {
      await StudentGalleryMediaModel.update(
        { es_portada: false },
        {
          where: {
            post_id: row.post_id,
            estado: 'activo',
            id: { [Op.ne]: row.id }
          },
          transaction
        }
      );
    }

    await transaction.commit();

    const updated = await StudentGalleryMediaModel.findByPk(id, {
      include: buildMediaInclude()
    });

    return res.status(200).json(updated);
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      mensajeError: error.message
    });
  }
};

/* Benjamin Orellana - 2026/04/14 - Reordena en lote los medios del carrusel dentro de una publicación. */
export const UR_StudentGalleryMediaReordenar_CTS = async (req, res) => {
  const transaction = await db.transaction();

  try {
    const { post_id } = req.params;
    const { items = [] } = req.body;

    const post = await StudentGalleryPostsModel.findByPk(post_id, {
      transaction
    });

    if (!post) {
      await transaction.rollback();
      return res.status(404).json({
        mensajeError: 'La publicación indicada no existe.'
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        mensajeError:
          'Debe enviar un array items con la estructura [{ id, orden }].'
      });
    }

    for (const item of items) {
      if (!item?.id || parseInteger(item.orden, null) === null) {
        await transaction.rollback();
        return res.status(400).json({
          mensajeError: 'Cada item debe incluir id y orden válidos.'
        });
      }

      const mediaRow = await StudentGalleryMediaModel.findOne({
        where: {
          id: item.id,
          post_id,
          estado: 'activo'
        },
        transaction
      });

      if (!mediaRow) {
        await transaction.rollback();
        return res.status(404).json({
          mensajeError: `No existe un medio activo con id ${item.id} para la publicación ${post_id}.`
        });
      }

      await mediaRow.update(
        {
          orden: parseInteger(item.orden, mediaRow.orden)
        },
        { transaction }
      );
    }

    await transaction.commit();

    const rows = await StudentGalleryMediaModel.findAll({
      where: {
        post_id,
        estado: 'activo'
      },
      include: buildMediaInclude(),
      order: [
        ['es_portada', 'DESC'],
        ['orden', 'ASC'],
        ['id', 'ASC']
      ]
    });

    return res.status(200).json(rows);
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      mensajeError: error.message
    });
  }
};

/* Benjamin Orellana - 2026/04/14 - Define un medio como portada única de la publicación. */
export const UR_StudentGalleryMediaSetPortada_CTS = async (req, res) => {
  const transaction = await db.transaction();

  try {
    const { id } = req.params;

    const row = await StudentGalleryMediaModel.findByPk(id, { transaction });

    if (!row || row.estado !== 'activo') {
      await transaction.rollback();
      return res.status(404).json({
        mensajeError: 'Archivo multimedia activo no encontrado.'
      });
    }

    await StudentGalleryMediaModel.update(
      { es_portada: false },
      {
        where: {
          post_id: row.post_id,
          estado: 'activo'
        },
        transaction
      }
    );

    await row.update({ es_portada: true }, { transaction });

    await transaction.commit();

    const updated = await StudentGalleryMediaModel.findByPk(id, {
      include: buildMediaInclude()
    });

    return res.status(200).json(updated);
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      mensajeError: error.message
    });
  }
};

/* Benjamin Orellana - 2026/04/14 - Elimina lógicamente un medio y recompone la portada si hacía falta. */
export const ER_StudentGalleryMedia_CTS = async (req, res) => {
  const transaction = await db.transaction();

  try {
    const { id } = req.params;

    const row = await StudentGalleryMediaModel.findByPk(id, { transaction });

    if (!row) {
      await transaction.rollback();
      return res.status(404).json({
        mensajeError: 'Archivo multimedia no encontrado.'
      });
    }

    const postId = row.post_id;
    const eraPortada = !!row.es_portada;

    await row.update(
      {
        estado: 'eliminado',
        es_portada: false
      },
      { transaction }
    );

    /* Benjamin Orellana - 2026/04/14 - Al eliminar un medio también se elimina su archivo físico local para no dejar basura en disco. */
    await removeStudentGalleryPhysicalFile(row.archivo_url);

    if (row.thumbnail_url && row.thumbnail_url !== row.archivo_url) {
      await removeStudentGalleryPhysicalFile(row.thumbnail_url);
    }

    if (eraPortada) {
      const nuevaPortada = await StudentGalleryMediaModel.findOne({
        where: {
          post_id: postId,
          estado: 'activo'
        },
        order: [
          ['orden', 'ASC'],
          ['id', 'ASC']
        ],
        transaction
      });

      if (nuevaPortada) {
        await nuevaPortada.update({ es_portada: true }, { transaction });
      }
    }

    await transaction.commit();

    return res.status(200).json({
      ok: true,
      mensaje: 'Archivo multimedia eliminado correctamente.'
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      mensajeError: error.message
    });
  }
};

/* Benjamin Orellana - 2026/04/14 - Recibe un archivo físico de galería y devuelve su URL pública para luego registrarlo en student_gallery_media. */
export const UPLOAD_StudentGalleryMediaFile_CTS = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        mensajeError: 'No se recibió ningún archivo.'
      });
    }

    const archivo_url = `${req.protocol}://${req.get('host')}/student-gallery-files/${req.file.filename}`;

    return res.status(201).json({
      ok: true,
      archivo_url,
      thumbnail_url: null,
      archivo_nombre_original: req.file.originalname,
      mime_type: req.file.mimetype,
      peso_bytes: req.file.size
    });
  } catch (error) {
    return res.status(500).json({
      mensajeError: error.message
    });
  }
};