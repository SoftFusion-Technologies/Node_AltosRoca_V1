/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 19/09/2025
 * Versión: 1.0
 *
 * Descripción:
 * Controlador para la tabla asistencias_pilates.
 * Tema: Controladores - Asistencias Pilates
 * Capa: Backend
 */
import AsistenciasPilatesModel from "../Models/MD_TB_AsistenciasPilates.js";
import InscripcionesPilatesModel from "../Models/MD_TB_InscripcionesPilates.js";
import ClientesPilatesModel from "../Models/MD_TB_ClientesPilates.js";
import UsersModel from "../Models/Core/MD_TB_Users.js";
import MD_TB_HorariosPilates from "../Models/MD_TB_HorariosPilates.js";
import db from "../DataBase/db.js";
import { QueryTypes, Op, fn, col, literal } from "sequelize";

const HorariosPilatesModel = MD_TB_HorariosPilates.HorariosPilatesModel;

/**
 * GET /asistencias-pilates/formato?fecha=YYYY-MM-DD
 * Devuelve las asistencias de una fecha en formato { id_inscripcion: "presente" | "ausente" }
 */
export const OBRS_AsistenciasFormato_CTS = async (req, res) => {
  try {
    const { fecha } = req.query;
    if (!fecha) {
      return res
        .status(400)
        .json({ mensajeError: "El parámetro 'fecha' es requerido." });
    }

    const asistencias = await AsistenciasPilatesModel.findAll({
      where: { fecha },
      include: [
        {
          model: InscripcionesPilatesModel,
          as: "inscripcion",
          attributes: ["id_cliente"],
        },
      ],
    });

    const resultadoFormateado = {};
    asistencias.forEach((a) => {
      // Usar el alias "inscripcion"
      resultadoFormateado[a.inscripcion.id_cliente] = a.presente
        ? "presente"
        : "ausente";
    });

    res.json(resultadoFormateado);
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

export const UR_AsistenciaCliente_CTS = async (req, res) => {
  try {
    const { id_cliente, fecha, presente } = req.body;

    // 1. Validar datos de entrada
    if (!id_cliente || !fecha || presente === undefined) {
      return res.status(400).json({
        mensajeError: "Faltan datos requeridos (id_cliente, fecha, presente).",
      });
    }

    // 2. Encontrar la inscripción del cliente
    const inscripcion = await InscripcionesPilatesModel.findOne({
      where: { id_cliente },
    });

    if (!inscripcion) {
      return res.status(404).json({
        mensajeError:
          "No se encontró una inscripción para el cliente especificado.",
      });
    }

    // 3. Actualizar el registro de asistencia
    const [updated] = await AsistenciasPilatesModel.update(
      { presente },
      {
        where: {
          id_inscripcion: inscripcion.id,
          fecha: fecha,
        },
      }
    );

    if (updated === 0) {
      return res.status(404).json({
        mensajeError:
          "No se encontró un registro de asistencia para esa fecha. Asegúrese de que la tarea automática se haya ejecutado.",
      });
    }

    res.json({ message: "Asistencia actualizada correctamente." });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

export const crearAsistenciasDiariasAusentes = async () => {
  // MODO AUTOMÁTICO (por defecto):
/*   const fechaActual = new Date();
  const hoy = fechaActual.toISOString().slice(0, 10);
  const diasSemana = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const diaActual = diasSemana[fechaActual.getDay()];
  console.log(`[CRON] Iniciando tarea de creación de asistencias para la fecha: ${hoy} (${diaActual})`); */

  /*
  // MODO MANUAL: Descomenta las siguientes líneas y comenta las 5 líneas de arriba para usar día y fecha personalizados
  // const hoy = "2025-10-07"; // Escribe la fecha deseada en formato YYYY-MM-DD
  // const diaActual = "martes"; // Escribe el día en minúsculas: lunes, martes, miércoles, jueves, viernes
  // console.log(`[CRON] MODO MANUAL: Creando asistencias para la fecha: ${hoy} (${diaActual})`);
  // const diasSemana = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]; // Solo si necesitas el array
  // const fechaActual = new Date(hoy); // Solo si necesitas el objeto Date
  */

  const hoy = "2025-10-17"; // Escribe la fecha deseada en formato YYYY-MM-DD
  const diaActual = "viernes"; // Escribe el día en minúsculas: lunes, martes, miércoles, jueves, viernes
  console.log(`[CRON] MODO MANUAL: Creando asistencias para la fecha: ${hoy} (${diaActual})`);
  const diasSemana = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]; // Solo si necesitas el array
  const fechaActual = new Date(hoy); // Solo si necesitas el objeto Date

  // Definir grupos
  const grupoLMV = ["lunes", "miércoles", "viernes"];
  const grupoMJ = ["martes", "jueves"];

  // Determinar grupo del día actual
  let diasGrupo = [];
  if (grupoLMV.includes(diaActual)) {
    diasGrupo = grupoLMV;
  } else if (grupoMJ.includes(diaActual)) {
    diasGrupo = grupoMJ;
  } else {
    // Sábado o domingo: no hacer nada
    const mensaje = `Hoy es ${diaActual}. No se generan asistencias para fines de semana.`;
    console.log(`[CRON] ${mensaje}`);
    return mensaje;
  }

  try {
    // Verificar si ya se generaron asistencias para hoy
    const asistenciasHoy = await db.query(
      "SELECT 1 FROM asistencias_pilates WHERE fecha = :fecha LIMIT 1",
      {
        replacements: { fecha: hoy },
        type: QueryTypes.SELECT,
      }
    );
    if (asistenciasHoy.length > 0) {
      const mensaje = `La tarea para ${hoy} ya fue completada anteriormente. No se realiza ninguna acción.`;
      console.log(`[CRON] ${mensaje}`);
      return mensaje;
    }

    // Buscar horarios que pertenezcan al grupo del día actual
    // El campo correcto es 'dia_semana' y los valores son en mayúsculas en la base
    const diasGrupoMayus = diasGrupo.map(d => d.toUpperCase());
    const horarios = await db.query(
      `SELECT id FROM horarios_pilates WHERE dia_semana IN (:diasGrupo)`,
      {
        replacements: { diasGrupo: diasGrupoMayus },
        type: QueryTypes.SELECT,
      }
    );
    if (horarios.length === 0) {
      const mensaje = `No se encontraron horarios para el grupo (${diasGrupoMayus.join(", ")}).`;
      console.log(`[CRON] ${mensaje}`);
      return mensaje;
    }
    const horarioIds = horarios.map(h => h.id);

    // Buscar inscripciones asociadas a esos horarios
    const inscripciones = await db.query(
      "SELECT id FROM inscripciones_pilates WHERE id_horario IN (:horarioIds)",
      {
        replacements: { horarioIds },
        type: QueryTypes.SELECT,
      }
    );
    if (inscripciones.length === 0) {
      const mensaje = `No se encontraron inscripciones activas para los horarios del grupo (${diasGrupoMayus.join(", ")}).`;
      console.log(`[CRON] ${mensaje}`);
      return mensaje;
    }

    const valoresAInsertar = inscripciones.map((inscripcion) => ({
      id_inscripcion: inscripcion.id,
      fecha: hoy,
      presente: false,
    }));

    await db.getQueryInterface().bulkInsert("asistencias_pilates", valoresAInsertar);

    const mensaje = `Tarea completada: Se crearon ${valoresAInsertar.length} registros de asistencia para la fecha ${hoy} (${diaActual}) (grupo: ${diasGrupoMayus.join(", ")}).`;
    console.log(`[CRON] ${mensaje}`);
    return mensaje;
  } catch (error) {
    console.error("[CRON] Error durante la ejecución de la tarea programada:", error);
    throw error;
  }
};
/*
 * GET /asistencias-pilates/ausencias-mensuales?id_sede=X&fecha=YYYY-MM-DD
 * Devuelve los alumnos de una sede con sus ausencias del mes correspondiente a la fecha
 */
export const OBRS_AusenciasMensualesPorSede_CTS = async (req, res) => {
  try {
    // single-site: id_sede no es requerido ni usado
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({
        mensajeError: "El parámetro 'fecha' es requerido.",
      });
    }

    // Validar formato de fecha
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return res.status(400).json({
        mensajeError: "El formato de fecha debe ser YYYY-MM-DD.",
      });
    }

    // Obtener el año y mes de la fecha
    const fechaObj = new Date(fecha);
    const año = fechaObj.getFullYear();
    const mes = fechaObj.getMonth() + 1; // getMonth() devuelve 0-11

    // 1. Obtener todos los horarios (single-site)
    const horarios = await HorariosPilatesModel.findAll({
      attributes: ["id"],
      raw: true,
    });

    if (horarios.length === 0) {
      return res.json([]);
    }

    const horarioIds = horarios.map((h) => h.id);

    // 2. Obtener inscripciones de esos horarios
    const inscripciones = await InscripcionesPilatesModel.findAll({
      where: { id_horario: { [Op.in]: horarioIds } },
      attributes: ["id", "id_cliente"],
      raw: true,
    });

    if (inscripciones.length === 0) {
      return res.json([]);
    }

    const inscripcionIds = inscripciones.map((i) => i.id);
    const clienteIds = [...new Set(inscripciones.map((i) => i.id_cliente))];

    // 3. Obtener asistencias del mes (solo ausencias)
    const asistencias = await AsistenciasPilatesModel.findAll({
      where: {
        id_inscripcion: { [Op.in]: inscripcionIds },
        fecha: {
          [Op.and]: [
            literal(`YEAR(fecha) = ${año}`),
            literal(`MONTH(fecha) = ${mes}`),
          ],
        },
        presente: false,
      },
      attributes: ["id_inscripcion"],
      raw: true,
    });

    // 4. Contar ausencias por cliente
    const ausenciasPorCliente = {};
    asistencias.forEach((asistencia) => {
      const inscripcion = inscripciones.find(
        (i) => i.id === asistencia.id_inscripcion
      );
      if (inscripcion) {
        const clienteId = inscripcion.id_cliente;
        ausenciasPorCliente[clienteId] =
          (ausenciasPorCliente[clienteId] || 0) + 1;
      }
    });
    // 5. Obtener datos completos de los clientes
    const clientes = await ClientesPilatesModel.findAll({
      where: { id: { [Op.in]: clienteIds } },
      attributes: ["id", "nombre", "telefono", "contactado", "fecha_contacto", "id_usuario_contacto"],
      raw: true,
    });

    // Obtener nombres de usuarios de contacto si existen
    const userIds = [
      ...new Set(
        clientes
          .map((c) => c.id_usuario_contacto)
          .filter((v) => v !== null && v !== undefined)
      ),
    ];

    let usuariosMap = {};
    if (userIds.length > 0) {
      const usuarios = await UsersModel.findAll({
        where: { id: { [Op.in]: userIds } },
        attributes: ["id", "name"],
        raw: true,
      });
      usuariosMap = usuarios.reduce((acc, u) => {
        acc[u.id] = u.name;
        return acc;
      }, {});
    }

    // 6. Formatear resultado
    const resultado = clientes.map((cliente) => {
      return {
        id: cliente.id,
        nombre: cliente.nombre.trim().toUpperCase(),
        telefono: cliente.telefono ? cliente.telefono.trim() : null,
        contactado: !!cliente.contactado,
        fecha_contacto: cliente.fecha_contacto
          ? (() => {
              const d = new Date(cliente.fecha_contacto);
              const pad = (n) => String(n).padStart(2, "0");
              return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(
                d.getHours()
              )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
            })()
          : null,
        cantidad_ausentes: ausenciasPorCliente[cliente.id] || 0,
        // en vez del id, devolvemos el nombre del usuario de contacto (si existe)
        contacto_usuario_nombre: cliente.id_usuario_contacto
          ? usuariosMap[cliente.id_usuario_contacto] || null
          : null,
      };
    });

    // 7. Ordenar por cantidad de ausentes descendente
    resultado.sort((a, b) => {
      if (b.cantidad_ausentes !== a.cantidad_ausentes) {
        return b.cantidad_ausentes - a.cantidad_ausentes;
      }
      return a.nombre.localeCompare(b.nombre);
    });

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

/**
 * [DEBUG] Endpoint para disparar manualmente la creación de asistencias diarias.
 */
export const DEBUG_DispararCreacionAsistencias_CTS = async (req, res) => {
  try {
    console.log(
      "[DEBUG] Se ha solicitado la ejecución manual de la tarea de asistencias."
    );
    const resultado = await crearAsistenciasDiariasAusentes();
    res.status(200).json({
      message: "Ejecución de tarea manual completada.",
      details: resultado,
    });
  } catch (error) {
    res.status(500).json({
      mensajeError: "Falló la ejecución manual de la tarea.",
      error: error.message,
    });
  }
};
