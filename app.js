import express from 'express';
import cors from 'cors';
// El Intercambio de Recursos de Origen Cruzado (CORS (en-US))
// es un mecanismo que utiliza cabeceras HTTP adicionales para permitir que un user agent (en-US)
// obtenga permiso para acceder a recursos seleccionados desde un servidor, en un origen distinto (dominio) al que pertenece.

// importamos la conexion de la base de datos
import db from './DataBase/db.js';
import GetRoutes from './Routes/routes.js';
import dotenv from 'dotenv';

import cron from 'node-cron';

import {
  login,
  authenticateToken,
  loginAlumno,
  authenticateStudent,
  login_profesores_pilates,
} from './Security/auth.js'; // Importa las funciones del archivo auth.js
import { crearAsistenciasDiariasAusentes } from './Controllers/CTS_TB_AsistenciasPilates.js';
import { PORT } from './DataBase/config.js';
import mysql from 'mysql2/promise'; // Usar mysql2 para las promesas

import DietsModel from './Models/Diets/MD_TB_Diets.js';
import MealsModel from './Models/Diets/MD_TB_Meals.js';
import MealItemsModel from './Models/Diets/MD_TB_MealItems.js';

import './Models/associations.js';
import './Models/Rutinas_V2/relaciones.js';
// Benjamin Orellana - 2026/04/13 - Importa el inicializador de relaciones del módulo Empresas / Alianzas.
import initEmpresasRelaciones from './Models/Empresas/relaciones_empresas.js';

// Benjamin Orellana - 2026/04/13 - Inicializa relaciones Sequelize del módulo Empresas / Alianzas.
initEmpresasRelaciones();
// CONFIGURACION PRODUCCION
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// const PORT = process.env.PORT || 3000;

// console.log(process.env.PORT)

const app = express();
app.use(cors()); // aca configuramos cors para no tener errores
app.use(express.json());
app.use('/', GetRoutes);
// definimos la conexion

// Para verificar si nuestra conexión funciona, lo hacemos con el método authenticate()
//  el cual nos devuelve una promesa que funciona de la siguiente manera:
// un try y un catch para captar cualquier tipo de errores
try {
  db.authenticate();
  console.log('Conexion con la db establecida');
} catch (error) {
  console.log(`El error de la conexion es : ${error}`);
}

const pool = mysql.createPool({
  host: 'localhost', // Configurar según tu base de datos
  user: 'root', // Configurar según tu base de datos
  password: '123456', // Configurar según tu base de datos
  database: 'DB_AltosRocaDESA_29032026'
});

// Ruta de login
app.post('/login', login);

// Ruta protegida
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Esto es una ruta protegida' });
});

// 🔐 Ruta de login para alumnos
app.post('/loginAlumno', loginAlumno);

// Ruta para profesores de pilates
app.post('/login_profesores', login_profesores_pilates);

// ✅ Ruta protegida (requiere token)
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Esto es una ruta protegida', user: req.user });
});

app.get('/', (req, res) => {
  if (req.url == '/') {
    res.send(
      'si en la URL pone /jobs,/ask,/postulantes... vera los registros en formato JSON'
    ); // este hola mundo se mostrara en el puerto 5000 y en la raiz principal
  } else if (req.url != '/') {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('404 ERROR');
  }
});

/*
 * MODULO ESTADISTICAS INICIO
 */
// Endpoint que devuelve el total de alumnos por profesor
// GET /estadisticas/alumnos-por-profesor
app.get('/estadisticas/alumnos-por-profesor', async (req, res) => {
  try {
    const [result] = await pool.query(
      `SELECT 
         u.id AS profesor_id,
         u.name AS profesor_nombre,
         COUNT(s.id) AS total_alumnos
       FROM students s
       INNER JOIN users u ON s.user_id = u.id
       GROUP BY u.id, u.name
       ORDER BY total_alumnos DESC`
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Error al obtener alumnos por profesor:', error);
    res.status(500).json({ error: 'Error al obtener alumnos por profesor' });
  }
});

// GET /estadisticas/rutinas-por-profesor?mes=5&anio=2025
app.get('/estadisticas/rutinas-por-profesor', async (req, res) => {
  try {
    const { mes, anio } = req.query;

    const [result] = await pool.query(
      `SELECT 
         u.id AS profesor_id,
         u.name AS profesor_nombre,
         COUNT(r.id) AS total_rutinas
       FROM routines r
       INNER JOIN students s ON r.student_id = s.id
       INNER JOIN users u ON s.user_id = u.id
       WHERE r.mes = ? AND r.anio = ?
       GROUP BY u.id, u.name
       ORDER BY total_rutinas DESC`,
      [mes, anio]
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Error al obtener rutinas por profesor:', error);
    res.status(500).json({ error: 'Error al obtener rutinas por profesor' });
  }
});

app.get('/estadisticas/ayudas-por-profesor', async (req, res) => {
  try {
    const query = `
      SELECT
        u.id AS profesor_id,
        u.name AS profesor_nombre,
        COUNT(r.id) AS total_ayudas
      FROM routine_request_stats r
      INNER JOIN users u ON r.instructor_id = u.id
      GROUP BY u.id, u.name
      ORDER BY total_ayudas DESC
    `;

    const [result] = await pool.query(query);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error al obtener ayudas por profesor:', error);
    res.status(500).json({ error: 'Error al obtener ayudas por profesor' });
  }
});

app.get('/estadisticas/feedbacks-por-profesor', async (req, res) => {
  try {
    const { mes, anio } = req.query;

    if (!mes || !anio) {
      return res.status(400).json({
        error: 'Se requieren los parámetros "mes" y "anio"'
      });
    }

    const query = `
      SELECT 
        u.id AS profesor_id,
        u.name AS profesor_nombre,
        COUNT(rf.id) AS total_feedbacks
      FROM routine_feedback rf
      JOIN students s ON rf.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE MONTH(rf.created_at) = ? AND YEAR(rf.created_at) = ?
      GROUP BY u.id, u.name
      ORDER BY total_feedbacks DESC
    `;

    const [result] = await pool.query(query, [mes, anio]);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error al obtener feedbacks por profesor:', error);
    res.status(500).json({ error: 'Error al obtener feedbacks por profesor' });
  }
});

/*
 * MODULO ESTADISTICAS FINAL
 */

/*
 * MODULO ESTADISTICAS ALUMNO INICIAL
 */

app.get('/estadisticas/rutinas-por-alumno', async (req, res) => {
  try {
    const { student_id, mes, anio } = req.query;

    if (!student_id || !mes || !anio) {
      return res.status(400).json({
        error: 'Se requieren los parámetros "student_id", "mes" y "anio"'
      });
    }

    const query = `
      SELECT 
        COUNT(*) AS total_rutinas_cargadas,
        SUM(CASE WHEN completado = TRUE THEN 1 ELSE 0 END) AS total_rutinas_completadas
      FROM routines
      WHERE student_id = ?
        AND MONTH(fecha) = ?
        AND YEAR(fecha) = ?
    `;

    const [result] = await pool.query(query, [student_id, mes, anio]);

    res.status(200).json(result[0]);
  } catch (error) {
    console.error('Error al obtener rutinas por alumno:', error);
    res.status(500).json({ error: 'Error al obtener rutinas por alumno' });
  }
});

// 2. Ranking alumnos más activos (más rutinas completadas) en mes/año
app.get('/estadisticas/ranking-activos', async (req, res) => {
  try {
    const { mes, anio } = req.query;
    if (!mes || !anio)
      return res.status(400).json({ error: 'Faltan parámetros' });

    const query = `
      SELECT s.id AS student_id, s.nomyape, 
        COUNT(r.id) AS rutinas_asignadas,
        SUM(CASE WHEN r.completado = TRUE THEN 1 ELSE 0 END) AS rutinas_completadas
      FROM students s
      LEFT JOIN routines r ON s.id = r.student_id AND r.mes = ? AND r.anio = ?
      GROUP BY s.id
      ORDER BY rutinas_completadas DESC
      LIMIT 10
    `;
    const [results] = await pool.query(query, [mes, anio]);
    res.json(results);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: 'Error al obtener ranking de alumnos activos' });
  }
});

/*
 * MODULO ESTADISTICAS ALUMNO FINAL
 */

app.get('/routine-feedbacks', async (req, res) => {
  try {
    const instructorId = req.query.instructor_id;
    const studentId = req.query.student_id;

    if (!instructorId || !studentId) {
      return res.status(400).json({
        error: 'Se requieren instructor_id y student_id como parámetros'
      });
    }

    const query = `
      SELECT 
        rf.id AS feedback_id,
        rf.gusto,
        rf.dificultad,
        rf.comentario,
        rf.created_at AS feedback_date,
        r.id AS rutina_id,
        r.mes,
        r.anio,
        r.fecha AS rutina_fecha,
        s.nomyape AS alumno,
        s.id AS student_id,
        u.name AS instructor,
        u.id AS instructor_id
      FROM routine_feedback rf
      JOIN routines r ON rf.routine_id = r.id
      JOIN students s ON rf.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE u.id = ? AND s.id = ?
      ORDER BY r.fecha DESC, s.nomyape
    `;

    const [feedbackRows] = await pool.query(query, [instructorId, studentId]);

    const rutinaIds = [...new Set(feedbackRows.map((fb) => fb.rutina_id))];
    if (rutinaIds.length === 0) {
      return res.json([]);
    }

    const [exerciseRows] = await pool.query(
      `SELECT id, routine_id, musculo, descripcion, orden, desde, hasta, created_at, updated_at 
       FROM routine_exercises 
       WHERE routine_id IN (?) ORDER BY routine_id, orden`,
      [rutinaIds]
    );

    const exercisesByRoutine = exerciseRows.reduce((acc, ex) => {
      if (!acc[ex.routine_id]) acc[ex.routine_id] = [];
      acc[ex.routine_id].push(ex);
      return acc;
    }, {});

    const feedbackWithRoutine = feedbackRows.map((fb) => ({
      feedback_id: fb.feedback_id,
      gusto: fb.gusto,
      dificultad: fb.dificultad,
      comentario: fb.comentario,
      feedback_date: fb.feedback_date,
      rutina: {
        id: fb.rutina_id,
        mes: fb.mes,
        anio: fb.anio,
        fecha: fb.rutina_fecha,
        exercises: exercisesByRoutine[fb.rutina_id] || []
      },
      alumno: fb.alumno,
      student_id: fb.student_id,
      instructor: fb.instructor,
      instructor_id: fb.instructor_id
    }));

    res.json(feedbackWithRoutine);
  } catch (error) {
    console.error('Error al obtener feedbacks:', error);
    res.status(500).json({ error: 'Error al obtener feedbacks' });
  }
});

app.get('/students/:studentId/progress', async (req, res) => {
  const { studentId } = req.params;

  try {
    // 1. Objetivos mensuales del alumno
    const [monthlyGoals] = await pool.query(
      `SELECT mes, anio, objetivo, created_at, updated_at
       FROM student_monthly_goals
       WHERE student_id = ? 
       ORDER BY anio DESC, mes DESC`,
      [studentId]
    );

    // 2. Rutinas con ejercicios, feedback y solicitudes, usando el query que pasaste
    const [progressDetails] = await pool.query(
      `SELECT 
          r.id AS rutina_id,
          r.fecha,
          r.mes,
          r.anio,
          rf.gusto,
          rf.dificultad,
          rf.comentario,
          e.id AS ejercicio_id,
          e.musculo,
          e.descripcion,
          e.orden,
          rr.estado AS solicitud_estado,
          rr.mensaje AS solicitud_mensaje
       FROM routines r
       LEFT JOIN routine_feedback rf ON rf.routine_id = r.id AND rf.student_id = r.student_id
       LEFT JOIN routine_exercises e ON e.routine_id = r.id
       LEFT JOIN routine_requests rr ON rr.routine_id = r.id AND rr.student_id = r.student_id AND rr.exercise_id = e.id
       WHERE r.student_id = ?
       ORDER BY r.fecha DESC, e.orden`,
      [studentId]
    );

    // 3. Procesar la info para agrupar por rutina y ejercicios
    const routines = {};
    progressDetails.forEach((row) => {
      if (!routines[row.rutina_id]) {
        routines[row.rutina_id] = {
          rutina_id: row.rutina_id,
          fecha: row.fecha,
          mes: row.mes,
          anio: row.anio,
          feedback: {
            gusto: row.gusto,
            dificultad: row.dificultad,
            comentario: row.comentario
          },
          ejercicios: []
        };
      }
      if (row.ejercicio_id) {
        routines[row.rutina_id].ejercicios.push({
          ejercicio_id: row.ejercicio_id,
          musculo: row.musculo,
          descripcion: row.descripcion,
          orden: row.orden,
          solicitud: {
            estado: row.solicitud_estado,
            mensaje: row.solicitud_mensaje
          }
        });
      }
    });

    res.json({
      studentId,
      monthlyGoals,
      routines: Object.values(routines)
    });
  } catch (error) {
    console.error('Error fetching student progress:', error);
    res.status(500).json({ error: 'Error al obtener progreso del alumno' });
  }
});

function detectarTipoObjetivo(objetivoTexto) {
  const texto = objetivoTexto.toLowerCase();

  if (
    texto.includes('perder') ||
    texto.includes('bajar peso') ||
    texto.includes('quemar')
  )
    return 'BAJAR_PESO';
  if (
    texto.includes('ganar') ||
    texto.includes('subir peso') ||
    texto.includes('musculo')
  )
    return 'SUBIR_PESO';
  if (texto.includes('mantener')) return 'MANTENER_PESO';
  if (texto.includes('fuerza')) return 'FUERZA';
  if (texto.includes('estrés')) return 'BIENESTAR';
  if (texto.includes('tonificar') || texto.includes('marcar'))
    return 'TONIFICAR';
  if (texto.includes('sin impacto') || texto.includes('me aburro'))
    return 'OTRO_ESTILO';

  return 'OTROS';
}

app.get('/students/:studentId/progress-comparison', async (req, res) => {
  const { studentId } = req.params;
  const { mes, anio } = req.query; // <-- Aceptamos mes y anio por query

  try {
    // 1. Obtener objetivos mensuales (igual que antes)
    // 1. Objetivos mensuales filtrados si se pasa mes y anio
    const [monthlyGoals] = await pool.query(
      `SELECT 
           id, mes, anio, objetivo,
           peso_kg AS peso_objetivo,
           altura_cm AS altura_objetivo,
           grasa_corporal AS grasa_objetivo,
           cintura_cm AS cintura_objetivo,
           estado, created_at, updated_at
         FROM student_monthly_goals
         WHERE student_id = ?
         ${mes && anio ? 'AND mes = ? AND anio = ?' : ''}
         ORDER BY anio DESC, mes DESC`,
      mes && anio ? [studentId, mes, anio] : [studentId]
    );

    // 2. Obtener progresos reales (igual que antes)
    // 2. Progresos reales (filtramos también si hay mes y anio)
    const [progresses] = await pool.query(
      `SELECT 
           id, student_id,
           DATE_FORMAT(fecha, '%Y-%m') AS anio_mes,
           MONTH(fecha) AS mes,
           YEAR(fecha) AS anio,
           peso_kg, altura_cm, grasa_corporal, cintura_cm,
           comentario, fecha, created_at, updated_at
         FROM student_progress
         WHERE student_id = ?
         ${mes && anio ? 'AND MONTH(fecha) = ? AND YEAR(fecha) = ?' : ''}
         ORDER BY fecha DESC`,
      mes && anio ? [studentId, mes, anio] : [studentId]
    );

    // 3. Obtener estadísticas semanales (nuevo)
    const [weeklyStats] = await pool.query(
      `SELECT 
         anio,
         AVG(energia_level) AS energia_promedio,
         SUM(cumplio_rutina) AS semanas_cumplidas,
         COUNT(*) AS total_semanas
       FROM student_weekly_checkin
       WHERE student_id = ?
       GROUP BY anio
       ORDER BY anio DESC`,
      [studentId]
    );

    // 4. Agrupar progresos por mes y año para comparación (igual)
    const progressGrouped = progresses.reduce((acc, prog) => {
      const key = `${prog.anio}-${prog.mes.toString().padStart(2, '0')}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(prog);
      return acc;
    }, {});

    // 5. Armar comparación mensual + extra (igual + extra)
    const comparison = monthlyGoals.map((goal) => {
      const key = `${goal.anio}-${goal.mes.toString().padStart(2, '0')}`;
      const progresosDelMes = progressGrouped[key] || [];

      // Ordenar progresos por fecha ascendente (opcional)
      progresosDelMes.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

      // Tomar el último progreso para cálculos resumidos (igual que antes)
      const lastProgress =
        progresosDelMes.length > 0
          ? progresosDelMes[progresosDelMes.length - 1]
          : null;

      const weeklyStatForYear = weeklyStats.find((ws) => ws.anio === goal.anio);
      const pesoObjetivo = parseFloat(goal.peso_objetivo);
      const pesoActual = lastProgress ? parseFloat(lastProgress.peso_kg) : null;

      const tipoObjetivo = detectarTipoObjetivo(goal.objetivo || '');
      let diferenciaPeso = null;
      let cumplioObjetivoPeso = null;
      let pesoRestanteParaObjetivo = null;
      let estadoObjetivo = goal.estado;
      if (pesoActual !== null && pesoObjetivo !== null) {
        diferenciaPeso = parseFloat((pesoActual - pesoObjetivo).toFixed(2));

        if (tipoObjetivo === 'BAJAR_PESO') {
          cumplioObjetivoPeso = pesoActual <= pesoObjetivo + 3;
          pesoRestanteParaObjetivo = cumplioObjetivoPeso
            ? 0
            : parseFloat((pesoActual - (pesoObjetivo + 3)).toFixed(2));
        } else if (tipoObjetivo === 'SUBIR_PESO') {
          cumplioObjetivoPeso = pesoActual >= pesoObjetivo;
          pesoRestanteParaObjetivo = cumplioObjetivoPeso
            ? 0
            : parseFloat((pesoObjetivo - pesoActual).toFixed(2));
        } else if (tipoObjetivo === 'MANTENER_PESO') {
          cumplioObjetivoPeso = Math.abs(diferenciaPeso) <= 1;
          pesoRestanteParaObjetivo = cumplioObjetivoPeso
            ? 0
            : Math.abs(diferenciaPeso);
        } else if (
          ['TONIFICAR', 'FUERZA', 'BIENESTAR', 'OTRO_ESTILO', 'OTROS'].includes(
            tipoObjetivo
          )
        ) {
          // Estos objetivos no se enfocan en el peso como principal métrica.
          cumplioObjetivoPeso = null;
          pesoRestanteParaObjetivo = null;
        }

        estadoObjetivo =
          cumplioObjetivoPeso === null
            ? 'NO_EVALUA_PESO'
            : cumplioObjetivoPeso
            ? 'COMPLETADO'
            : 'EN_PROGRESO';
      }

      return {
        goalId: goal.id,
        mes: goal.mes,
        anio: goal.anio,
        objetivo: goal.objetivo,
        tipoObjetivo,
        estadoObjetivo,
        pesoObjetivo: goal.peso_objetivo,
        alturaObjetivo: goal.altura_objetivo,
        grasaObjetivo: goal.grasa_objetivo,
        cinturaObjetivo: goal.cintura_objetivo,

        progresosDelMes: progresosDelMes.map((prog) => ({
          id: prog.id,
          fecha: prog.fecha,
          peso: prog.peso_kg,
          altura: prog.altura_cm,
          grasa: prog.grasa_corporal,
          cintura: prog.cintura_cm,
          comentario: prog.comentario
        })),

        totalProgresosEnMes: progresosDelMes.length,
        diferenciaPeso,
        cumplioObjetivoPeso,
        pesoRestanteParaObjetivo,
        estadisticasSemanales: weeklyStatForYear || null
      };
    });

    res.json({
      studentId,
      comparison
    });
  } catch (error) {
    console.error('Error fetching progress comparison:', error);
    res.status(500).json({
      error: 'Error al obtener la comparación de progreso del alumno'
    });
  }
});

app.get('/dietss/', async (req, res) => {
  try {
    const diet = await DietsModel.findAll({
      include: {
        model: MealsModel,
        as: 'meals',
        include: {
          model: MealItemsModel,
          as: 'items'
        }
      }
    });

    if (!diet) {
      return res.status(404).json({ error: 'Dieta no encontrada' });
    }

    res.json(diet);
  } catch (error) {
    console.error('Error al obtener dieta:', error);
    res.status(500).json({ error: 'Error al obtener dieta' });
  }
});

cron.schedule('1 0 * * *', () => {
  console.log('[CRON] Disparando la tarea programada diaria de asistencias...');
  crearAsistenciasDiariasAusentes();
}, {
  scheduled: true,
  timezone: "America/Argentina/Buenos_Aires" 
});

if (!PORT) {
  console.error('El puerto no está definido en el archivo de configuración.');
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

process.on('uncaughtException', (err) => {
  console.error('Excepción no capturada:', err);
  process.exit(1); // Opcional: reiniciar la aplicación
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no capturada:', promise, 'razón:', reason);
  process.exit(1); // Opcional: reiniciar la aplicación
});
