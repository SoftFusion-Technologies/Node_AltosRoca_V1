/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 05 /08 / 2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (CTS_TB_StudentsPendientes.js) contiene controladores para manejar operaciones CRUD en el modelo Sequelize de students_pendientes.
 *
 * Tema: Controladores - Students Pendientes
 *
 * Capa: Backend
 *
 * Nomenclatura: OBR_ obtenerRegistro
 *               OBRS_obtenerRegistros(plural)
 *               CR_ crearRegistro
 *               ER_ eliminarRegistro
 */

// Importa el modelo de students_pendientes
import StudentsPendientesModel from '../Models/MD_TB_StudentsPendientes.js';

// Mostrar todos los registros de StudentsPendientesModel o filtrar por estado
export const OBRS_StudentsPendientes_CTS = async (req, res) => {
  try {
    const { estado } = req.query;
    const whereClause = estado ? { estado } : {};
    const registros = await StudentsPendientesModel.findAll({
      where: whereClause
    });
    res.json(registros);
  } catch (error) {
    console.error('Error al obtener alumnos pendientes:', error);
    res
      .status(500)
      .json({ mensajeError: 'Error al obtener alumnos pendientes' });
  }
};

// Mostrar un registro específico de StudentsPendientesModel por su ID
export const OBR_StudentsPendientes_CTS = async (req, res) => {
  try {
    const registro = await StudentsPendientesModel.findByPk(req.params.id);
    if (registro) {
      res.json(registro);
    } else {
      res.status(404).json({ mensajeError: 'Alumno pendiente no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Crear un nuevo registro en StudentsPendientesModel
export const CR_StudentsPendientes_CTS = async (req, res) => {
  try {
    const registro = await StudentsPendientesModel.create(req.body);
    res.json({ message: 'Alumno pendiente creado correctamente', registro });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Eliminar un registro en StudentsPendientesModel por su ID
export const ER_StudentsPendientes_CTS = async (req, res) => {
  try {
    const deletedCount = await StudentsPendientesModel.destroy({
      where: { id: req.params.id }
    });
    if (deletedCount === 1) {
      res.json({ message: 'Alumno pendiente eliminado correctamente' });
    } else {
      res.status(404).json({ mensajeError: 'Alumno pendiente no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Actualizar un registro en StudentsPendientesModel por su ID
export const UR_StudentsPendientes_CTS = async (req, res) => {
  try {
    const { id } = req.params;
    const [numRowsUpdated] = await StudentsPendientesModel.update(req.body, {
      where: { id }
    });

    if (numRowsUpdated === 1) {
      const registroActualizado = await StudentsPendientesModel.findByPk(id);
      res.json({
        message: 'Alumno pendiente actualizado correctamente',
        registroActualizado
      });
    } else {
      res.status(404).json({ mensajeError: 'Alumno pendiente no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Migrar un alumno pendiente a la tabla definitiva 'students'
import StudentsModel from '../Models/MD_TB_Students.js'; // Asegurate de importar el modelo

export const MIGRAR_AlumnoPendiente_CTS = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body; // <-- obtenés el id del profesor asignado enviado desde el front

    if (!user_id) {
      return res
        .status(400)
        .json({ mensajeError: 'Debe asignar un profesor (user_id)' });
    }

    // Buscar alumno pendiente
    const alumnoPendiente = await StudentsPendientesModel.findByPk(id);
    if (!alumnoPendiente) {
      return res
        .status(404)
        .json({ mensajeError: 'Alumno pendiente no encontrado' });
    }

    // Crear en students usando el user_id recibido
    const nuevoAlumno = await StudentsModel.create({
      user_id: user_id, // <-- asignar el profesor
      nomyape: alumnoPendiente.nomyape,
      telefono: alumnoPendiente.telefono,
      dni: alumnoPendiente.dni,
      objetivo: alumnoPendiente.objetivo,
      created_at: new Date(),
      updated_at: new Date()
    });

    // Eliminar de students_pendientes
    await StudentsPendientesModel.destroy({ where: { id } });

    res.json({
      message: 'Alumno migrado correctamente a students',
      alumnoMigrado: nuevoAlumno
    });
  } catch (error) {
    console.error('Error al migrar alumno:', error);
    res.status(500).json({ mensajeError: 'Error al migrar alumno' });
  }
};
