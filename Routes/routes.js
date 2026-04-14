/*
  * Programador: Benjamin Orellana
  * Fecha Cración: 23 /05 / 2025
  * Versión: 1.0
  *
  * Descripción:
    *Este archivo (routes.js) define las rutas HTTP para operaciones CRUD en la tabla
  * Tema: Rutas
  
  * Capa: Backend 
*/

import express from 'express'; // Importa la librería Express
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Importar controladores de locales
import {
  OBRS_Sedes_CTS,
  OBR_Sede_CTS,
  CR_Sede_CTS,
  ER_Sede_CTS,
  UR_Sede_CTS
} from '../Controllers/Core/CTS_TB_Sedes.js';
// Importar controladores de locales

import {
  OBR_Users_CTS,
  OBRS_Users_CTS,
  OBRS_Instructores_CTS,
  CR_Users_CTS,
  ER_Users_CTS,
  UR_Users_CTS
  // Importa los controladores necesarios para la tabla password_reset - tb_15
} from '../Controllers/Core/CTS_TB_Users.js';

import {
  OBR_Students_CTS,
  OBRS_Students_CTS,
  CR_Students_CTS,
  ER_Students_CTS,
  UR_Students_CTS
} from '../Controllers/CTS_TB_Students.js';

// import { getStats } from '../Controllers/CTS_TB_RoutineRequestStats.js';

import {
  OBR_StudentsPendientes_CTS,
  OBRS_StudentsPendientes_CTS,
  CR_StudentsPendientes_CTS,
  ER_StudentsPendientes_CTS,
  UR_StudentsPendientes_CTS,
  MIGRAR_AlumnoPendiente_CTS
} from '../Controllers/CTS_TB_StudentsPendientes.js';

import {
  OBR_Leads_CTS,
  OBRS_Leads_CTS,
  CR_Leads_CTS,
  ER_Leads_CTS,
  UR_Leads_CTS
} from '../Controllers/CTS_TB_Leads.js';

import {
  OBRS_StudentMonthlyGoals_CTS,
  OBR_StudentMonthlyGoals_CTS,
  CR_StudentMonthlyGoals_CTS,
  ER_StudentMonthlyGoals_CTS,
  UR_StudentMonthlyGoals_CTS
} from '../Controllers/CTS_TB_StudentMonthlyGoals.js';

// NUEVO MODULO DE PROGRESO PARA ALUMNOS
import {
  OBRS_StudentProgress_CTS,
  OBR_StudentProgress_CTS,
  CR_StudentProgress_CTS,
  UR_StudentProgress_CTS,
  ER_StudentProgress_CTS
} from '../Controllers/AlumnProgress/CTS_TB_StudentProgress.js';

import {
  OBRS_StudentWeeklyCheckin_CTS,
  OBR_StudentWeeklyCheckin_CTS,
  CR_StudentWeeklyCheckin_CTS,
  UR_StudentWeeklyCheckin_CTS,
  ER_StudentWeeklyCheckin_CTS
} from '../Controllers/AlumnProgress/CTS_TB_StudentWeeklyCheckin.js';

import {
  OBRS_StudentAchievements_CTS,
  OBR_StudentAchievement_CTS,
  CR_StudentAchievement_CTS,
  UR_StudentAchievement_CTS,
  ER_StudentAchievement_CTS
} from '../Controllers/AlumnProgress/CTS_TB_StudentAchievements.js';
// NUEVO MODULO DE PROGRESO PARA ALUMNOS

// NUEVO MODULO DE DIETAS
import {
  OBRS_Diets_CTS,
  OBR_Diets_CTS,
  CR_Diets_CTS,
  UR_Diets_CTS,
  ER_Diets_CTS
} from '../Controllers/Diets/CTS_TB_Diets.js';

import {
  OBRS_Meals_CTS,
  OBR_Meals_CTS,
  CR_Meals_CTS,
  UR_Meals_CTS,
  ER_Meals_CTS
} from '../Controllers/Diets/CTS_TB_Meals.js';

import {
  OBRS_MealItems_CTS,
  OBR_MealItems_CTS,
  CR_MealItems_CTS,
  UR_MealItems_CTS,
  ER_MealItems_CTS
} from '../Controllers/Diets/CTS_TB_MealItems.js';
// NUEVO MODULO DE DIETAS

// NUEVO MODULO DE GESTION DE RM
import {
  OBR_StudentRM_CTS,
  OBRS_StudentRM_CTS,
  CR_StudentRM_CTS,
  ER_StudentRM_CTS,
  UR_StudentRM_CTS,
  OBRS_HistorialRM_CTS,
  OBR_DashboardStudentRM_CTS
} from '../Controllers/CTS_TB_StudentRM.js';
// NUEVO MODULO DE GESTION DE RM

import {
  OBRS_RutinaColores_CTS,
  OBR_RutinaColor_CTS,
  CR_RutinaColor_CTS,
  UR_RutinaColor_CTS,
  ER_RutinaColor_CTS
} from '../Controllers/CTS_TB_RutinaColores.js';

import {
  OBRS_EjerciciosProfesor_CTS, // Listar/buscar todos (GET)
  OBR_EjercicioProfesor_CTS, // Traer uno por ID (GET)
  CR_EjercicioProfesor_CTS, // Crear (POST)
  UR_EjercicioProfesor_CTS, // Editar (PUT)
  ER_EjercicioProfesor_CTS // Eliminar (DELETE)
} from '../Controllers/CTS_TB_EjerciciosProfesor.js';

import {
  OBRS_ClientesPilates_CTS,
  OBR_ClientesPilates_CTS,
  CR_ClientesPilates_CTS,
  UR_ClientesPilates_CTS,
  ER_ClientesPilates_CTS,
  BUSCAR_ClientesPilates_CTS,
  OBRS_ClientesPorEstado_CTS,
  OBRS_ClientesProximosVencer_CTS,
  ESP_OBRS_HorarioClientesPilates_CTS,
  ER_ClienteConInscripciones_CTS,
  UR_ContactarCliente_CTS,
  ESP_OBRS_HorariosDisponibles_CTS,
  EXISTE_ClientePruebaPorNombre_CTS
} from '../Controllers/CTS_TB_ClientesPilates.js';

import {
  OBRS_InscripcionesPilates_CTS,
  OBR_InscripcionesPilates_CTS,
  CR_InscripcionesPilates_CTS,
  UR_InscripcionesPilates_CTS,
} from  '../Controllers/CTS_TB_InscripcionesPilates.js';

import {
  OBRS_ListaEsperaPilates,
  OBR_ListaEsperaPilates,
  CR_ListaEsperaPilates,
  UR_ListaEsperaPilates,
  ER_ListaEsperaPilates
} from '../Controllers/CTS_TB_ListaEsperaPilates.js';

import {
  OBRS_UsuariosPilates_CTS,
  OBRS_UsuariosPilatesNombreCompleto_CTS,
  OBRS_UsuariosPilatesPorSede_CTS,
  OBR_UsuarioPilates_CTS,
  CR_UsuarioPilates_CTS,
  UR_UsuarioPilates_CTS,
  ER_UsuarioPilates_CTS
} from "../Controllers/CTS_TB_UsuariosPilates.js";

import {
  OBRS_HorariosPilates_CTS,
  UR_InstructorHorarioPilates_CTS
} from '../Controllers/CTS_TB_HorariosPilates.js';

import {
  OBRS_AsistenciasFormato_CTS,
  UR_AsistenciaCliente_CTS,
  DEBUG_DispararCreacionAsistencias_CTS,
  OBRS_AusenciasMensualesPorSede_CTS,
} from "../Controllers/CTS_TB_AsistenciasPilates.js";

import {
  CR_crearContacto,
  UR_modificarEstadoContacto,
} from "../Controllers/CTS_TB_ContactosListaEsperaPilates.js";

import {
  OBRS_BloquesEjercicio_CTS,
  OBR_BloqueEjercicio_CTS,
  CR_BloqueEjercicio_CTS,
  UR_BloqueEjercicio_CTS,
  ER_BloqueEjercicio_CTS
} from '../Controllers/CTS_TB_BloquesEjercicio.js';
// ----------------------------------------------------------------
// Crea un enrutador de Express
const router = express.Router();
// Define las rutas para cada método del controlador
// ----------------------------------------------------------------

// Define las rutas para Sedes
router.get('/sedes', OBRS_Sedes_CTS);
router.get('/sedes/:id', OBR_Sede_CTS);
router.post('/sedes', CR_Sede_CTS);
router.delete('/sedes/:id', ER_Sede_CTS);
router.put('/sedes/:id', UR_Sede_CTS);
// ----------------------------------------------------------------
// Ruta para obtener todos los registros de Users_CTS tb_1
// ----------------------------------------------------------------
// Define las rutas para cada método del controlador de Users_CTS
// ----------------------------------------------------------------
router.get('/users', OBRS_Users_CTS);

// Obtener un registro específico de Users_CTS por su ID
router.get('/users/:id', OBR_Users_CTS);

// Crear un nuevo registro en Users_CTS
router.post('/users', CR_Users_CTS);

// Eliminar un registro en Users_CTS por su ID
router.delete('/users/:id', ER_Users_CTS);

// Actualizar un registro en Users_CTS por su ID
router.put('/users/:id', UR_Users_CTS);

// Ruta para obtener solo usuarios con level = 'instructor'
router.get('/instructores', OBRS_Instructores_CTS);
// ----------------------------------------------------------------

// ----------------------------------------------------------------
// Obtener todos los estudiantes (opcionalmente filtrar por user_id)
router.get('/students', OBRS_Students_CTS);

// Obtener un estudiante por ID
router.get('/students/:id', OBR_Students_CTS);

// Crear un nuevo estudiante
router.post('/students', CR_Students_CTS);

// Eliminar un estudiante por ID
router.delete('/students/:id', ER_Students_CTS);

// Actualizar un estudiante por ID
router.put('/students/:id', UR_Students_CTS);


// Ruta para consultar estadísticas
// router.get('/routine_request_stats', getStats);
// ----------------------------------------------------------------

// GET /api/students-pendientes           → Obtener todos o filtrar por user_id
router.get('/students-pendientes', OBRS_StudentsPendientes_CTS);

// GET /api/students-pendientes/:id       → Obtener alumno pendiente por ID
router.get('/students-pendientes/:id', OBR_StudentsPendientes_CTS);

// POST /api/students-pendientes          → Crear nuevo alumno pendiente
router.post('/students-pendientes', CR_StudentsPendientes_CTS);

// DELETE /api/students-pendientes/:id    → Eliminar alumno pendiente
router.delete('/students-pendientes/:id', ER_StudentsPendientes_CTS);

// PUT /api/students-pendientes/:id       → Actualizar alumno pendiente
router.put('/students-pendientes/:id', UR_StudentsPendientes_CTS);

// POST /api/students-pendientes/migrar/:id → Autorizar (migrar) alumno
router.post('/students-pendientes/migrar/:id', MIGRAR_AlumnoPendiente_CTS);
// ----------------------------------------------------------------

// Obtener todos los leads o aplicar filtros si los tuviera
router.get('/leads', OBRS_Leads_CTS);

// Obtener un lead específico por su ID
router.get('/leads/:id', OBR_Leads_CTS);

// Crear un nuevo lead
router.post('/leads', CR_Leads_CTS);

// Eliminar un lead por su ID
router.delete('/leads/:id', ER_Leads_CTS);

// Actualizar un lead por su ID
router.put('/leads/:id', UR_Leads_CTS);

// Obtener todos los objetivos o filtrarlos por student_id, mes, año
router.get('/student-monthly-goals', OBRS_StudentMonthlyGoals_CTS);

// Obtener un objetivo específico por su ID
router.get('/student-monthly-goals/:id', OBR_StudentMonthlyGoals_CTS);

// Crear un nuevo objetivo (o varios)
router.post('/student-monthly-goals', CR_StudentMonthlyGoals_CTS);

// Eliminar un objetivo por su ID
router.delete('/student-monthly-goals/:id', ER_StudentMonthlyGoals_CTS);

// Actualizar un objetivo por su ID
router.put('/student-monthly-goals/:id', UR_StudentMonthlyGoals_CTS);

// ===========================
// NUEVO MODULO DE PROGRESO PARA ALUMNOS
// ===========================

// Progreso mensual del alumno
// Obtener todos los progresos o filtrarlos por student_id, mes y año
router.get('/student-progress', OBRS_StudentProgress_CTS);

// Obtener un progreso específico por ID
router.get('/student-progress/:id', OBR_StudentProgress_CTS);

// Crear nuevo progreso
router.post('/student-progress', CR_StudentProgress_CTS);

// Actualizar progreso por ID
router.put('/student-progress/:id', UR_StudentProgress_CTS);

// Eliminar progreso por ID
router.delete('/student-progress/:id', ER_StudentProgress_CTS);

// ----------------------------------------

// Check-in semanal del alumno
// Obtener todos los check-ins o filtrarlos por student_id, semana y año
router.get('/student-weekly-checkin', OBRS_StudentWeeklyCheckin_CTS);

// Obtener un check-in específico por ID
router.get('/student-weekly-checkin/:id', OBR_StudentWeeklyCheckin_CTS);

// Crear nuevo check-in
router.post('/student-weekly-checkin', CR_StudentWeeklyCheckin_CTS);

// Actualizar check-in por ID
router.put('/student-weekly-checkin/:id', UR_StudentWeeklyCheckin_CTS);

// Eliminar check-in por ID
router.delete('/student-weekly-checkin/:id', ER_StudentWeeklyCheckin_CTS);

// ----------------------------------------

// Logros del alumno
// Obtener todos los logros o filtrarlos por student_id
router.get('/student-achievements', OBRS_StudentAchievements_CTS);

// Obtener un logro específico por ID
router.get('/student-achievements/:id', OBR_StudentAchievement_CTS);

// Crear nuevo logro
router.post('/student-achievements', CR_StudentAchievement_CTS);

// Actualizar logro por ID
router.put('/student-achievements/:id', UR_StudentAchievement_CTS);

// Eliminar logro por ID
router.delete('/student-achievements/:id', ER_StudentAchievement_CTS);

// NUEVO MODULO DE DIETAS
router.get('/diets', OBRS_Diets_CTS);
router.get('/diets/:id', OBR_Diets_CTS);
router.post('/diets', CR_Diets_CTS);
router.put('/diets/:id', UR_Diets_CTS);
router.delete('/diets/:id', ER_Diets_CTS);

router.get('/meals', OBRS_Meals_CTS);
router.get('/meals/:id', OBR_Meals_CTS);
router.post('/meals', CR_Meals_CTS);
router.put('/meals/:id', UR_Meals_CTS);
router.delete('/meals/:id', ER_Meals_CTS);

router.get('/meal_items', OBRS_MealItems_CTS);
router.get('/meal_items/:id', OBR_MealItems_CTS);
router.post('/meal_items', CR_MealItems_CTS);
router.put('/meal_items/:id', UR_MealItems_CTS);
router.delete('/meal_items/:id', ER_MealItems_CTS);
// NUEVO MODULO DE DIETAS

/* Benjamin Orellana - 2026/04/11 - Rutas específicas de dashboard e historial para RM */
router.get('/student-rm/dashboard', OBR_DashboardStudentRM_CTS);
router.get('/student-rm/historial', OBRS_HistorialRM_CTS);

/* Benjamin Orellana - 2026/04/11 - CRUD principal de RM */
router.get('/student-rm', OBRS_StudentRM_CTS);
router.get('/student-rm/:id', OBR_StudentRM_CTS);
router.post('/student-rm', CR_StudentRM_CTS);
router.put('/student-rm/:id', UR_StudentRM_CTS);
router.delete('/student-rm/:id', ER_StudentRM_CTS);


router.get('/rutina-colores', OBRS_RutinaColores_CTS);
router.get('/rutina-colores/:id', OBR_RutinaColor_CTS);
router.post('/rutina-colores', CR_RutinaColor_CTS);
router.put('/rutina-colores/:id', UR_RutinaColor_CTS);
router.delete('/rutina-colores/:id', ER_RutinaColor_CTS);

// Buscar/listar ejercicios de un profesor (con filtro opcional)
router.get('/ejercicios-profes', OBRS_EjerciciosProfesor_CTS);

// Obtener uno por ID
router.get('/ejercicios-profes/:id', OBR_EjercicioProfesor_CTS);

// Crear nuevo
router.post('/ejercicios-profes', CR_EjercicioProfesor_CTS);

// Actualizar nombre de un ejercicio
router.put('/ejercicios-profes/:id', UR_EjercicioProfesor_CTS);

// Eliminar un ejercicio
router.delete('/ejercicios-profes/:id', ER_EjercicioProfesor_CTS);

router.get(
  '/ejercicios-profes/:ejercicio_id/bloques',
  OBRS_BloquesEjercicio_CTS
);
router.get('/bloques-ejercicio/:id', OBR_BloqueEjercicio_CTS);
router.post('/ejercicios-profes/:ejercicio_id/bloques', CR_BloqueEjercicio_CTS);
router.put('/bloques-ejercicio/:id', UR_BloqueEjercicio_CTS);
router.delete('/bloques-ejercicio/:id', ER_BloqueEjercicio_CTS);

import {
  OBRS_Rutinas_CTS, // Obtener todas las rutinas (opcionalmente por student_id)
  OBR_Rutina_CTS, // Obtener una rutina por ID
  CR_Rutina_CTS, // Crear una nueva rutina
  ER_Rutina_CTS, // Eliminar una rutina por ID
  UR_Rutina_CTS, // Actualizar una rutina por ID
  UR_RutinaFechas_CTS // Actualizar una FECHA de rutina por ID
} from '../Controllers/Rutinas_V2/CTS_TB_Rutinas.js';

// Obtener todas las rutinas (con o sin filtros)
router.get('/rutinas', OBRS_Rutinas_CTS);

// Obtener una rutina específica por su ID
router.get('/rutinas/:id', OBR_Rutina_CTS);

// Crear una nueva rutina
router.post('/rutinas', CR_Rutina_CTS);

// Actualizar una rutina por su ID
router.put('/rutinas/:id', UR_Rutina_CTS);

// Eliminar una rutina por su ID
router.delete('/rutinas/:id', ER_Rutina_CTS);

router.put('/rutinas/:id/fechas', UR_RutinaFechas_CTS);
import {
  OBRS_Bloques_CTS,
  OBR_Bloque_CTS,
  CR_Bloque_CTS,
  ER_Bloque_CTS,
  UR_Bloque_CTS
} from '../Controllers/Rutinas_V2/CTS_TB_Bloques.js';

router.get('/bloques', OBRS_Bloques_CTS);
router.get('/bloques/:id', OBR_Bloque_CTS);
router.post('/bloques', CR_Bloque_CTS);
router.put('/bloques/:id', UR_Bloque_CTS);
router.delete('/bloques/:id', ER_Bloque_CTS);

import {
  OBRS_Ejercicios_CTS,
  OBR_Ejercicio_CTS,
  CR_Ejercicio_CTS,
  ER_Ejercicio_CTS,
  UR_Ejercicio_CTS
} from '../Controllers/Rutinas_V2/CTS_TB_Ejercicios.js';

router.get('/ejercicios', OBRS_Ejercicios_CTS);
router.get('/ejercicios/:id', OBR_Ejercicio_CTS);
router.post('/ejercicios', CR_Ejercicio_CTS);
router.put('/ejercicios/:id', UR_Ejercicio_CTS);
router.delete('/ejercicios/:id', ER_Ejercicio_CTS);

import {
  OBRS_Series_CTS,
  OBR_Serie_CTS,
  CR_Serie_CTS,
  ER_Serie_CTS,
  UR_Serie_CTS
} from '../Controllers/Rutinas_V2/CTS_TB_Series.js';

router.get('/series', OBRS_Series_CTS);
router.get('/series/:id', OBR_Serie_CTS);
router.post('/series', CR_Serie_CTS);
router.put('/series/:id', UR_Serie_CTS);
router.delete('/series/:id', ER_Serie_CTS);

import {
  OBR_RutinaCompleta_CTS,
  CR_RutinaCompleta_CTS,
  OBR_UltimaRutinaAlumno_CTS,
  OBR_RutinasDeHoyAlumno_CTS,
  OBR_RutinasVigentesPorFechaAlumno_CTS,
  OBR_RutinasVigentesHoyAlumno_CTS,
  CR_RutinaCompleta_Lote_CTS,
  OBR_RutinasAsignadasHoyAlumno_CTS,
  OBR_RutinasAsignadasPorFechaAlumno_CTS
} from '../Controllers/Rutinas_V2/CTS_TB_Rutinas_Completas.js';

router.get('/rutinas/:id/completa', OBR_RutinaCompleta_CTS);
router.post('/rutinas-completas', CR_RutinaCompleta_CTS);

router.get('/rutinas/ultima/:student_id', OBR_UltimaRutinaAlumno_CTS);
router.get('/rutinas/hoy/:student_id', OBR_RutinasDeHoyAlumno_CTS);
router.get(
  '/rutinas/alumno/:student_id/vigentes-por-fecha',
  OBR_RutinasVigentesPorFechaAlumno_CTS
);
router.get(
  '/rutinas/alumno/:student_id/vigentes',
  OBR_RutinasVigentesHoyAlumno_CTS
);

router.post('/rutinas/completa/lote', CR_RutinaCompleta_Lote_CTS); // nuevo

// Solo asignadas (sin mezclar con las “propias”)
router.get(
  '/rutinas/asignadas/hoy/:student_id',
  OBR_RutinasAsignadasHoyAlumno_CTS
);
router.get(
  '/rutinas/asignadas/vigentes-por-fecha/:student_id',
  OBR_RutinasAsignadasPorFechaAlumno_CTS
);

import {
  OBRS_EjerciciosCatalogo_CTS,
  OBR_EjercicioCatalogo_CTS,
  CR_EjercicioCatalogo_CTS,
  ER_EjercicioCatalogo_CTS,
  UR_EjercicioCatalogo_CTS,
  SEARCH_EjerciciosCatalogo_CTS
} from '../Controllers/Rutinas_V2/CTS_TB_EjerciciosCatalogo.js';

router.get('/catalogo-ejercicios', OBRS_EjerciciosCatalogo_CTS);
router.get('/catalogo-ejercicios/:id', OBR_EjercicioCatalogo_CTS);
router.post('/catalogo-ejercicios', CR_EjercicioCatalogo_CTS);
router.put('/catalogo-ejercicios/:id', UR_EjercicioCatalogo_CTS);
router.delete('/catalogo-ejercicios/:id', ER_EjercicioCatalogo_CTS);
router.get('/catalogo-ejercicios/search', SEARCH_EjerciciosCatalogo_CTS);

import {
  OBRS_RoutineSerieLogs_CTS,
  OBR_RoutineSerieLog_CTS,
  CR_RoutineSerieLog_CTS,
  UR_RoutineSerieLog_CTS,
  ER_RoutineSerieLog_CTS,
  OBR_UltimoLogSerieAlumno_CTS,
  OBRS_HistorialLogSerie_CTS
} from '../Controllers/CTS_RoutineSerieLogs.js';

import {
  OBRS_LogsGlobalPorAlumno_CTS,
  OBR_LogGlobalPorId_CTS
} from '../Controllers/Rutinas_V2/CTS_LogsGlobal.js';

// ⚠️ Primero las rutas "de palabra"
router.get('/routine_exercise_logs/last', OBR_UltimoLogSerieAlumno_CTS);
router.get('/routine_exercise_logs/history', OBRS_HistorialLogSerie_CTS);
router.get('/routine_exercise_logs/global', OBRS_LogsGlobalPorAlumno_CTS);
router.get('/routine_exercise_logs/global/:id', OBR_LogGlobalPorId_CTS);

// Luego las genéricas
router.get('/routine_exercise_logs', OBRS_RoutineSerieLogs_CTS);
router.get('/routine_exercise_logs/:id', OBR_RoutineSerieLog_CTS);
router.post('/routine_exercise_logs', CR_RoutineSerieLog_CTS);
router.put('/routine_exercise_logs/:id', UR_RoutineSerieLog_CTS);
router.delete('/routine_exercise_logs/:id', ER_RoutineSerieLog_CTS);

import { OBR_RutinasFullList_CTS } from '../Controllers/Rutinas_V2/OBR_Rutinas_CTS.js';
router.get('/rutinasss', OBR_RutinasFullList_CTS);

import { ASIG_RutinaALote_CTS } from '../Controllers/Rutinas_V2/CTS_TB_RutinasAsignaciones.js';
// routes
router.post('/rutinas/:rutina_id/asignar', ASIG_RutinaALote_CTS);

// routes.js
import {
  OBRS_PSE_CTS,
  OBR_PSE_CTS,
  CR_PSE_CTS,
  CR_PSE_Sesion_CTS,
  CR_PSE_Serie_CTS,
  UR_PSE_CTS,
  ER_PSE_CTS,
  OBRS_PSE_CargaSesion_CTS,
  OBRS_PSE_UltimosPorSerie_CTS
} from '../Controllers/Rutinas_V2/CTS_TB_PseRegistros.js';

router.get('/pse', OBRS_PSE_CTS);
router.get('/pse/:id', OBR_PSE_CTS);
router.post('/pse', CR_PSE_CTS);
router.post('/pse/sesion', CR_PSE_Sesion_CTS);
router.post('/pse/serie', CR_PSE_Serie_CTS);
router.patch('/pse/:id', UR_PSE_CTS);
router.delete('/pse/:id', ER_PSE_CTS);

router.get('/pse/carga-sesion', OBRS_PSE_CargaSesion_CTS);
router.get('/pse/ultimos-por-serie', OBRS_PSE_UltimosPorSerie_CTS);



// ----------------------------------------------------------------
// Rutas específicas para el módulo Pilates (single-site)
// Estas rutas se añaden al final del archivo y NO usan parámetros de sede
// ----------------------------------------------------------------
// Clientes Pilates
router.get('/clientes-pilates/horarios', ESP_OBRS_HorarioClientesPilates_CTS);
router.get('/clientes-pilates', OBRS_ClientesPilates_CTS);
router.get('/clientes-pilates/buscar', BUSCAR_ClientesPilates_CTS);
router.get('/clientes-pilates/estado/:estado', OBRS_ClientesPorEstado_CTS);
router.get('/clientes-pilates/proximos-vencer', OBRS_ClientesProximosVencer_CTS);
router.get('/clientes-pilates/existe-prueba-por-nombre', EXISTE_ClientePruebaPorNombre_CTS);
router.get('/clientes-pilates/:id', OBR_ClientesPilates_CTS);
router.get('/clientes-pilates/horarios-disponibles/ventas', ESP_OBRS_HorariosDisponibles_CTS);
router.put('/clientes-pilates/:id', UR_ClientesPilates_CTS);
router.put('/clientes-pilates/contactar/:id', UR_ContactarCliente_CTS);
router.post('/clientes/insertar', CR_ClientesPilates_CTS);
router.delete('/clientes-pilates/con-inscripciones/:id', ER_ClienteConInscripciones_CTS);

// Inscripciones Pilates
router.get('/inscripciones-pilates', OBRS_InscripcionesPilates_CTS);
router.get('/inscripciones-pilates/:id', OBR_InscripcionesPilates_CTS);
router.post('/inscripciones-pilates', CR_InscripcionesPilates_CTS);
router.put('/inscripciones-pilates/:id', UR_InscripcionesPilates_CTS);

// Lista de espera Pilates
router.get('/lista-espera-pilates', OBRS_ListaEsperaPilates);
router.get('/lista-espera-pilates/:id', OBR_ListaEsperaPilates);
router.post('/lista-espera-pilates', CR_ListaEsperaPilates);
router.put('/lista-espera-pilates/:id', UR_ListaEsperaPilates);
router.delete('/lista-espera-pilates/:id', ER_ListaEsperaPilates);

// Usuarios Pilates (single-site)
router.get('/usuarios-pilates', OBRS_UsuariosPilates_CTS);
router.get('/usuarios-pilates/nombres', OBRS_UsuariosPilatesNombreCompleto_CTS);
// Nota: la ruta por sede fue eliminada porque el proyecto es single-site
router.get('/usuarios-pilates/:id', OBR_UsuarioPilates_CTS);
router.post('/usuarios-pilates', CR_UsuarioPilates_CTS);
router.put('/usuarios-pilates/:id', UR_UsuarioPilates_CTS);
router.delete('/usuarios-pilates/:id', ER_UsuarioPilates_CTS);

// Horarios
router.put('/horarios-pilates/cambiar-instructor', UR_InstructorHorarioPilates_CTS);

// Asistencias
router.get('/asistencias-pilates/formato', OBRS_AsistenciasFormato_CTS);
router.get('/asistencias-pilates/ausencias-mensuales', OBRS_AusenciasMensualesPorSede_CTS);
router.put('/asistencias-pilates/marcar', UR_AsistenciaCliente_CTS);
router.get('/asistencias-pilates/crear-diarias', DEBUG_DispararCreacionAsistencias_CTS);

// Contactos lista de espera
router.post('/contactos-lista-espera', CR_crearContacto);
router.put('/contactos-lista-espera/:id_lista_espera', UR_modificarEstadoContacto);

// NOTA: omito rutas relacionadas con 'ventas-prospectos' y otras no presentes/importadas en este proyecto

// Benjamin Orellana - 2026/04/13 - Import de controladores del módulo Alianzas Oportunidades.
import {
  OBRS_AlianzasOportunidades_CTS,
  OBR_AlianzasOportunidades_CTS,
  OBR_Detalle_AlianzasOportunidades_CTS,
  CR_AlianzasOportunidades_CTS,
  UR_AlianzasOportunidades_CTS,
  ER_AlianzasOportunidades_CTS,
  CR_RegistroPublicoAlianzas_CTS
} from '../Controllers/Empresas/CTS_TB_AlianzasOportunidades.js';

// ----------------------------------------
// Alianzas Oportunidades

router.get('/alianzas-oportunidades', OBRS_AlianzasOportunidades_CTS);

router.get('/alianzas-oportunidades/:id', OBR_AlianzasOportunidades_CTS);

router.get(
  '/alianzas-oportunidades/:id/detalle',
  OBR_Detalle_AlianzasOportunidades_CTS
);

router.post('/alianzas-oportunidades', CR_AlianzasOportunidades_CTS);

router.put('/alianzas-oportunidades/:id', UR_AlianzasOportunidades_CTS);

router.delete('/alianzas-oportunidades/:id', ER_AlianzasOportunidades_CTS);

// Registro público de empresa / emprendimiento para publicidad o convenio
router.post('/alianzas-publico/registro', CR_RegistroPublicoAlianzas_CTS);

// ----------------------------------------

// Benjamin Orellana - 2026/04/13 - Import de controladores del módulo Alianzas Empresas.
import {
  OBRS_AlianzasEmpresas_CTS,
  OBR_AlianzasEmpresas_CTS,
  CR_AlianzasEmpresas_CTS,
  UR_AlianzasEmpresas_CTS,
  ER_AlianzasEmpresas_CTS
} from '../Controllers/Empresas/CTS_TB_AlianzasEmpresas.js';

// ----------------------------------------
// Alianzas Empresas

router.get('/alianzas-empresas', OBRS_AlianzasEmpresas_CTS);

router.get('/alianzas-empresas/:id', OBR_AlianzasEmpresas_CTS);

router.post('/alianzas-empresas', CR_AlianzasEmpresas_CTS);

router.put('/alianzas-empresas/:id', UR_AlianzasEmpresas_CTS);

router.delete('/alianzas-empresas/:id', ER_AlianzasEmpresas_CTS);

// ----------------------------------------

// Benjamin Orellana - 2026/04/13 - Import de controladores del módulo Alianzas Contactos.
import {
  OBRS_AlianzasContactos_CTS,
  OBR_AlianzasContactos_CTS,
  CR_AlianzasContactos_CTS,
  UR_AlianzasContactos_CTS,
  ER_AlianzasContactos_CTS
} from '../Controllers/Empresas/CTS_TB_AlianzasContactos.js';

// ----------------------------------------
// Alianzas Contactos

router.get('/alianzas-contactos', OBRS_AlianzasContactos_CTS);

router.get('/alianzas-contactos/:id', OBR_AlianzasContactos_CTS);

router.post('/alianzas-contactos', CR_AlianzasContactos_CTS);

router.put('/alianzas-contactos/:id', UR_AlianzasContactos_CTS);

router.delete('/alianzas-contactos/:id', ER_AlianzasContactos_CTS);

// ----------------------------------------

// Benjamin Orellana - 2026/04/14 - Import de controladores del módulo Alianzas Espacios.
import {
  OBRS_AlianzasEspacios_CTS,
  OBR_AlianzasEspacios_CTS,
  CR_AlianzasEspacios_CTS,
  UR_AlianzasEspacios_CTS,
  ER_AlianzasEspacios_CTS
} from '../Controllers/Empresas/CTS_TB_AlianzasEspacios.js';

// ----------------------------------------
// Alianzas Espacios

router.get('/alianzas-espacios', OBRS_AlianzasEspacios_CTS);

router.get('/alianzas-espacios/:id', OBR_AlianzasEspacios_CTS);

router.post('/alianzas-espacios', CR_AlianzasEspacios_CTS);

router.put('/alianzas-espacios/:id', UR_AlianzasEspacios_CTS);

router.delete('/alianzas-espacios/:id', ER_AlianzasEspacios_CTS);

// ----------------------------------------

// Benjamin Orellana - 2026/04/14 - Import de controladores del módulo Alianzas Oportunidad Espacios.
import {
  OBRS_AlianzasOportunidadEspacios_CTS,
  OBR_AlianzasOportunidadEspacios_CTS,
  CR_AlianzasOportunidadEspacios_CTS,
  UR_AlianzasOportunidadEspacios_CTS,
  ER_AlianzasOportunidadEspacios_CTS
} from '../Controllers/Empresas/CTS_TB_AlianzasOportunidadEspacios.js';

// ----------------------------------------
// Alianzas Oportunidad Espacios

router.get(
  '/alianzas-oportunidad-espacios',
  OBRS_AlianzasOportunidadEspacios_CTS
);

router.get(
  '/alianzas-oportunidad-espacios/:id',
  OBR_AlianzasOportunidadEspacios_CTS
);

router.post(
  '/alianzas-oportunidad-espacios',
  CR_AlianzasOportunidadEspacios_CTS
);

router.put(
  '/alianzas-oportunidad-espacios/:id',
  UR_AlianzasOportunidadEspacios_CTS
);

router.delete(
  '/alianzas-oportunidad-espacios/:id',
  ER_AlianzasOportunidadEspacios_CTS
);

// ----------------------------------------

// Benjamin Orellana - 2026/04/14 - Import de controladores del módulo Alianzas Notas.
import {
  OBRS_AlianzasNotas_CTS,
  OBR_AlianzasNotas_CTS,
  CR_AlianzasNotas_CTS,
  UR_AlianzasNotas_CTS,
  ER_AlianzasNotas_CTS
} from '../Controllers/Empresas/CTS_TB_AlianzasNotas.js';

// ----------------------------------------
// Alianzas Notas

router.get('/alianzas-notas', OBRS_AlianzasNotas_CTS);

router.get('/alianzas-notas/:id', OBR_AlianzasNotas_CTS);

router.post('/alianzas-notas', CR_AlianzasNotas_CTS);

router.put('/alianzas-notas/:id', UR_AlianzasNotas_CTS);

router.delete('/alianzas-notas/:id', ER_AlianzasNotas_CTS);

import {
  OBRS_StudentGalleryPosts_CTS,
  OBRS_StudentGalleryPostsPublicHome_CTS,
  OBR_StudentGalleryPost_CTS,
  CR_StudentGalleryPost_CTS,
  UR_StudentGalleryPost_CTS,
  APROBAR_StudentGalleryPost_CTS,
  RECHAZAR_StudentGalleryPost_CTS,
  ARCHIVAR_StudentGalleryPost_CTS,
  ER_StudentGalleryPost_CTS
} from '../Controllers/Galeria/CTS_TB_StudentGalleryPosts.js';


/* Benjamin Orellana - 2026/04/14 - Rutas operativas y públicas del módulo de publicaciones de galería. */
router.get('/student-gallery-posts', OBRS_StudentGalleryPosts_CTS);
router.get('/student-gallery-posts/public/home', OBRS_StudentGalleryPostsPublicHome_CTS);
router.get('/student-gallery-posts/:id', OBR_StudentGalleryPost_CTS);
router.post('/student-gallery-posts', CR_StudentGalleryPost_CTS);
router.put('/student-gallery-posts/:id', UR_StudentGalleryPost_CTS);
router.put('/student-gallery-posts/:id/aprobar', APROBAR_StudentGalleryPost_CTS);
router.put('/student-gallery-posts/:id/rechazar', RECHAZAR_StudentGalleryPost_CTS);
router.put('/student-gallery-posts/:id/archivar', ARCHIVAR_StudentGalleryPost_CTS);
router.delete('/student-gallery-posts/:id', ER_StudentGalleryPost_CTS);

import {
  OBRS_StudentGalleryMedia_CTS,
  OBRS_StudentGalleryMediaByPost_CTS,
  OBR_StudentGalleryMedia_CTS,
  CR_StudentGalleryMedia_CTS,
  UR_StudentGalleryMedia_CTS,
  UR_StudentGalleryMediaReordenar_CTS,
  UR_StudentGalleryMediaSetPortada_CTS,
  ER_StudentGalleryMedia_CTS,
  UPLOAD_StudentGalleryMediaFile_CTS
} from '../Controllers/Galeria/CTS_TB_StudentGalleryMedia.js';


/* Benjamin Orellana - 2026/04/14 - Rutas operativas del módulo de medios de galería. */
router.get('/student-gallery-media', OBRS_StudentGalleryMedia_CTS);
router.get(
  '/student-gallery-media/post/:post_id',
  OBRS_StudentGalleryMediaByPost_CTS
);
router.get('/student-gallery-media/:id', OBR_StudentGalleryMedia_CTS);
router.post('/student-gallery-media', CR_StudentGalleryMedia_CTS);
router.put('/student-gallery-media/:id', UR_StudentGalleryMedia_CTS);
router.put(
  '/student-gallery-media/post/:post_id/reordenar',
  UR_StudentGalleryMediaReordenar_CTS
);
router.put(
  '/student-gallery-media/:id/set-portada',
  UR_StudentGalleryMediaSetPortada_CTS
);
router.delete('/student-gallery-media/:id', ER_StudentGalleryMedia_CTS);
// ----------------------------------------

/* Benjamin Orellana - 2026/04/14 - Configuración multer para subida física de imágenes y videos del módulo de galería. */
const studentGalleryDir = path.join(process.cwd(), 'public', 'student-gallery');

if (!fs.existsSync(studentGalleryDir)) {
  fs.mkdirSync(studentGalleryDir, { recursive: true });
}

/* Benjamin Orellana - 2026/04/14 - Normaliza nombres de archivo para evitar caracteres problemáticos. */
const sanitizeFileName = (fileName = 'archivo') => {
  const baseName = fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .toLowerCase();

  return baseName || 'archivo';
};

const storageStudentGallery = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, studentGalleryDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '');
    const nameWithoutExt = path.basename(file.originalname || 'archivo', ext);
    const safeName = sanitizeFileName(nameWithoutExt);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    cb(null, `${safeName}-${uniqueSuffix}${ext}`);
  }
});

const fileFilterStudentGallery = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new Error(
        'Formato no permitido. Solo se aceptan imágenes JPG, PNG, WEBP y videos MP4, WEBM o MOV.'
      )
    );
  }

  cb(null, true);
};

const uploadStudentGalleryMedia = multer({
  storage: storageStudentGallery,
  fileFilter: fileFilterStudentGallery,
  limits: {
    fileSize: 25 * 1024 * 1024
  }
});

/* Benjamin Orellana - 2026/04/14 - Endpoint de subida física de archivos para galería de alumnos. */
router.post('/student-gallery-media/upload', (req, res, next) => {
  uploadStudentGalleryMedia.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        mensajeError: err.message
      });
    }

    next();
  });
}, UPLOAD_StudentGalleryMediaFile_CTS);
// Exporta el enrutador
export default router;
