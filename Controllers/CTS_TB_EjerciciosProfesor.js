/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 07/08/2025
 * Versión: 1.0
 *
 * Descripción:
 * Controlador Sequelize para la tabla ejercicios_profesor.
 * Incluye funciones CRUD, búsqueda, y manejo de duplicados por profesor+nombre.
 * Tema: Controladores - EjerciciosProfesor
 * Capa: Backend
 */

import EjerciciosProfesorModel from '../Models/MD_TB_EjerciciosProfesor.js';
import UsersModel from '../Models/MD_TB_Users.js';
// Obtener todos los ejercicios de un profesor, opcionalmente filtrando por nombre
export const OBRS_EjerciciosProfesor_CTS = async (req, res) => {
  try {
    const { profesor_id, filtro } = req.query;

    const where = {};

    // Filtrado opcional por profesor
    if (profesor_id) {
      where.profesor_id = profesor_id;
    }

    // Filtrado opcional por nombre
    if (filtro && filtro.trim()) {
      where.nombre = { [Op.like]: `%${filtro.trim()}%` };
    }

    const ejercicios = await EjerciciosProfesorModel.findAll({
      where,
      include: [
        {
          model: UsersModel,
          as: 'profesor',
          attributes: ['id', 'name'] // O agregá 'email' si querés más info
        }
      ],
      order: [['nombre', 'ASC']]
    });

    res.json(ejercicios);
  } catch (error) {
    console.error('Error al obtener ejercicios:', error);
    res.status(500).json({ mensajeError: 'Error al obtener ejercicios' });
  }
};

// Obtener un ejercicio por ID
export const OBR_EjercicioProfesor_CTS = async (req, res) => {
  try {
    const ejercicio = await EjerciciosProfesorModel.findByPk(req.params.id, {
      include: [
        {
          model: UsersModel,
          as: 'profesor',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!ejercicio) {
      return res.status(404).json({ mensajeError: 'Ejercicio no encontrado' });
    }

    res.json(ejercicio);
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};


// Crear un nuevo ejercicio (evita duplicados por profesor_id + nombre)
export const CR_EjercicioProfesor_CTS = async (req, res) => {
  try {
    const { profesor_id, nombre } = req.body;
    if (!profesor_id || !nombre) {
      return res
        .status(400)
        .json({ mensajeError: 'profesor_id y nombre requeridos' });
    }

    // Evitar duplicados (puedes usar findOrCreate si preferís)
    const existente = await EjerciciosProfesorModel.findOne({
      where: { profesor_id, nombre }
    });

    if (existente) {
      return res
        .status(409)
        .json({ mensajeError: 'Ejercicio ya existe para este profesor' });
    }

    const nuevo = await EjerciciosProfesorModel.create({ profesor_id, nombre });
    res.status(201).json({
      message: 'Ejercicio creado correctamente',
      id: nuevo.id,
      ejercicio: nuevo
    });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Actualizar un ejercicio (por id)
export const UR_EjercicioProfesor_CTS = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({ mensajeError: 'Nombre requerido' });
    }

    // Buscar ejercicio
    const ejercicio = await EjerciciosProfesorModel.findByPk(id);
    if (!ejercicio) {
      return res.status(404).json({ mensajeError: 'Ejercicio no encontrado' });
    }

    // Evitar que renombren a uno que ya existe
    const existente = await EjerciciosProfesorModel.findOne({
      where: {
        profesor_id: ejercicio.profesor_id,
        nombre,
        id: { $ne: id }
      }
    });

    if (existente) {
      return res
        .status(409)
        .json({ mensajeError: 'Ya existe otro ejercicio con ese nombre' });
    }

    ejercicio.nombre = nombre;
    await ejercicio.save();

    res.json({ message: 'Ejercicio actualizado', ejercicio });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Eliminar un ejercicio (por id)
export const ER_EjercicioProfesor_CTS = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await EjerciciosProfesorModel.destroy({
      where: { id }
    });

    if (!deleted) {
      return res.status(404).json({ mensajeError: 'Ejercicio no encontrado' });
    }

    res.json({ message: 'Ejercicio eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};
