/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 19 / 06 / 2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (CTS_TB_StudentRM.js) contiene controladores para manejar operaciones CRUD en el modelo Sequelize de student_rms.
 *
 * Tema: Controladores - Student RM
 *
 * Capa: Backend
 *
 * Nomenclatura: OBR_ obtenerRegistro
 *               OBRS_obtenerRegistros(plural)
 *               CR_ crearRegistro
 *               ER_ eliminarRegistro
 */

// Importa el modelo de RM
import StudentRMModel from '../Models/MD_TB_StudentRM.js';
import { Op } from 'sequelize';

/* Benjamin Orellana - 2026/04/11 - Helpers de negocio para cálculo, validación y análisis de RM */
const MAX_REPS_ALLOWED = Number(process.env.RM_MAX_REPS_ALLOWED || 20);
const MAX_WEIGHT_ALLOWED = Number(process.env.RM_MAX_WEIGHT_ALLOWED || 500);
const MAX_SUSPICIOUS_JUMP_PCT = Number(
  process.env.RM_MAX_SUSPICIOUS_JUMP_PCT || 60
);
const MAX_ABSOLUTE_RM_ALLOWED = Number(
  process.env.RM_MAX_ABSOLUTE_RM_ALLOWED || 450
);

const round2 = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.round((n + Number.EPSILON) * 100) / 100;
};

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const toIntOrNull = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const n = parseInt(value, 10);
  return Number.isInteger(n) ? n : null;
};

const normalizeEjercicio = (value = '') =>
  String(value).trim().replace(/\s+/g, ' ');

const normalizeComentario = (value) => {
  if (value === null || value === undefined) return null;
  const txt = String(value).trim();
  return txt.length ? txt : null;
};

const dateKeyFromDate = (date = new Date()) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const buildFechaPayload = (fechaInput) => {
  if (!fechaInput) {
    const now = new Date();
    return {
      fecha: now,
      fecha_dia: dateKeyFromDate(now)
    };
  }

  if (
    typeof fechaInput === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(fechaInput)
  ) {
    return {
      fecha: `${fechaInput} 12:00:00`,
      fecha_dia: fechaInput
    };
  }

  const parsed = new Date(fechaInput);

  if (Number.isNaN(parsed.getTime())) {
    const now = new Date();
    return {
      fecha: now,
      fecha_dia: dateKeyFromDate(now)
    };
  }

  return {
    fecha: parsed,
    fecha_dia: dateKeyFromDate(parsed)
  };
};

const calcularRmEstimada = (pesoLevantado, repeticiones) => {
  const peso = toNumberOrNull(pesoLevantado);
  const reps = toIntOrNull(repeticiones);

  if (!peso || !reps || reps <= 0) return null;
  if (reps === 1) return round2(peso);

  return round2(peso * (1 + reps / 30));
};

const calcularVolumen = (pesoLevantado, repeticiones) => {
  const peso = toNumberOrNull(pesoLevantado);
  const reps = toIntOrNull(repeticiones);
  if (!peso || !reps) return null;
  return round2(peso * reps);
};

const getConfiabilidadRM = (repeticiones) => {
  const reps = toIntOrNull(repeticiones);

  if (!reps) return 'sin_datos';
  if (reps <= 5) return 'alta';
  if (reps <= 10) return 'media';
  if (reps <= 15) return 'baja';
  return 'muy_baja';
};

const buildRegistroEnriquecido = (registro) => {
  const row = registro?.get ? registro.get({ plain: true }) : { ...registro };

  const peso_levantado = toNumberOrNull(row.peso_levantado);
  const repeticiones = toIntOrNull(row.repeticiones);
  const rmFromDb = toNumberOrNull(row.rm_estimada);
  const rm_estimada =
    rmFromDb !== null
      ? rmFromDb
      : calcularRmEstimada(peso_levantado, repeticiones);

  return {
    ...row,
    ejercicio: normalizeEjercicio(row.ejercicio),
    peso_levantado,
    repeticiones,
    rm_estimada,
    volumen_estimado: calcularVolumen(peso_levantado, repeticiones),
    intensidad_relativa_pct:
      peso_levantado && rm_estimada
        ? round2((peso_levantado / rm_estimada) * 100)
        : null,
    confiabilidad_rm: getConfiabilidadRM(repeticiones)
  };
};

const averageRm = (rows = []) => {
  const valid = rows.filter((r) => Number.isFinite(r.rm_estimada));
  if (!valid.length) return null;

  return round2(
    valid.reduce((acc, item) => acc + item.rm_estimada, 0) / valid.length
  );
};

const getBestRegistro = (rows = []) => {
  const valid = rows.filter((r) => Number.isFinite(r.rm_estimada));
  if (!valid.length) return null;

  return valid.reduce((best, current) =>
    !best || current.rm_estimada > best.rm_estimada ? current : best
  , null);
};

const diffDaysFromNow = (fecha) => {
  if (!fecha) return null;
  const target = new Date(fecha);
  if (Number.isNaN(target.getTime())) return null;

  const now = new Date();
  const ms = now.getTime() - target.getTime();

  return Math.floor(ms / (1000 * 60 * 60 * 24));
};

const buildComparativeInsights = (actual, historialPrevio = []) => {
  const ordenado = [...historialPrevio].sort(
    (a, b) => new Date(a.fecha) - new Date(b.fecha)
  );

  const anterior = ordenado.length ? ordenado[ordenado.length - 1] : null;
  const mejorPrevia = getBestRegistro(ordenado);

  const deltaVsAnterior =
    anterior && actual?.rm_estimada !== null && anterior?.rm_estimada !== null
      ? round2(actual.rm_estimada - anterior.rm_estimada)
      : null;

  const deltaPctVsAnterior =
    anterior &&
    anterior?.rm_estimada &&
    actual?.rm_estimada !== null &&
    anterior.rm_estimada !== 0
      ? round2((deltaVsAnterior / anterior.rm_estimada) * 100)
      : null;

  const deltaVsPR =
    mejorPrevia &&
    actual?.rm_estimada !== null &&
    mejorPrevia?.rm_estimada !== null
      ? round2(actual.rm_estimada - mejorPrevia.rm_estimada)
      : null;

  const deltaPctVsPR =
    mejorPrevia &&
    mejorPrevia?.rm_estimada &&
    actual?.rm_estimada !== null &&
    mejorPrevia.rm_estimada !== 0
      ? round2((deltaVsPR / mejorPrevia.rm_estimada) * 100)
      : null;

  return {
    es_pr:
      !mejorPrevia ||
      (actual?.rm_estimada !== null &&
        mejorPrevia?.rm_estimada !== null &&
        actual.rm_estimada > mejorPrevia.rm_estimada),
    delta_vs_anterior: deltaVsAnterior,
    delta_pct_vs_anterior: deltaPctVsAnterior,
    delta_vs_mejor_previa: deltaVsPR,
    delta_pct_vs_mejor_previa: deltaPctVsPR,
    ultimo_rm_previo: anterior?.rm_estimada ?? null,
    mejor_rm_previo: mejorPrevia?.rm_estimada ?? null
  };
};

const buildHistorySummary = (registros = []) => {
  const historial = [...registros].sort(
    (a, b) => new Date(a.fecha) - new Date(b.fecha)
  );

  if (!historial.length) {
    return {
      total_registros: 0,
      mejor_rm: null,
      ultimo_rm: null,
      primer_rm: null,
      mejora_total_pct: null,
      pr_count: 0,
      promedio_ultimas_3: null,
      consistencia_30_dias: 0,
      tendencia: 'sin_datos',
      dias_desde_ultimo_registro: null
    };
  }

  const latest = historial[historial.length - 1];
  const previous = historial.length > 1 ? historial[historial.length - 2] : null;
  const first = historial[0];
  const best = getBestRegistro(historial);

  let pr_count = 0;
  let bestSoFar = null;

  for (const row of historial) {
    if (!Number.isFinite(row.rm_estimada)) continue;

    if (bestSoFar === null || row.rm_estimada > bestSoFar) {
      pr_count += 1;
      bestSoFar = row.rm_estimada;
    }
  }

  const promedioUltimas3 = averageRm(historial.slice(-3));
  const promedioPrevias3 = averageRm(historial.slice(-6, -3));

  let tendencia = 'sin_datos';

  if (
    promedioUltimas3 !== null &&
    promedioPrevias3 !== null &&
    promedioPrevias3 !== 0
  ) {
    const deltaPromedio = ((promedioUltimas3 - promedioPrevias3) / promedioPrevias3) * 100;

    if (deltaPromedio >= 2) tendencia = 'ascendente';
    else if (deltaPromedio <= -2) tendencia = 'descendente';
    else tendencia = 'estable';
  } else if (
    latest?.rm_estimada !== null &&
    previous?.rm_estimada !== null &&
    previous?.rm_estimada !== 0
  ) {
    const deltaSimple = ((latest.rm_estimada - previous.rm_estimada) / previous.rm_estimada) * 100;

    if (deltaSimple >= 2) tendencia = 'ascendente';
    else if (deltaSimple <= -2) tendencia = 'descendente';
    else tendencia = 'estable';
  }

  const deltaVsAnterior =
    latest?.rm_estimada !== null && previous?.rm_estimada !== null
      ? round2(latest.rm_estimada - previous.rm_estimada)
      : null;

  const deltaPctVsAnterior =
    previous?.rm_estimada && deltaVsAnterior !== null
      ? round2((deltaVsAnterior / previous.rm_estimada) * 100)
      : null;

  const deltaVsPR =
    latest?.rm_estimada !== null && best?.rm_estimada !== null
      ? round2(latest.rm_estimada - best.rm_estimada)
      : null;

  const deltaPctVsPR =
    best?.rm_estimada && deltaVsPR !== null
      ? round2((deltaVsPR / best.rm_estimada) * 100)
      : null;

  const mejoraTotalPct =
    first?.rm_estimada && latest?.rm_estimada !== null && first.rm_estimada !== 0
      ? round2(((latest.rm_estimada - first.rm_estimada) / first.rm_estimada) * 100)
      : null;

  const consistencia_30_dias = historial.filter((r) => {
    const days = diffDaysFromNow(r.fecha);
    return days !== null && days <= 30;
  }).length;

  return {
    total_registros: historial.length,
    mejor_rm: best?.rm_estimada ?? null,
    mejor_fecha: best?.fecha ?? null,
    ultimo_rm: latest?.rm_estimada ?? null,
    ultimo_fecha: latest?.fecha ?? null,
    primer_rm: first?.rm_estimada ?? null,
    primer_fecha: first?.fecha ?? null,
    delta_vs_anterior: deltaVsAnterior,
    delta_pct_vs_anterior: deltaPctVsAnterior,
    delta_vs_pr: deltaVsPR,
    delta_pct_vs_pr: deltaPctVsPR,
    mejora_total_pct: mejoraTotalPct,
    pr_count,
    promedio_ultimas_3: promedioUltimas3,
    consistencia_30_dias,
    tendencia,
    dias_desde_ultimo_registro: diffDaysFromNow(latest?.fecha),
    volumen_ultimo: latest?.volumen_estimado ?? null,
    confiabilidad_ultimo: latest?.confiabilidad_rm ?? 'sin_datos'
  };
};

const detectarRegistroSospechoso = ({
  peso_levantado,
  repeticiones,
  rm_estimada,
  historialPrevio = []
}) => {
  const motivos = [];

  if (peso_levantado !== null && peso_levantado > MAX_WEIGHT_ALLOWED) {
    motivos.push(
      `El peso ingresado (${peso_levantado} kg) supera el máximo permitido (${MAX_WEIGHT_ALLOWED} kg).`
    );
  }

  if (repeticiones !== null && repeticiones > MAX_REPS_ALLOWED) {
    motivos.push(
      `Las repeticiones ingresadas (${repeticiones}) superan el máximo permitido (${MAX_REPS_ALLOWED}).`
    );
  }

  if (rm_estimada !== null && rm_estimada > MAX_ABSOLUTE_RM_ALLOWED) {
    motivos.push(
      `La RM estimada (${rm_estimada} kg) supera el máximo permitido (${MAX_ABSOLUTE_RM_ALLOWED} kg).`
    );
  }

  const mejorPrevia = getBestRegistro(historialPrevio);

  if (
    mejorPrevia?.rm_estimada &&
    rm_estimada !== null &&
    mejorPrevia.rm_estimada > 0
  ) {
    const jumpPct = ((rm_estimada - mejorPrevia.rm_estimada) / mejorPrevia.rm_estimada) * 100;

    if (jumpPct > MAX_SUSPICIOUS_JUMP_PCT) {
      motivos.push(
        `La nueva marca mejora ${round2(jumpPct)}% respecto al PR anterior; parece una carga sospechosa.`
      );
    }
  }

  return {
    esSospechoso: motivos.length > 0,
    motivos
  };
};

const validarPayloadRM = ({ student_id, ejercicio, peso_levantado, repeticiones }) => {
  if (!student_id) return 'student_id es obligatorio.';
  if (!ejercicio) return 'ejercicio es obligatorio.';
  if (peso_levantado === null || peso_levantado <= 0) {
    return 'peso_levantado debe ser mayor a 0.';
  }
  if (!repeticiones || repeticiones <= 0) {
    return 'repeticiones debe ser mayor a 0.';
  }
  return null;
};

const agruparPorEjercicio = (rows = []) =>
  rows.reduce((acc, row) => {
    const key = normalizeEjercicio(row.ejercicio);
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {});

  /* Benjamin Orellana - 2026/04/11 - Listado de RM con filtros, paginación y datos enriquecidos */
export const OBRS_StudentRM_CTS = async (req, res) => {
  try {
    const {
      student_id,
      ejercicio,
      desde,
      hasta,
      page = 1,
      limit = 20
    } = req.query;

    const whereClause = {};

    if (student_id) whereClause.student_id = student_id;

    if (ejercicio) {
      whereClause.ejercicio = {
        [Op.like]: `%${normalizeEjercicio(ejercicio)}%`
      };
    }

    if (desde || hasta) {
      whereClause.fecha_dia = {};
      if (desde) whereClause.fecha_dia[Op.gte] = desde;
      if (hasta) whereClause.fecha_dia[Op.lte] = hasta;
    }

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const offset = (pageNumber - 1) * limitNumber;

    const { count, rows } = await StudentRMModel.findAndCountAll({
      where: whereClause,
      order: [['fecha', 'DESC'], ['id', 'DESC']],
      limit: limitNumber,
      offset
    });

    const registros = rows.map(buildRegistroEnriquecido);

    res.json({
      totalItems: count,
      totalPages: Math.ceil(count / limitNumber),
      currentPage: pageNumber,
      limit: limitNumber,
      registros
    });
  } catch (error) {
    console.error('Error al obtener RMs:', error);
    res.status(500).json({ mensajeError: 'Error al obtener RMs' });
  }
};

// Mostrar un registro específico de RM por su ID
export const OBR_StudentRM_CTS = async (req, res) => {
  try {
    const registro = await StudentRMModel.findByPk(req.params.id);
    if (registro) {
      res.json(registro);
    } else {
      res.status(404).json({ mensajeError: 'RM no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

/* Benjamin Orellana - 2026/04/11 - Alta de RM con cálculo automático, validaciones y análisis inmediato */
export const CR_StudentRM_CTS = async (req, res) => {
  try {
    const student_id = toIntOrNull(req.body.student_id);
    const ejercicio = normalizeEjercicio(req.body.ejercicio);
    const peso_levantado = toNumberOrNull(req.body.peso_levantado);
    const repeticiones = toIntOrNull(req.body.repeticiones);
    const comentario = normalizeComentario(req.body.comentario);
    const { fecha, fecha_dia } = buildFechaPayload(req.body.fecha);

    const mensajeValidacion = validarPayloadRM({
      student_id,
      ejercicio,
      peso_levantado,
      repeticiones
    });

    if (mensajeValidacion) {
      return res.status(400).json({ mensajeError: mensajeValidacion });
    }

    const existe = await StudentRMModel.findOne({
      where: {
        student_id,
        ejercicio,
        fecha_dia
      }
    });

    if (existe) {
      return res.status(409).json({
        mensajeError:
          'Ya existe un registro de este ejercicio para ese alumno en esa fecha.'
      });
    }

    const historialPrevioRows = await StudentRMModel.findAll({
      where: {
        student_id,
        ejercicio
      },
      order: [['fecha', 'ASC'], ['id', 'ASC']]
    });

    const historialPrevio = historialPrevioRows.map(buildRegistroEnriquecido);
    const rm_estimada = calcularRmEstimada(peso_levantado, repeticiones);

    const diagnostico = detectarRegistroSospechoso({
      peso_levantado,
      repeticiones,
      rm_estimada,
      historialPrevio
    });

    if (diagnostico.esSospechoso) {
      return res.status(422).json({
        mensajeError:
          'El registro fue detectado como sospechoso. Revisá el peso o las repeticiones ingresadas.',
        motivos: diagnostico.motivos
      });
    }

    const registro = await StudentRMModel.create({
      student_id,
      ejercicio,
      peso_levantado,
      repeticiones,
      rm_estimada,
      fecha,
      comentario
    });

    const registroEnriquecido = buildRegistroEnriquecido(registro);
    const comparativa = buildComparativeInsights(
      registroEnriquecido,
      historialPrevio
    );
    const resumen_ejercicio = buildHistorySummary([
      ...historialPrevio,
      registroEnriquecido
    ]);

    res.json({
      message: 'RM creado correctamente',
      registro: registroEnriquecido,
      comparativa,
      resumen_ejercicio
    });
  } catch (error) {
    console.error('Error al crear RM:', error);

    if (error?.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        mensajeError:
          'Ya existe un registro para ese alumno, ejercicio y fecha.'
      });
    }

    res.status(500).json({ mensajeError: error.message });
  }
};
// Eliminar un RM por su ID
export const ER_StudentRM_CTS = async (req, res) => {
  try {
    const deletedCount = await StudentRMModel.destroy({
      where: { id: req.params.id }
    });
    if (deletedCount === 1) {
      res.json({ message: 'RM eliminado correctamente' });
    } else {
      res.status(404).json({ mensajeError: 'RM no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

/* Benjamin Orellana - 2026/04/11 - Actualización de RM con recálculo automático y revalidación del historial */
export const UR_StudentRM_CTS = async (req, res) => {
  try {
    const { id } = req.params;

    const actual = await StudentRMModel.findByPk(id);

    if (!actual) {
      return res.status(404).json({ mensajeError: 'RM no encontrado' });
    }

    const actualPlain = actual.get({ plain: true });

    const student_id = toIntOrNull(
      req.body.student_id ?? actualPlain.student_id
    );
    const ejercicio = normalizeEjercicio(
      req.body.ejercicio ?? actualPlain.ejercicio
    );
    const peso_levantado = toNumberOrNull(
      req.body.peso_levantado ?? actualPlain.peso_levantado
    );
    const repeticiones = toIntOrNull(
      req.body.repeticiones ?? actualPlain.repeticiones
    );
    const comentario = normalizeComentario(
      req.body.comentario ?? actualPlain.comentario
    );

    const fechaInfo = buildFechaPayload(req.body.fecha ?? actualPlain.fecha);
    const { fecha, fecha_dia } = fechaInfo;

    const mensajeValidacion = validarPayloadRM({
      student_id,
      ejercicio,
      peso_levantado,
      repeticiones
    });

    if (mensajeValidacion) {
      return res.status(400).json({ mensajeError: mensajeValidacion });
    }

    const duplicado = await StudentRMModel.findOne({
      where: {
        student_id,
        ejercicio,
        fecha_dia,
        id: { [Op.ne]: id }
      }
    });

    if (duplicado) {
      return res.status(409).json({
        mensajeError:
          'Ya existe otro registro de este ejercicio para ese alumno en esa fecha.'
      });
    }

    const historialPrevioRows = await StudentRMModel.findAll({
      where: {
        student_id,
        ejercicio,
        id: { [Op.ne]: id }
      },
      order: [['fecha', 'ASC'], ['id', 'ASC']]
    });

    const historialPrevio = historialPrevioRows.map(buildRegistroEnriquecido);
    const rm_estimada = calcularRmEstimada(peso_levantado, repeticiones);

    const diagnostico = detectarRegistroSospechoso({
      peso_levantado,
      repeticiones,
      rm_estimada,
      historialPrevio
    });

    if (diagnostico.esSospechoso) {
      return res.status(422).json({
        mensajeError:
          'La actualización fue detectada como sospechosa. Revisá el peso o las repeticiones.',
        motivos: diagnostico.motivos
      });
    }

    await actual.update({
      student_id,
      ejercicio,
      peso_levantado,
      repeticiones,
      rm_estimada,
      fecha,
      comentario
    });

    const registroActualizado = buildRegistroEnriquecido(actual);
    const comparativa = buildComparativeInsights(
      registroActualizado,
      historialPrevio
    );
    const resumen_ejercicio = buildHistorySummary([
      ...historialPrevio,
      registroActualizado
    ]);

    res.json({
      message: 'RM actualizado correctamente',
      registroActualizado,
      comparativa,
      resumen_ejercicio
    });
  } catch (error) {
    console.error('Error al actualizar RM:', error);

    if (error?.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        mensajeError:
          'Ya existe un registro para ese alumno, ejercicio y fecha.'
      });
    }

    res.status(500).json({ mensajeError: error.message });
  }
};
/* Benjamin Orellana - 2026/04/11 - Historial enriquecido por ejercicio con métricas listas para gráfico y cards */
export const OBRS_HistorialRM_CTS = async (req, res) => {
  try {
    const { student_id, ejercicio } = req.query;

    if (!student_id || !ejercicio) {
      return res.status(400).json({
        mensajeError: 'Faltan parámetros (student_id o ejercicio).'
      });
    }

    const historialRows = await StudentRMModel.findAll({
      where: {
        student_id,
        ejercicio: normalizeEjercicio(ejercicio)
      },
      order: [['fecha', 'ASC'], ['id', 'ASC']]
    });

    const historial = historialRows.map(buildRegistroEnriquecido);
    const resumen = buildHistorySummary(historial);

    const top_marcas = [...historial]
      .filter((r) => Number.isFinite(r.rm_estimada))
      .sort((a, b) => b.rm_estimada - a.rm_estimada)
      .slice(0, 5);

    res.json({
      resumen,
      historial,
      top_marcas
    });
  } catch (error) {
    console.error('Error al obtener historial de RM:', error);
    res.status(500).json({ mensajeError: 'Error al obtener historial' });
  }
};

/* Benjamin Orellana - 2026/04/11 - Dashboard global de RM por alumno con métricas agrupadas por ejercicio */
export const OBR_DashboardStudentRM_CTS = async (req, res) => {
  try {
    const { student_id } = req.query;

    if (!student_id) {
      return res.status(400).json({
        mensajeError: 'student_id es obligatorio.'
      });
    }

    const rows = await StudentRMModel.findAll({
      where: { student_id },
      order: [['fecha', 'ASC'], ['id', 'ASC']]
    });

    const registros = rows.map(buildRegistroEnriquecido);

    if (!registros.length) {
      return res.json({
        resumen_general: {
          total_registros: 0,
          total_ejercicios: 0,
          total_prs: 0,
          mejor_rm_general: null,
          ejercicio_top_rm: null,
          registros_30_dias: 0
        },
        ejercicios: []
      });
    }

    const grouped = agruparPorEjercicio(registros);

    const ejercicios = Object.entries(grouped)
      .map(([nombreEjercicio, lista]) => {
        const resumen = buildHistorySummary(lista);
        const mejor_registro = getBestRegistro(lista);
        const ultimo_registro = lista[lista.length - 1];

        return {
          ejercicio: nombreEjercicio,
          resumen,
          mejor_registro,
          ultimo_registro
        };
      })
      .sort((a, b) => {
        const rmA = a?.resumen?.mejor_rm ?? 0;
        const rmB = b?.resumen?.mejor_rm ?? 0;
        return rmB - rmA;
      });

    const mejorGlobal = getBestRegistro(registros);
    const totalPRs = ejercicios.reduce(
      (acc, item) => acc + (item?.resumen?.pr_count || 0),
      0
    );

    const registros_30_dias = registros.filter((r) => {
      const days = diffDaysFromNow(r.fecha);
      return days !== null && days <= 30;
    }).length;

    res.json({
      resumen_general: {
        total_registros: registros.length,
        total_ejercicios: ejercicios.length,
        total_prs: totalPRs,
        mejor_rm_general: mejorGlobal?.rm_estimada ?? null,
        ejercicio_top_rm: mejorGlobal?.ejercicio ?? null,
        registros_30_dias
      },
      ejercicios
    });
  } catch (error) {
    console.error('Error al obtener dashboard de RM:', error);
    res.status(500).json({
      mensajeError: 'Error al obtener dashboard de RM'
    });
  }
};