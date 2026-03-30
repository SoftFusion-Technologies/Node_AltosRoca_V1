/*
 * Programador: Benjamin Orellana
 * Fecha Cración: 23 /05 / 202
 * Versión: 1.1
 *
 * Descripción:
 * Este archivo (CTS_TB_Users.js) contiene controladores para manejar operaciones CRUD
 * sobre el modelo Sequelize de users, incorporando compatibilidad con rol, sede_id
 * y asociación con la tabla Sedes.
 *
 * Tema: Controladores - Users
 *
 * Capa: Backend
 *
 * Nomenclatura: OBR_ obtenerRegistro
 *               OBRS_obtenerRegistros(plural)
 *               CR_ crearRegistro
 *               ER_ eliminarRegistro
 */

// ----------------------------------------------------------------
// Controladores para operaciones CRUD en la tabla Users
// ----------------------------------------------------------------

import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';

// Importa los modelos necesarios desde el archivo
import UsersModel from '../Models/MD_TB_Users.js';
import SedesModel from '../Models/MD_TB_Sedes.js';

const SALT_ROUNDS = 10;

const includeSede = [
  {
    model: SedesModel,
    as: 'sedeRelacion',
    required: false
  }
];

const atributosSinSensibles = {
  exclude: ['password', 'remember_token']
};

// Benjamin Orellana - 29 / 03 / 2026 - Normaliza compatibilidad entre level y rol para no romper front ni lógica existente
const normalizarPayloadUsuario = (body = {}) => {
  const payload = { ...body };

  if (payload.rol && !payload.level) {
    payload.level = payload.rol;
  }

  if (payload.level && !payload.rol) {
    payload.rol = payload.level;
  }

  if (typeof payload.rol === 'string') {
    payload.rol = payload.rol.trim().toLowerCase();
  }

  if (typeof payload.level === 'string') {
    payload.level = payload.level.trim().toLowerCase();
  }

  return payload;
};

// Benjamin Orellana - 29 / 03 / 2026 - Arma filtros dinámicos por sede, sede_id, rol y level
const construirWhereUsuarios = (query = {}) => {
  const { sede, sede_id, rol, level, q } = query;
  const whereClause = {};

  if (sede) {
    whereClause.sede = sede;
  }

  if (sede_id) {
    whereClause.sede_id = sede_id;
  }

  if (rol) {
    whereClause.rol = rol;
  }

  if (level) {
    whereClause.level = level;
  }

  if (q) {
    whereClause[Op.or] = [
      { name: { [Op.like]: `%${q}%` } },
      { email: { [Op.like]: `%${q}%` } },
      { sede: { [Op.like]: `%${q}%` } }
    ];
  }

  return whereClause;
};

// Mostrar todos los registros de UsersModel o filtrar por sede / sede_id / rol / level
export const OBRS_Users_CTS = async (req, res) => {
  try {
    const whereClause = construirWhereUsuarios(req.query);

    const registros = await UsersModel.findAll({
      where: whereClause,
      include: includeSede,
      attributes: atributosSinSensibles,
      order: [['id', 'DESC']]
    });

    res.json(registros);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ mensajeError: 'Error al obtener usuarios' });
  }
};

// Mostrar solo usuarios con nivel de instructor
export const OBRS_Instructores_CTS = async (req, res) => {
  try {
    const registros = await UsersModel.findAll({
      where: {
        [Op.or]: [{ level: 'instructor' }, { rol: 'instructor' }]
      },
      include: includeSede,
      attributes: atributosSinSensibles,
      order: [['id', 'DESC']]
    });

    res.json(registros);
  } catch (error) {
    console.error('Error al obtener instructores:', error);
    res.status(500).json({ mensajeError: 'Error al obtener instructores' });
  }
};

// Mostrar un registro específico de UsersModel por su ID
export const OBR_Users_CTS = async (req, res) => {
  try {
    const registro = await UsersModel.findByPk(req.params.id, {
      include: includeSede,
      attributes: atributosSinSensibles
    });

    if (!registro) {
      return res.status(404).json({ mensajeError: 'Registro no encontrado' });
    }

    res.json(registro);
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Crear un nuevo registro en UsersModel
export const CR_Users_CTS = async (req, res) => {
  try {
    const payload = normalizarPayloadUsuario(req.body);

    // Benjamin Orellana - 29 / 03 / 2026 - Se hashea la contraseña al crear el usuario si viene informada
    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, SALT_ROUNDS);
    }

    const registro = await UsersModel.create(payload);

    const registroCreado = await UsersModel.findByPk(registro.id, {
      include: includeSede,
      attributes: atributosSinSensibles
    });

    res.json({
      message: 'Registro creado correctamente',
      registro: registroCreado
    });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Eliminar un registro en UsersModel por su ID
export const ER_Users_CTS = async (req, res) => {
  try {
    const eliminado = await UsersModel.destroy({
      where: { id: req.params.id }
    });

    if (!eliminado) {
      return res.status(404).json({ mensajeError: 'Registro no encontrado' });
    }

    res.json({ message: 'Registro eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Actualizar un registro en Users por su ID
export const UR_Users_CTS = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = normalizarPayloadUsuario(req.body);

    // Benjamin Orellana - 29 / 03 / 2026 - Solo se hashea password cuando el cliente envía una nueva contraseña
    if (Object.prototype.hasOwnProperty.call(payload, 'password')) {
      if (payload.password && String(payload.password).trim() !== '') {
        payload.password = await bcrypt.hash(payload.password, SALT_ROUNDS);
      } else {
        delete payload.password;
      }
    }

    const [numRowsUpdated] = await UsersModel.update(payload, {
      where: { id }
    });

    if (numRowsUpdated === 1) {
      const registroActualizado = await UsersModel.findByPk(id, {
        include: includeSede,
        attributes: atributosSinSensibles
      });

      res.json({
        message: 'Registro actualizado correctamente',
        registroActualizado
      });
    } else {
      res.status(404).json({ mensajeError: 'Registro no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};
