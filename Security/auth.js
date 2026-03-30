/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 29 / 03 / 2026
 * Versión: 1.1
 *
 * Descripción:
 * Este archivo contiene la lógica de autenticación de usuarios, alumnos y profesores de pilates.
 * Se actualiza el login principal para usar bcrypt, devolver los datos del usuario sin exponer
 * la contraseña y firmar JWT con información ampliada del perfil autenticado.
 *
 * Tema: Auth - Login y autenticación
 *
 * Capa: Backend
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../DataBase/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'softfusion';

const quitarCamposSensiblesUsuario = (user) => {
  if (!user) return null;

  const { password, remember_token, ...userSinPassword } = user;

  return userSinPassword;
};

// Benjamin Orellana - 29 / 03 / 2026 - Login de usuarios con bcrypt y respuesta completa sin exponer password
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      ok: false,
      message: 'Fail',
      error: 'Email y contraseña son obligatorios',
      mensajeError: 'Email y contraseña son obligatorios'
    });
  }

  const sql = `
    SELECT 
      u.*,
      s.id AS sede_rel_id,
      s.nombre AS sede_nombre,
      s.codigo AS sede_codigo,
      s.direccion AS sede_direccion,
      s.ciudad AS sede_ciudad,
      s.provincia AS sede_provincia,
      s.telefono AS sede_telefono,
      s.email AS sede_email,
      s.responsable_nombre AS sede_responsable_nombre,
      s.responsable_dni AS sede_responsable_dni,
      s.horario_apertura AS sede_horario_apertura,
      s.horario_cierre AS sede_horario_cierre,
      s.estado AS sede_estado
    FROM users u
    LEFT JOIN Sedes s ON s.id = u.sede_id
    WHERE u.email = :email
    LIMIT 1
  `;

  try {
    const [results] = await db.query(sql, {
      replacements: { email }
    });

    if (!results || results.length === 0) {
      return res.status(401).json({
        ok: false,
        message: 'Fail',
        error: 'Usuario o contraseña incorrectos',
        mensajeError: 'Usuario o contraseña incorrectos'
      });
    }

    const user = results[0];

    if (!user.password) {
      return res.status(500).json({
        ok: false,
        message: 'Error',
        error: 'El usuario no tiene contraseña configurada',
        mensajeError: 'El usuario no tiene contraseña configurada'
      });
    }

    const passwordOk = await bcrypt.compare(password, user.password);

    if (!passwordOk) {
      return res.status(401).json({
        ok: false,
        message: 'Fail',
        error: 'Usuario o contraseña incorrectos',
        mensajeError: 'Usuario o contraseña incorrectos'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        level: user.level,
        rol: user.rol,
        sede_id: user.sede_id,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    const userResponse = quitarCamposSensiblesUsuario(user);

    return res.json({
      ok: true,
      message: 'Success',
      token,
      user: {
        ...userResponse,
        sede_relacion: user.sede_rel_id
          ? {
              id: user.sede_rel_id,
              nombre: user.sede_nombre,
              codigo: user.sede_codigo,
              direccion: user.sede_direccion,
              ciudad: user.sede_ciudad,
              provincia: user.sede_provincia,
              telefono: user.sede_telefono,
              email: user.sede_email,
              responsable_nombre: user.sede_responsable_nombre,
              responsable_dni: user.sede_responsable_dni,
              horario_apertura: user.sede_horario_apertura,
              horario_cierre: user.sede_horario_cierre,
              estado: user.sede_estado
            }
          : null
      },

      // Compatibilidad con frontend viejo
      id: user.id,
      nombre: user.name,
      email: user.email,
      rol: user.rol,
      level: user.level,
      sede: user.sede,
      sede_id: user.sede_id,
      local_id: null,
      es_reemplazante: false
    });
  } catch (err) {
    console.log('Error executing query', err);
    return res.status(500).json({
      ok: false,
      message: 'Error',
      error: 'Error del servidor',
      mensajeError: err.message || 'Error del servidor'
    });
  }
};

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      ok: false,
      message: 'Token requerido',
      mensajeError: 'No se envió token de autenticación'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        ok: false,
        message: 'Token inválido o vencido',
        mensajeError: 'Token inválido o vencido'
      });
    }

    req.user = user;
    next();
  });
};

export const loginAlumno = async (req, res) => {
  const { telefono, dni } = req.body;

  const sql = `
    SELECT * FROM students
    WHERE telefono = :telefono AND dni = :dni
    LIMIT 1
  `;

  try {
    const [results] = await db.query(sql, {
      replacements: { telefono, dni }
    });

    if (results.length > 0) {
      const students = results[0];

      const token = jwt.sign(
        { id: students.id, nomyape: students.nomyape },
        JWT_SECRET,
        {
          expiresIn: '8h'
        }
      );

      return res.json({
        ok: true,
        message: 'Success',
        token,
        nomyape: students.nomyape,
        id: students.id
      });
    } else {
      return res.status(401).json({
        ok: false,
        message: 'Fail',
        error: 'Teléfono o DNI incorrectos',
        mensajeError: 'Teléfono o DNI incorrectos'
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      ok: false,
      message: 'Error del servidor',
      mensajeError: err.message || 'Error del servidor'
    });
  }
};

// Benjamin Orellana - 29 / 03 / 2026 - Login de profesores de pilates usando bcrypt para evitar validación de password en SQL plano
export const login_profesores_pilates = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      ok: false,
      message: 'Fail',
      error: 'Email y contraseña son obligatorios',
      mensajeError: 'Email y contraseña son obligatorios'
    });
  }

  const sql = `
    SELECT *
    FROM usuarios_pilates
    WHERE email = :email
    LIMIT 1
  `;

  try {
    const [results] = await db.query(sql, {
      replacements: { email }
    });

    if (!results || results.length === 0) {
      return res.status(401).json({
        ok: false,
        message: 'Fail',
        error: 'Usuario o contraseña incorrectos',
        mensajeError: 'Usuario o contraseña incorrectos'
      });
    }

    const user = results[0];

    const passwordOk = await bcrypt.compare(password, user.password);

    if (!passwordOk) {
      return res.status(401).json({
        ok: false,
        message: 'Fail',
        error: 'Usuario o contraseña incorrectos',
        mensajeError: 'Usuario o contraseña incorrectos'
      });
    }

    const token = jwt.sign(
      { id: user.id, level: user.rol, rol: user.rol, email: user.email },
      JWT_SECRET,
      {
        expiresIn: '8h'
      }
    );

    return res.json({
      ok: true,
      message: 'Success',
      token,
      level: user.rol,
      rol: user.rol,
      user: {
        ...user,
        password: undefined
      }
    });
  } catch (err) {
    console.log('Error executing query', err);
    return res.status(500).json({
      ok: false,
      message: 'Error',
      error: 'Error del servidor',
      mensajeError: err.message || 'Error del servidor'
    });
  }
};

export const authenticateStudent = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      ok: false,
      message: 'Token requerido',
      mensajeError: 'No se envió token de autenticación'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, student) => {
    if (err) {
      return res.status(403).json({
        ok: false,
        message: 'Token inválido o vencido',
        mensajeError: 'Token inválido o vencido'
      });
    }

    req.student = student;
    next();
  });
};
