/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 21 / 06 / 2025
 * Versión: 1.1
 *
 * Descripción:
 * Este archivo (CTS_TB_Sedes.js) contiene controladores para manejar operaciones CRUD sobre la tabla de Sedes.
 *
 * Tema: Controladores - Sedes
 *
 * Capa: Backend
 *
 * Nomenclatura:
 *   OBR_  obtenerRegistro
 *   OBRS_ obtenerRegistros
 *   CR_   crearRegistro
 *   ER_   eliminarRegistro
 *   UR_   actualizarRegistro
 */

// Importar el modelo
import SedesModel from '../../Models/Core/MD_TB_Sedes.js';
import { Op } from 'sequelize';

// Obtener todos los Sedes
export const OBRS_Sedes_CTS = async (req, res) => {
  try {
    const { page, limit, q, orderBy, orderDir } = req.query || {};

    // Benjamin Orellana - 30 / 03 / 2026 - Se corrige el import del modelo y se mantiene retrocompatibilidad del listado plano
    const hasParams =
      Object.prototype.hasOwnProperty.call(req.query || {}, 'page') ||
      Object.prototype.hasOwnProperty.call(req.query || {}, 'limit') ||
      Object.prototype.hasOwnProperty.call(req.query || {}, 'q') ||
      Object.prototype.hasOwnProperty.call(req.query || {}, 'orderBy') ||
      Object.prototype.hasOwnProperty.call(req.query || {}, 'orderDir');

    if (!hasParams) {
      const sedes = await SedesModel.findAll({
        order: [['id', 'ASC']]
      });
      return res.json(sedes);
    }

    const pageNum = Math.max(parseInt(page || '1', 10), 1);
    const limitNum = Math.min(Math.max(parseInt(limit || '20', 10), 1), 100);
    const offset = (pageNum - 1) * limitNum;

    const where = {};
    if (q && q.trim() !== '') {
      const like = { [Op.like]: `%${q.trim()}%` };
      where[Op.or] = [
        { nombre: like },
        { codigo: like },
        { ciudad: like },
        { provincia: like },
        { direccion: like },
        { telefono: like },
        { email: like },
        { responsable_nombre: like },
        { responsable_dni: like }
      ];
    }

    const validColumns = [
      'id',
      'nombre',
      'codigo',
      'ciudad',
      'provincia',
      'creado_en',
      'actualizado_en',
      'estado'
    ];

    const col = validColumns.includes(orderBy || '') ? orderBy : 'id';
    const dir = ['ASC', 'DESC'].includes(String(orderDir || '').toUpperCase())
      ? String(orderDir).toUpperCase()
      : 'ASC';

    const { rows, count } = await SedesModel.findAndCountAll({
      where,
      order: [[col, dir]],
      limit: limitNum,
      offset
    });

    const totalPages = Math.max(Math.ceil(count / limitNum), 1);

    return res.json({
      data: rows,
      meta: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
        orderBy: col,
        orderDir: dir,
        q: q || ''
      }
    });
  } catch (error) {
    console.error('Error al obtener sedes:', error);
    return res.status(500).json({ mensajeError: error.message });
  }
};

// Obtener un solo Sede por ID
export const OBR_Sede_CTS = async (req, res) => {
  try {
    const sede = await SedesModel.findByPk(req.params.id);

    if (!sede) {
      return res.status(404).json({ mensajeError: 'Sede no encontrado' });
    }

    return res.json(sede);
  } catch (error) {
    console.error('Error al obtener sede:', error);
    return res.status(500).json({ mensajeError: error.message });
  }
};

// Crear un nuevo Sede
export const CR_Sede_CTS = async (req, res) => {
  try {
    const {
      nombre,
      codigo,
      direccion,
      ciudad,
      provincia,
      telefono,
      email,
      responsable_nombre,
      responsable_dni,
      horario_apertura,
      horario_cierre,
      estado
    } = req.body;

    const nuevo = await SedesModel.create({
      nombre,
      codigo,
      direccion,
      ciudad,
      provincia,
      telefono,
      email,
      responsable_nombre,
      responsable_dni,
      horario_apertura,
      horario_cierre,
      estado
    });

    return res.json({
      message: 'Sede creado correctamente',
      Sede: nuevo
    });
  } catch (error) {
    console.error('Error al crear sede:', error);
    return res.status(500).json({ mensajeError: error.message });
  }
};

// Eliminar un Sede
export const ER_Sede_CTS = async (req, res) => {
  try {
    const sede = await SedesModel.findByPk(req.params.id);

    if (!sede) {
      return res.status(404).json({ mensajeError: 'Sede no encontrado' });
    }

    await SedesModel.destroy({ where: { id: req.params.id } });

    return res.json({ message: 'Sede eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar sede:', error);
    return res.status(500).json({ mensajeError: error.message });
  }
};

// Actualizar un Sede
export const UR_Sede_CTS = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      nombre,
      codigo,
      direccion,
      ciudad,
      provincia,
      telefono,
      email,
      responsable_nombre,
      responsable_dni,
      horario_apertura,
      horario_cierre,
      estado
    } = req.body;

    const [updated] = await SedesModel.update(
      {
        nombre,
        codigo,
        direccion,
        ciudad,
        provincia,
        telefono,
        email,
        responsable_nombre,
        responsable_dni,
        horario_apertura,
        horario_cierre,
        estado
      },
      { where: { id } }
    );

    if (!updated) {
      return res.status(404).json({ mensajeError: 'Sede no encontrado' });
    }

    const actualizado = await SedesModel.findByPk(id);

    return res.json({
      message: 'Sede actualizado correctamente',
      Sede: actualizado
    });
  } catch (error) {
    console.error('Error al actualizar sede:', error);
    return res.status(500).json({ mensajeError: error.message });
  }
};