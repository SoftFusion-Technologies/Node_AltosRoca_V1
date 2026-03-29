/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 07/08/2025
 * Versión: 1.0
 *
 * Descripción:
 * Controlador Sequelize para la tabla bloques_ejercicio.
 * Incluye funciones CRUD, listados por ejercicio y validación de existencia.
 * Tema: Controladores - BloquesEjercicio
 * Capa: Backend
 */

import BloquesEjercicioModel from '../Models/MD_TB_BloquesEjercicio.js';
import EjerciciosProfesorModel from '../Models/MD_TB_EjerciciosProfesor.js';
import { Op } from 'sequelize';

// Obtener todos los bloques de un ejercicio
export const OBRS_BloquesEjercicio_CTS = async (req, res) => {
  try {
    const { ejercicio_id } = req.params;

    const bloques = await BloquesEjercicioModel.findAll({
      where: { ejercicio_id },
      order: [['creado_en', 'ASC']]
    });

    res.json(bloques);
  } catch (error) {
    console.error('Error al obtener bloques:', error);
    res
      .status(500)
      .json({ mensajeError: 'Error al obtener bloques del ejercicio' });
  }
};

// Obtener un bloque por ID
export const OBR_BloqueEjercicio_CTS = async (req, res) => {
  try {
    const bloque = await BloquesEjercicioModel.findByPk(req.params.id);

    if (!bloque) {
      return res.status(404).json({ mensajeError: 'Bloque no encontrado' });
    }

    res.json(bloque);
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Crear un nuevo bloque dentro de un ejercicio
export const CR_BloqueEjercicio_CTS = async (req, res) => {
  try {
    const { ejercicio_id } = req.params;
    const { contenido } = req.body;

    if (!contenido || !contenido.trim()) {
      return res.status(400).json({ mensajeError: 'Contenido requerido' });
    }

    // Validar existencia del ejercicio
    const ejercicio = await EjerciciosProfesorModel.findByPk(ejercicio_id);
    if (!ejercicio) {
      return res.status(404).json({ mensajeError: 'Ejercicio no encontrado' });
    }

    const nuevo = await BloquesEjercicioModel.create({
      ejercicio_id,
      contenido
    });

    res.status(201).json({
      message: 'Bloque creado correctamente',
      id: nuevo.id,
      bloque: nuevo
    });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Actualizar un bloque existente
export const UR_BloqueEjercicio_CTS = async (req, res) => {
  try {
    const { id } = req.params;
    const { contenido } = req.body;

    if (!contenido || !contenido.trim()) {
      return res.status(400).json({ mensajeError: 'Contenido requerido' });
    }

    const bloque = await BloquesEjercicioModel.findByPk(id);
    if (!bloque) {
      return res.status(404).json({ mensajeError: 'Bloque no encontrado' });
    }

    bloque.contenido = contenido;
    await bloque.save();

    res.json({ message: 'Bloque actualizado correctamente', bloque });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Eliminar un bloque por ID
export const ER_BloqueEjercicio_CTS = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await BloquesEjercicioModel.destroy({
      where: { id }
    });

    if (!deleted) {
      return res.status(404).json({ mensajeError: 'Bloque no encontrado' });
    }

    res.json({ message: 'Bloque eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};
