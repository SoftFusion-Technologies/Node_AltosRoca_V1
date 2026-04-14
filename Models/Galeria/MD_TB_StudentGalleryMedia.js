/*
 * Programador: Benjamin Orellana
 * Fecha creación: 14/04/2026
 * Versión: 1.0
 * Descripción: Modelo Sequelize para archivos multimedia asociados a publicaciones de galería de alumnos.
 * Tema: Galería de alumnos / Altos Roca
 * Capa: Modelo
 */

import { DataTypes } from 'sequelize';
import db from '../../DataBase/db.js';

/* Benjamin Orellana - 2026/04/14 - Modelo de medios adjuntos a cada publicación de galería. */
const StudentGalleryMediaModel = db.define(
  'student_gallery_media',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    post_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    tipo_archivo: {
      type: DataTypes.ENUM('imagen', 'video'),
      allowNull: false,
      defaultValue: 'imagen'
    },
    archivo_url: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    thumbnail_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    archivo_nombre_original: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    mime_type: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    peso_bytes: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true
    },
    ancho: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    alto: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    duracion_segundos: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    orden: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    es_portada: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    estado: {
      type: DataTypes.ENUM('activo', 'eliminado'),
      allowNull: false,
      defaultValue: 'activo'
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
    tableName: 'student_gallery_media',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default StudentGalleryMediaModel;
