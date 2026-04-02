import ListaEsperaPilates from "../Models/MD_TB_ListaEsperaPilates.js";
import ContactosListaEsperaPilatesModel from "../Models/MD_TB_ContactosListaEsperaPilates.js";
import UsersModel from "../Models/Core/MD_TB_Users.js";

const normalizeForComparison = (value = "") =>
  value
    .toString()
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[^A-Z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const PLAN_CANONICAL_MAP = {
  LUNES: "LUNES",
  MARTES: "MARTES",
  MIERCOLES: "MIÉRCOLES",
  JUEVES: "JUEVES",
  VIERNES: "VIERNES",
  SABADO: "SÁBADO",
  "CUALQUIER DIA": "CUALQUIER DIA",
};

const getCanonicalPlan = (value = "") => {
  const normalized = normalizeForComparison(value);
  return PLAN_CANONICAL_MAP[normalized] || null;
};

const VALID_PLANES = Object.values(PLAN_CANONICAL_MAP);

// Obtener todos
// Endpoint: GET /lista_espera_pilates?sedeId=<id>
// - Permite filtrar por `id_sede` opcionalmente.
// - Devuelve la lista de espera ordenada por prioridad ("Cambio de turno" primero)
//   y por `fecha_carga` en caso de empate.
// - Para cada elemento, adjunta un array `contacto_cliente` con los intentos de
//   contacto registrados; cada contacto incluye además `nombre_usuario_contacto`
//   resuelto desde la tabla `users` (si existe).
export const OBRS_ListaEsperaPilates = async (req, res) => {
  try {
    // single-site: no filtramos por sede (compatibilidad: si llega sedeId se ignora)
    const whereCondition = {};

    // Obtener registros de la lista de espera con el orden deseado.
    // Orden interno: primero los registros con tipo 'Cambio de turno', luego 'Espera'.
    // En caso de empate en prioridad, ordenar por fecha_carga ascendente.
    const lista = await ListaEsperaPilates.findAll({
      where: whereCondition,
      order: [
        [
          ListaEsperaPilates.sequelize.literal(
            "CASE WHEN tipo = 'Cambio de turno' THEN 1 ELSE 2 END"
          ),
          "ASC",
        ],
        ["fecha_carga", "ASC"],
      ],
    });

  // Obtener los ids de la lista devuelta para luego buscar los contactos
  const listaIds = lista.map((l) => l.id);

    // Buscar contactos relacionados a las listas obtenidas y mapear el nombre del usuario
    // para cada intento de contacto. Hacemos esto en dos pasos para evitar problemas
    // con asociaciones Sequelize no registradas en tiempo de ejecución:
    // 1) Traemos todos los contactos cuyo id_lista_espera está en listaIds.
    // 2) Extraemos los id_usuario_contacto únicos y consultamos la tabla users
    //    en una sola query para obtener los nombres.
    // 3) Añadimos campo `nombre_usuario_contacto` en cada objeto de contacto.
    let contactosPorLista = {};
    if (listaIds.length > 0) {
      const contactos = await ContactosListaEsperaPilatesModel.findAll({
        where: { id_lista_espera: listaIds },
        order: [["fecha_contacto", "DESC"]], // opcional: últimos primero
      });

      // Obtener los ids únicos de usuarios para consultar nombres en una sola query
      const userIds = Array.from(
        new Set(contactos.map((c) => (c.get ? c.get({ plain: true }) : c).id_usuario_contacto))
      ).filter(Boolean);

      // Map (id -> name) para lookup rápido
      let usersMap = {};
      if (userIds.length > 0) {
        const users = await UsersModel.findAll({
          where: { id: userIds },
          attributes: ["id", "name"],
        });
        usersMap = users.reduce((m, u) => {
          const up = u.get ? u.get({ plain: true }) : u;
          m[up.id] = up.name;
          return m;
        }, {});
      }

      // Agrupar por id_lista_espera y agregar nombre_usuario_contacto
      contactosPorLista = contactos.reduce((acc, c) => {
        const contactoPlain = c.get ? c.get({ plain: true }) : c;
        const key = contactoPlain.id_lista_espera;
        if (!acc[key]) acc[key] = [];
        contactoPlain.nombre_usuario_contacto = usersMap[contactoPlain.id_usuario_contacto] || null;
        acc[key].push(contactoPlain);
        return acc;
      }, {});
    }

    // Mapear la lista principal y adjuntar, si existen, los contactos agrupados por lista
    // en la propiedad `contacto_cliente`.
    const listaConContactos = lista.map((item) => {
      const plain = item.get ? item.get({ plain: true }) : item;
      const contactos = contactosPorLista[plain.id];
      if (contactos && contactos.length > 0) {
        // Añadimos 'contacto_cliente' como array de objetos con nombre de usuario resuelto
        return { ...plain, contacto_cliente: contactos };
      }
      return plain;
    });

    res.json(listaConContactos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener uno por ID
export const OBR_ListaEsperaPilates = async (req, res) => {
  try {
    const item = await ListaEsperaPilates.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: "No encontrado" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Alta
export const CR_ListaEsperaPilates = async (req, res) => {
  try {
    // DTO y validaciones
    const {
      nombre,
      contacto,
      tipo,
      plan_interes,
      horarios_preferidos,
      observaciones,
      id_sede,
    } = req.body;

    // Validaciones obligatorias
    if (
      id_sede &&
      (!/^\d+$/.test(id_sede.toString()) || parseInt(id_sede) <= 0)
    ) {
      return res
        .status(400)
        .json({ error: "id_sede debe ser un número positivo." });
    }
    if (!nombre || typeof nombre !== "string" || nombre.trim() === "") {
      return res
        .status(400)
        .json({ error: "El nombre es obligatorio y debe ser texto." });
    }
    if (!tipo || !["Espera", "Cambio de turno"].includes(tipo)) {
      return res.status(400).json({
        error:
          'El tipo es obligatorio y debe ser "Espera" o "Cambio de turno".',
      });
    }
    const canonicalPlan = getCanonicalPlan(plan_interes);
    if (!canonicalPlan) {
      return res.status(400).json({
        error: `El plan_interes es obligatorio y debe ser uno de: ${VALID_PLANES.join(", ")}.`,
      });
    }
    if (contacto && typeof contacto !== "string") {
      return res.status(400).json({ error: "El contacto debe ser texto." });
    }
    if (horarios_preferidos && typeof horarios_preferidos !== "string") {
      return res
        .status(400)
        .json({ error: "horarios_preferidos debe ser texto." });
    }
    if (observaciones && typeof observaciones !== "string") {
      return res.status(400).json({ error: "observaciones debe ser texto." });
    }

    // Crear DTO limpio
    const dto = {
      nombre: nombre.trim().toUpperCase(),
      contacto: contacto ? contacto.trim().toUpperCase() : null,
      tipo,
  plan_interes: canonicalPlan,
      horarios_preferidos: horarios_preferidos
        ? horarios_preferidos.trim().toUpperCase()
        : null,
      observaciones: observaciones ? observaciones.trim().toUpperCase() : null,
      // id_sede removed for single-site
    };

    const nuevo = await ListaEsperaPilates.create(dto);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Modificación
export const UR_ListaEsperaPilates = async (req, res) => {
  try {
    const {
      nombre,
      contacto,
      tipo,
      plan_interes,
      horarios_preferidos,
      observaciones,
    } = req.body;

    // Validaciones obligatorias
    if (!nombre || typeof nombre !== "string" || nombre.trim() === "") {
      return res
        .status(400)
        .json({ error: "El nombre es obligatorio y debe ser texto." });
    }
    if (!tipo || !["Espera", "Cambio de turno"].includes(tipo)) {
      return res.status(400).json({
        error:
          'El tipo es obligatorio y debe ser "Espera" o "Cambio de turno".',
      });
    }
    const canonicalPlan = getCanonicalPlan(plan_interes);
    if (!canonicalPlan) {
      return res.status(400).json({
        error: `El plan_interes es obligatorio y debe ser uno de: ${VALID_PLANES.join(", ")}.`,
      });
    }
    if (contacto && typeof contacto !== "string") {
      return res.status(400).json({ error: "El contacto debe ser texto." });
    }
    if (horarios_preferidos && typeof horarios_preferidos !== "string") {
      return res
        .status(400)
        .json({ error: "horarios_preferidos debe ser texto." });
    }
    if (observaciones && typeof observaciones !== "string") {
      return res.status(400).json({ error: "observaciones debe ser texto." });
    }

    // Crear DTO limpio
    const dto = {
      nombre: nombre.trim().toUpperCase(),
      contacto: contacto ? contacto.trim().toUpperCase() : null,
      tipo,
  plan_interes: canonicalPlan,
      horarios_preferidos: horarios_preferidos
        ? horarios_preferidos.trim().toUpperCase()
        : null,
      observaciones: observaciones ? observaciones.trim().toUpperCase() : null,
    };

    const actualizado = await ListaEsperaPilates.update(dto, {
      where: { id: req.params.id },
    });
    if (actualizado[0] === 0)
      return res.status(404).json({ error: "No encontrado" });
    res.json({ message: "Actualizado" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Baja
export const ER_ListaEsperaPilates = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: "ID inválido." });
    }
    const eliminado = await ListaEsperaPilates.destroy({
      where: { id },
    });
    if (!eliminado) return res.status(404).json({ error: "No encontrado" });
    res.json({ message: "Eliminado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
