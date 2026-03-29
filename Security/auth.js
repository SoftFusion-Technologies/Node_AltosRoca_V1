import jwt from 'jsonwebtoken';
import db from '../DataBase/db.js';

// Función de login
export const login = async (req, res) => {
  const { email, password } = req.body;

  const sql =
    'SELECT * FROM users WHERE email = :email AND password = :password';

  try {
    const [results] = await db.query(sql, {
      replacements: { email, password }
    });

    if (results.length > 0) {
      const user = results[0];

      const token = jwt.sign({ id: user.id, level: user.level }, 'softfusion', {
        expiresIn: '1h'
      });

      return res.json({
        message: 'Success',
        token,
        id: user.id,
        nombre: user.name,
        email: user.email,
        rol: user.level,
        local_id: null,
        es_reemplazante: false
      });
    } else {
      return res.status(401).json({
        message: 'Fail',
        error: 'Usuario o contraseña incorrectos'
      });
    }
  } catch (err) {
    console.log('Error executing query', err);
    return res.status(500).json({
      message: 'Error',
      error: 'Error del servidor'
    });
  }
};

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, 'softfusion', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

export const loginAlumno = async (req, res) => {
  const { telefono, dni } = req.body;

  const sql = `
    SELECT * FROM students
    WHERE telefono = :telefono AND dni = :dni
  `;

  try {
    const [results] = await db.query(sql, {
      replacements: { telefono, dni }
    });

    if (results.length > 0) {
      const students = results[0];
      const token = jwt.sign(
        { id: students.id, nomyape: students.nomyape },
        'softfusion',
        {
          expiresIn: '1h'
        }
      );
      return res.json({
        message: 'Success',
        token,
        nomyape: students.nomyape,
        id: students.id
      });
    } else {
      return res.json('Fail');
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error del servidor' });
  }
};

export const login_profesores_pilates = async (req, res) => {
  const { email, password } = req.body;

  const sql =
    'SELECT * FROM usuarios_pilates WHERE email = :email AND password = :password';
  try {
    const [results, metadata] = await db.query(sql, {
      replacements: { email: email, password: password }
    });
    if (results.length > 0) {
      const user = results[0];
      const token = jwt.sign({ id: user.id, level: user.rol}, 'softfusion', {
        expiresIn: '1h'
      });
      return res.json({ message: 'Success', token, level: user.rol});
    } else {
      return res.json('Fail');
    }
  } catch (err) {
    console.log('Error executing query', err);
    return res.json('Error');
  }
};

export const authenticateStudent = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, 'softfusion', (err, student) => {
    if (err) return res.sendStatus(403);
    req.student = student;
    next();
  });
};
