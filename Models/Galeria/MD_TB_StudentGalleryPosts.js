/*
 * Programador: Benjamin Orellana
 * Fecha creación: 14/04/2026
 * Versión: 1.0
 * Descripción: Modelo Sequelize para publicaciones de galería social moderada de alumnos.
 * Tema: Galería de alumnos / Altos Roca
 * Capa: Modelo
 */

import { DataTypes } from 'sequelize';
import db from '../../DataBase/db.js';

/* Benjamin Orellana - 2026/04/14 - Modelo principal de publicaciones de galería de alumnos. */
const StudentGalleryPostsModel = db.define(
  'student_gallery_posts',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    student_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado', 'archivado'),
      allowNull: false,
      defaultValue: 'pendiente'
    },
    tipo_publicacion: {
      type: DataTypes.ENUM('foto', 'video', 'mixto'),
      allowNull: false,
      defaultValue: 'foto'
    },
    template_codigo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'altos-roca-classic'
    },
    mostrar_nombre: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    mostrar_fecha: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    mostrar_en_home: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    destacada: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    orden_home: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    consentimiento_publico: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    fecha_consentimiento: {
      type: DataTypes.DATE,
      allowNull: true
    },
    canal_carga: {
      type: DataTypes.ENUM('staff', 'alumno', 'link_publico'),
      allowNull: false,
      defaultValue: 'staff'
    },
    creado_por_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true
    },
    revisado_por_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true
    },
    fecha_revision: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fecha_publicacion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    motivo_rechazo: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: 'student_gallery_posts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default StudentGalleryPostsModel;
