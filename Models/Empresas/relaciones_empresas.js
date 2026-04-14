/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 13 / 04 / 2026
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo centraliza las relaciones Sequelize del módulo de alianzas,
 * empresas, contactos, oportunidades, espacios y notas.
 *
 * Tema: Asociaciones Sequelize - Módulo Empresas / Alianzas
 *
 * Capa: Backend
 */

// Importación de modelos del módulo Empresas
import AlianzasEmpresasModel from './MD_TB_AlianzasEmpresas.js';
import AlianzasContactosModel from './MD_TB_AlianzasContactos.js';
import AlianzasOportunidadesModel from './MD_TB_AlianzasOportunidades.js';
import AlianzasEspaciosModel from './MD_TB_AlianzasEspacios.js';
import AlianzasOportunidadEspaciosModel from './MD_TB_AlianzasOportunidadEspacios.js';
import AlianzasNotasModel from './MD_TB_AlianzasNotas.js';

// Importación de modelo de usuarios
import UsersModel from '../Core/MD_TB_Users.js';

let relacionesEmpresasInicializadas = false;

// Benjamin Orellana - 2026/04/13 - Centraliza e inicializa las relaciones Sequelize del módulo Empresas / Alianzas.
const initEmpresasRelaciones = () => {
  if (relacionesEmpresasInicializadas) return;

  /* ===========================
   * EMPRESAS ↔ CONTACTOS
   * =========================== */
  AlianzasEmpresasModel.hasMany(AlianzasContactosModel, {
    foreignKey: 'empresa_id',
    as: 'contactos',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  AlianzasContactosModel.belongsTo(AlianzasEmpresasModel, {
    foreignKey: 'empresa_id',
    as: 'empresa'
  });

  /* ===========================
   * EMPRESAS ↔ OPORTUNIDADES
   * =========================== */
  AlianzasEmpresasModel.hasMany(AlianzasOportunidadesModel, {
    foreignKey: 'empresa_id',
    as: 'oportunidades',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  AlianzasOportunidadesModel.belongsTo(AlianzasEmpresasModel, {
    foreignKey: 'empresa_id',
    as: 'empresa'
  });

  /* ==========================================
   * CONTACTO PRINCIPAL ↔ OPORTUNIDADES
   * ========================================== */
  AlianzasContactosModel.hasMany(AlianzasOportunidadesModel, {
    foreignKey: 'contacto_principal_id',
    as: 'oportunidades_como_contacto_principal',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });

  AlianzasOportunidadesModel.belongsTo(AlianzasContactosModel, {
    foreignKey: 'contacto_principal_id',
    as: 'contacto_principal'
  });

  /* ==========================================
   * STAFF RESPONSABLE / AUDITORÍA ↔ OPORTUNIDADES
   * ========================================== */
  UsersModel.hasMany(AlianzasOportunidadesModel, {
    foreignKey: 'staff_responsable_id',
    as: 'oportunidades_asignadas',
    constraints: false
  });

  AlianzasOportunidadesModel.belongsTo(UsersModel, {
    foreignKey: 'staff_responsable_id',
    as: 'staff_responsable',
    constraints: false
  });

  UsersModel.hasMany(AlianzasOportunidadesModel, {
    foreignKey: 'created_by',
    as: 'oportunidades_creadas',
    constraints: false
  });

  AlianzasOportunidadesModel.belongsTo(UsersModel, {
    foreignKey: 'created_by',
    as: 'creado_por',
    constraints: false
  });

  UsersModel.hasMany(AlianzasOportunidadesModel, {
    foreignKey: 'updated_by',
    as: 'oportunidades_actualizadas',
    constraints: false
  });

  AlianzasOportunidadesModel.belongsTo(UsersModel, {
    foreignKey: 'updated_by',
    as: 'actualizado_por',
    constraints: false
  });

  /* ==========================================
   * OPORTUNIDADES ↔ ESPACIOS CONTRATADOS
   * ========================================== */
  AlianzasOportunidadesModel.hasMany(AlianzasOportunidadEspaciosModel, {
    foreignKey: 'oportunidad_id',
    as: 'espacios_contratados',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  AlianzasOportunidadEspaciosModel.belongsTo(AlianzasOportunidadesModel, {
    foreignKey: 'oportunidad_id',
    as: 'oportunidad'
  });

  /* ==========================================
   * ESPACIOS ↔ OPORTUNIDADES_ESPACIOS
   * ========================================== */
  AlianzasEspaciosModel.hasMany(AlianzasOportunidadEspaciosModel, {
    foreignKey: 'espacio_id',
    as: 'oportunidades_espacios',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  });

  AlianzasOportunidadEspaciosModel.belongsTo(AlianzasEspaciosModel, {
    foreignKey: 'espacio_id',
    as: 'espacio'
  });

  /* ==========================================
   * OPORTUNIDADES ↔ NOTAS
   * ========================================== */
  AlianzasOportunidadesModel.hasMany(AlianzasNotasModel, {
    foreignKey: 'oportunidad_id',
    as: 'notas',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  AlianzasNotasModel.belongsTo(AlianzasOportunidadesModel, {
    foreignKey: 'oportunidad_id',
    as: 'oportunidad'
  });

  /* ==========================================
   * USUARIOS ↔ NOTAS
   * ========================================== */
  UsersModel.hasMany(AlianzasNotasModel, {
    foreignKey: 'usuario_id',
    as: 'notas_alianzas',
    constraints: false
  });

  AlianzasNotasModel.belongsTo(UsersModel, {
    foreignKey: 'usuario_id',
    as: 'usuario',
    constraints: false
  });

  relacionesEmpresasInicializadas = true;
};

export default initEmpresasRelaciones;
