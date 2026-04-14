/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 13 / 04 / 2026
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (CTS_TB_AlianzasOportunidades.js) contiene controladores para manejar
 * operaciones CRUD, detalle ampliado y registro público transaccional del módulo
 * alianzas_oportunidades.
 *
 * Tema: Controladores - Alianzas Oportunidades
 * Capa: Backend
 */

import { Op } from 'sequelize';
import db from '../../DataBase/db.js';
import AlianzasOportunidadesModel from '../../Models/Empresas/MD_TB_AlianzasOportunidades.js';
import AlianzasEmpresasModel from '../../Models/Empresas/MD_TB_AlianzasEmpresas.js';
import AlianzasContactosModel from '../../Models/Empresas/MD_TB_AlianzasContactos.js';
import AlianzasEspaciosModel from '../../Models/Empresas/MD_TB_AlianzasEspacios.js';
import AlianzasOportunidadEspaciosModel from '../../Models/Empresas/MD_TB_AlianzasOportunidadEspacios.js';
import AlianzasNotasModel from '../../Models/Empresas/MD_TB_AlianzasNotas.js';
import UsersModel from '../../Models/Core/MD_TB_Users.js';

/* ===========================
 * Helpers
 * =========================== */

// Benjamin Orellana - 2026/04/13 - Resuelve el usuario actor desde distintas formas de autenticación.
const getActorUserId = (req) => {
  return (
    req?.user?.id ||
    req?.usuario?.id ||
    req?.auth?.id ||
    req?.body?.updated_by ||
    req?.body?.created_by ||
    null
  );
};

// Benjamin Orellana - 2026/04/13 - Convierte valores de query string a booleano numérico cuando corresponde.
const parseBooleanToTinyInt = (value) => {
  if (
    value === true ||
    value === 'true' ||
    value === '1' ||
    value === 1 ||
    value === 'si' ||
    value === 'sí'
  ) {
    return 1;
  }

  if (
    value === false ||
    value === 'false' ||
    value === '0' ||
    value === 0 ||
    value === 'no'
  ) {
    return 0;
  }

  return null;
};

// Benjamin Orellana - 2026/04/13 - Limpia strings vacíos para evitar guardar basura.
const cleanNullableString = (value) => {
  if (value === undefined || value === null) return null;
  const normalized = String(value).trim();
  return normalized === '' ? null : normalized;
};

// Benjamin Orellana - 2026/04/13 - Define atributos seguros de usuario para includes sin password.
const SAFE_USER_ATTRIBUTES = [
  'id',
  'name',
  'email',
  'level',
  'rol',
  'sede',
  'sede_id',
  'state',
  'created_at',
  'updated_at'
];

// Benjamin Orellana - 2026/04/13 - Includes resumidos para listados y consultas simples.
const buildBasicIncludes = () => [
  {
    model: AlianzasEmpresasModel,
    as: 'empresa',
    required: false
  },
  {
    model: AlianzasContactosModel,
    as: 'contacto_principal',
    required: false
  },
  {
    model: UsersModel,
    as: 'staff_responsable',
    required: false,
    attributes: SAFE_USER_ATTRIBUTES
  }
];

// Benjamin Orellana - 2026/04/13 - Includes completos para la vista de detalle operacional.
const buildDetailIncludes = () => [
  {
    model: AlianzasEmpresasModel,
    as: 'empresa',
    required: false,
    include: [
      {
        model: AlianzasContactosModel,
        as: 'contactos',
        required: false
      }
    ]
  },
  {
    model: AlianzasContactosModel,
    as: 'contacto_principal',
    required: false
  },
  {
    model: UsersModel,
    as: 'staff_responsable',
    required: false,
    attributes: SAFE_USER_ATTRIBUTES
  },
  {
    model: UsersModel,
    as: 'creado_por',
    required: false,
    attributes: SAFE_USER_ATTRIBUTES
  },
  {
    model: UsersModel,
    as: 'actualizado_por',
    required: false,
    attributes: SAFE_USER_ATTRIBUTES
  },
  {
    model: AlianzasOportunidadEspaciosModel,
    as: 'espacios_contratados',
    required: false,
    include: [
      {
        model: AlianzasEspaciosModel,
        as: 'espacio',
        required: false
      }
    ]
  },
  {
    model: AlianzasNotasModel,
    as: 'notas',
    required: false,
    include: [
      {
        model: UsersModel,
        as: 'usuario',
        required: false,
        attributes: SAFE_USER_ATTRIBUTES
      }
    ]
  }
];

// Benjamin Orellana - 2026/04/13 - Valida consistencia mínima del payload de oportunidad.
const validarPayloadOportunidad = async ({
  empresa_id,
  contacto_principal_id,
  fecha_inicio,
  fecha_fin
}) => {
  if (!empresa_id) {
    return 'empresa_id es requerido';
  }

  const empresa = await AlianzasEmpresasModel.findByPk(empresa_id);
  if (!empresa) {
    return 'La empresa indicada no existe';
  }

  if (contacto_principal_id) {
    const contacto = await AlianzasContactosModel.findByPk(
      contacto_principal_id
    );
    if (!contacto) {
      return 'El contacto_principal_id indicado no existe';
    }

    if (Number(contacto.empresa_id) !== Number(empresa_id)) {
      return 'El contacto principal no pertenece a la empresa indicada';
    }
  }

  if (
    fecha_inicio &&
    fecha_fin &&
    new Date(fecha_inicio) > new Date(fecha_fin)
  ) {
    return 'fecha_fin no puede ser anterior a fecha_inicio';
  }

  return null;
};

/* ===========================
 * CRUD + Especiales
 * =========================== */

// Benjamin Orellana - 2026/04/13 - Obtiene oportunidades con filtros operativos para staff.
export const OBRS_AlianzasOportunidades_CTS = async (req, res) => {
  try {
    const {
      q,
      empresa_id,
      estado,
      tipo_relacion,
      origen,
      staff_responsable_id,
      creado_desde_publico
    } = req.query;

    const whereClause = {};

    if (empresa_id) whereClause.empresa_id = empresa_id;
    if (estado) whereClause.estado = estado;
    if (tipo_relacion) whereClause.tipo_relacion = tipo_relacion;
    if (origen) whereClause.origen = origen;
    if (staff_responsable_id)
      whereClause.staff_responsable_id = staff_responsable_id;

    const creadoDesdePublicoTinyInt =
      parseBooleanToTinyInt(creado_desde_publico);
    if (creadoDesdePublicoTinyInt !== null) {
      whereClause.creado_desde_publico = creadoDesdePublicoTinyInt;
    }

    if (q && String(q).trim() !== '') {
      const qTrim = String(q).trim();

      whereClause[Op.or] = [
        { titulo: { [Op.like]: `%${qTrim}%` } },
        { mensaje_inicial: { [Op.like]: `%${qTrim}%` } },
        { '$empresa.razon_social$': { [Op.like]: `%${qTrim}%` } },
        { '$empresa.nombre_fantasia$': { [Op.like]: `%${qTrim}%` } },
        { '$contacto_principal.nombre$': { [Op.like]: `%${qTrim}%` } },
        { '$contacto_principal.apellido$': { [Op.like]: `%${qTrim}%` } }
      ];
    }

    const registros = await AlianzasOportunidadesModel.findAll({
      where: whereClause,
      include: buildBasicIncludes(),
      order: [
        ['fecha_proxima_accion', 'ASC'],
        ['created_at', 'DESC']
      ]
    });

    res.json(registros);
  } catch (error) {
    console.error('Error al obtener oportunidades:', error);
    res.status(500).json({ mensajeError: 'Error al obtener oportunidades' });
  }
};

// Benjamin Orellana - 2026/04/13 - Obtiene una oportunidad simple por ID.
export const OBR_AlianzasOportunidades_CTS = async (req, res) => {
  try {
    const registro = await AlianzasOportunidadesModel.findByPk(req.params.id, {
      include: buildBasicIncludes()
    });

    if (!registro) {
      return res
        .status(404)
        .json({ mensajeError: 'Oportunidad no encontrada' });
    }

    res.json(registro);
  } catch (error) {
    console.error('Error al obtener oportunidad:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// Benjamin Orellana - 2026/04/13 - Obtiene el detalle ampliado de una oportunidad con empresa, contactos, espacios y notas.
export const OBR_Detalle_AlianzasOportunidades_CTS = async (req, res) => {
  try {
    const registro = await AlianzasOportunidadesModel.findByPk(req.params.id, {
      include: buildDetailIncludes(),
      order: [
        [
          {
            model: AlianzasOportunidadEspaciosModel,
            as: 'espacios_contratados'
          },
          'created_at',
          'ASC'
        ],
        [{ model: AlianzasNotasModel, as: 'notas' }, 'created_at', 'DESC']
      ]
    });

    if (!registro) {
      return res
        .status(404)
        .json({ mensajeError: 'Oportunidad no encontrada' });
    }

    res.json(registro);
  } catch (error) {
    console.error('Error al obtener detalle de oportunidad:', error);
    res
      .status(500)
      .json({ mensajeError: 'Error al obtener detalle de oportunidad' });
  }
};

// Benjamin Orellana - 2026/04/13 - Crea una oportunidad interna vinculada a una empresa existente.
export const CR_AlianzasOportunidades_CTS = async (req, res) => {
  try {
    const actorUserId = getActorUserId(req);

    const datos = {
      empresa_id: req.body.empresa_id,
      contacto_principal_id: req.body.contacto_principal_id || null,
      staff_responsable_id: req.body.staff_responsable_id || null,
      tipo_relacion: req.body.tipo_relacion || 'publicidad',
      origen: req.body.origen || 'staff',
      estado: req.body.estado || 'nuevo',
      titulo: cleanNullableString(req.body.titulo),
      mensaje_inicial: cleanNullableString(req.body.mensaje_inicial),
      beneficios_ofrecidos: cleanNullableString(req.body.beneficios_ofrecidos),
      observaciones_internas: cleanNullableString(
        req.body.observaciones_internas
      ),
      fecha_primer_contacto: req.body.fecha_primer_contacto || null,
      fecha_proxima_accion: req.body.fecha_proxima_accion || null,
      fecha_inicio: req.body.fecha_inicio || null,
      fecha_fin: req.body.fecha_fin || null,
      monto_estimado: req.body.monto_estimado ?? null,
      moneda: req.body.moneda || 'ARS',
      logo_aprobado:
        parseBooleanToTinyInt(req.body.logo_aprobado) !== null
          ? parseBooleanToTinyInt(req.body.logo_aprobado)
          : 0,
      contrato_firmado:
        parseBooleanToTinyInt(req.body.contrato_firmado) !== null
          ? parseBooleanToTinyInt(req.body.contrato_firmado)
          : 0,
      creado_desde_publico:
        parseBooleanToTinyInt(req.body.creado_desde_publico) !== null
          ? parseBooleanToTinyInt(req.body.creado_desde_publico)
          : 0,
      created_by: req.body.created_by || actorUserId || null,
      updated_by: req.body.updated_by || actorUserId || null
    };

    if (!datos.titulo) {
      return res.status(400).json({ mensajeError: 'titulo es requerido' });
    }

    const mensajeValidacion = await validarPayloadOportunidad(datos);
    if (mensajeValidacion) {
      return res.status(400).json({ mensajeError: mensajeValidacion });
    }

    const nuevoRegistro = await AlianzasOportunidadesModel.create(datos);

    const registroCreado = await AlianzasOportunidadesModel.findByPk(
      nuevoRegistro.id,
      {
        include: buildBasicIncludes()
      }
    );

    res.json({
      message: 'Oportunidad creada correctamente',
      registroCreado
    });
  } catch (error) {
    console.error('Error al crear oportunidad:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// Benjamin Orellana - 2026/04/13 - Actualiza una oportunidad por ID manteniendo validaciones de consistencia.
export const UR_AlianzasOportunidades_CTS = async (req, res) => {
  try {
    const { id } = req.params;
    const actorUserId = getActorUserId(req);

    const existente = await AlianzasOportunidadesModel.findByPk(id);

    if (!existente) {
      return res
        .status(404)
        .json({ mensajeError: 'Oportunidad no encontrada' });
    }

    const datosActualizar = {
      empresa_id: req.body.empresa_id ?? existente.empresa_id,
      contacto_principal_id:
        req.body.contacto_principal_id !== undefined
          ? req.body.contacto_principal_id || null
          : existente.contacto_principal_id,
      staff_responsable_id:
        req.body.staff_responsable_id !== undefined
          ? req.body.staff_responsable_id || null
          : existente.staff_responsable_id,
      tipo_relacion: req.body.tipo_relacion ?? existente.tipo_relacion,
      origen: req.body.origen ?? existente.origen,
      estado: req.body.estado ?? existente.estado,
      titulo:
        req.body.titulo !== undefined
          ? cleanNullableString(req.body.titulo)
          : existente.titulo,
      mensaje_inicial:
        req.body.mensaje_inicial !== undefined
          ? cleanNullableString(req.body.mensaje_inicial)
          : existente.mensaje_inicial,
      beneficios_ofrecidos:
        req.body.beneficios_ofrecidos !== undefined
          ? cleanNullableString(req.body.beneficios_ofrecidos)
          : existente.beneficios_ofrecidos,
      observaciones_internas:
        req.body.observaciones_internas !== undefined
          ? cleanNullableString(req.body.observaciones_internas)
          : existente.observaciones_internas,
      fecha_primer_contacto:
        req.body.fecha_primer_contacto !== undefined
          ? req.body.fecha_primer_contacto || null
          : existente.fecha_primer_contacto,
      fecha_proxima_accion:
        req.body.fecha_proxima_accion !== undefined
          ? req.body.fecha_proxima_accion || null
          : existente.fecha_proxima_accion,
      fecha_inicio:
        req.body.fecha_inicio !== undefined
          ? req.body.fecha_inicio || null
          : existente.fecha_inicio,
      fecha_fin:
        req.body.fecha_fin !== undefined
          ? req.body.fecha_fin || null
          : existente.fecha_fin,
      monto_estimado:
        req.body.monto_estimado !== undefined
          ? req.body.monto_estimado
          : existente.monto_estimado,
      moneda: req.body.moneda ?? existente.moneda,
      logo_aprobado:
        parseBooleanToTinyInt(req.body.logo_aprobado) !== null
          ? parseBooleanToTinyInt(req.body.logo_aprobado)
          : existente.logo_aprobado,
      contrato_firmado:
        parseBooleanToTinyInt(req.body.contrato_firmado) !== null
          ? parseBooleanToTinyInt(req.body.contrato_firmado)
          : existente.contrato_firmado,
      creado_desde_publico:
        parseBooleanToTinyInt(req.body.creado_desde_publico) !== null
          ? parseBooleanToTinyInt(req.body.creado_desde_publico)
          : existente.creado_desde_publico,
      updated_by: req.body.updated_by || actorUserId || existente.updated_by
    };

    if (!datosActualizar.titulo) {
      return res.status(400).json({ mensajeError: 'titulo es requerido' });
    }

    const mensajeValidacion = await validarPayloadOportunidad(datosActualizar);
    if (mensajeValidacion) {
      return res.status(400).json({ mensajeError: mensajeValidacion });
    }

    const [numFilasActualizadas] = await AlianzasOportunidadesModel.update(
      datosActualizar,
      {
        where: { id }
      }
    );

    if (numFilasActualizadas !== 1) {
      return res
        .status(404)
        .json({ mensajeError: 'Oportunidad no encontrada' });
    }

    const registroActualizado = await AlianzasOportunidadesModel.findByPk(id, {
      include: buildBasicIncludes()
    });

    res.json({
      message: 'Oportunidad actualizada correctamente',
      registroActualizado
    });
  } catch (error) {
    console.error('Error al actualizar oportunidad:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// Benjamin Orellana - 2026/04/13 - Elimina físicamente una oportunidad y sus registros dependientes por cascada.
export const ER_AlianzasOportunidades_CTS = async (req, res) => {
  try {
    const { id } = req.params;

    const filasEliminadas = await AlianzasOportunidadesModel.destroy({
      where: { id }
    });

    if (filasEliminadas === 0) {
      return res
        .status(404)
        .json({ mensajeError: 'Oportunidad no encontrada' });
    }

    res.json({ message: 'Oportunidad eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar oportunidad:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// Benjamin Orellana - 2026/04/13 - Registro público transaccional de empresa, contacto principal, oportunidad y espacios seleccionados.
export const CR_RegistroPublicoAlianzas_CTS = async (req, res) => {
  const transaction = await db.transaction();

  try {
    const actorUserId = getActorUserId(req);

    const razon_social = cleanNullableString(req.body.razon_social);
    const nombre_fantasia = cleanNullableString(req.body.nombre_fantasia);
    const cuit = cleanNullableString(req.body.cuit);
    const rubro = cleanNullableString(req.body.rubro);
    const telefono_empresa = cleanNullableString(req.body.telefono);
    const email_empresa = cleanNullableString(req.body.email);
    const sitio_web = cleanNullableString(req.body.sitio_web);
    const instagram = cleanNullableString(req.body.instagram);
    const facebook = cleanNullableString(req.body.facebook);
    const descripcion_empresa = cleanNullableString(
      req.body.descripcion_empresa
    );
    const ciudad = cleanNullableString(req.body.ciudad);
    const provincia = cleanNullableString(req.body.provincia);

    const contacto_nombre = cleanNullableString(req.body.contacto_nombre);
    const contacto_apellido = cleanNullableString(req.body.contacto_apellido);
    const contacto_cargo = cleanNullableString(req.body.contacto_cargo);
    const contacto_telefono =
      cleanNullableString(req.body.contacto_telefono) || telefono_empresa;
    const contacto_email =
      cleanNullableString(req.body.contacto_email) || email_empresa;

    const tipo_relacion = req.body.tipo_relacion || 'publicidad';
    const origen = req.body.origen || 'web';
    const mensaje_inicial = cleanNullableString(req.body.mensaje_inicial);
    const titulo =
      cleanNullableString(req.body.titulo) ||
      `Interés ${tipo_relacion} - ${nombre_fantasia || razon_social}`;

    const espacios_ids = Array.isArray(req.body.espacios_ids)
      ? req.body.espacios_ids
          .map((id) => Number(id))
          .filter((id) => !Number.isNaN(id))
      : [];

    if (!razon_social) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ mensajeError: 'razon_social es requerido' });
    }

    if (!contacto_nombre) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ mensajeError: 'contacto_nombre es requerido' });
    }

    if (!contacto_telefono && !contacto_email) {
      await transaction.rollback();
      return res.status(400).json({
        mensajeError:
          'Debe informar al menos contacto_telefono o contacto_email'
      });
    }

    let empresa = null;

    if (cuit) {
      empresa = await AlianzasEmpresasModel.findOne({
        where: { cuit },
        transaction,
        lock: transaction.LOCK.UPDATE
      });
    }

    if (!empresa) {
      empresa = await AlianzasEmpresasModel.create(
        {
          razon_social,
          nombre_fantasia,
          cuit,
          rubro,
          telefono: telefono_empresa,
          email: email_empresa,
          sitio_web,
          instagram,
          facebook,
          descripcion_empresa,
          ciudad,
          provincia,
          estado: 'activo'
        },
        { transaction }
      );
    } else {
      await empresa.update(
        {
          razon_social: empresa.razon_social || razon_social,
          nombre_fantasia: empresa.nombre_fantasia || nombre_fantasia,
          rubro: empresa.rubro || rubro,
          telefono: empresa.telefono || telefono_empresa,
          email: empresa.email || email_empresa,
          sitio_web: empresa.sitio_web || sitio_web,
          instagram: empresa.instagram || instagram,
          facebook: empresa.facebook || facebook,
          descripcion_empresa:
            empresa.descripcion_empresa || descripcion_empresa,
          ciudad: empresa.ciudad || ciudad,
          provincia: empresa.provincia || provincia
        },
        { transaction }
      );
    }

    await AlianzasContactosModel.update(
      { es_principal: 0 },
      {
        where: { empresa_id: empresa.id },
        transaction
      }
    );

    const contactoPrincipal = await AlianzasContactosModel.create(
      {
        empresa_id: empresa.id,
        nombre: contacto_nombre,
        apellido: contacto_apellido,
        cargo: contacto_cargo,
        telefono: contacto_telefono,
        email: contacto_email,
        es_principal: 1,
        observaciones: null
      },
      { transaction }
    );

    const oportunidad = await AlianzasOportunidadesModel.create(
      {
        empresa_id: empresa.id,
        contacto_principal_id: contactoPrincipal.id,
        staff_responsable_id: null,
        tipo_relacion,
        origen,
        estado: 'nuevo',
        titulo,
        mensaje_inicial,
        beneficios_ofrecidos: null,
        observaciones_internas: null,
        fecha_primer_contacto: null,
        fecha_proxima_accion: null,
        fecha_inicio: null,
        fecha_fin: null,
        monto_estimado: null,
        moneda: 'ARS',
        logo_aprobado: 0,
        contrato_firmado: 0,
        creado_desde_publico: 1,
        created_by: actorUserId || null,
        updated_by: actorUserId || null
      },
      { transaction }
    );

    if (espacios_ids.length > 0) {
      const espaciosValidos = await AlianzasEspaciosModel.findAll({
        where: {
          id: { [Op.in]: espacios_ids }
        },
        transaction
      });

      if (espaciosValidos.length !== espacios_ids.length) {
        await transaction.rollback();
        return res.status(400).json({
          mensajeError: 'Uno o más espacios_ids no existen'
        });
      }

      const payloadEspacios = espacios_ids.map((espacioId) => ({
        oportunidad_id: oportunidad.id,
        espacio_id: espacioId,
        modalidad: 'fijo',
        cantidad: 1,
        frecuencia: null,
        precio_unitario: null,
        descuento_pct: 0,
        precio_final: null,
        fecha_inicio: null,
        fecha_fin: null,
        beneficios_texto: null,
        observaciones: null,
        estado: 'propuesto'
      }));

      await AlianzasOportunidadEspaciosModel.bulkCreate(payloadEspacios, {
        transaction
      });
    }

    await transaction.commit();

    const detalleCreado = await AlianzasOportunidadesModel.findByPk(
      oportunidad.id,
      {
        include: buildDetailIncludes(),
        order: [
          [
            {
              model: AlianzasOportunidadEspaciosModel,
              as: 'espacios_contratados'
            },
            'created_at',
            'ASC'
          ],
          [{ model: AlianzasNotasModel, as: 'notas' }, 'created_at', 'DESC']
        ]
      }
    );

    res.json({
      message: 'Registro público de alianza creado correctamente',
      detalleCreado
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al registrar alianza pública:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};
