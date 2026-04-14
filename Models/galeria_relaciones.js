/*
 * Programador: Benjamin Orellana
 * Fecha creación: 14/04/2026
 * Versión: 1.0
 * Descripción: Relaciones Sequelize del módulo de galería social moderada de alumnos.
 * Tema: Galería de alumnos / Altos Roca
 * Capa: Relaciones
 */

import StudentGalleryPostsModel from './Galeria/MD_TB_StudentGalleryPosts.js';
import StudentGalleryMediaModel from './Galeria/MD_TB_StudentGalleryMedia.js';
import StudentsModel from './MD_TB_Students.js';
import UsersModel from './Core/MD_TB_Users.js';

/* Benjamin Orellana - 2026/04/14 - Inicializa relaciones del módulo de galería de alumnos. */
const initGaleriaRelaciones = () => {
  /* Publicación -> Alumno */
  StudentGalleryPostsModel.belongsTo(StudentsModel, {
    foreignKey: 'student_id',
    as: 'student'
  });

  StudentsModel.hasMany(StudentGalleryPostsModel, {
    foreignKey: 'student_id',
    as: 'gallery_posts'
  });

  /* Publicación -> Usuario creador */
  StudentGalleryPostsModel.belongsTo(UsersModel, {
    foreignKey: 'creado_por_user_id',
    as: 'creado_por'
  });

  UsersModel.hasMany(StudentGalleryPostsModel, {
    foreignKey: 'creado_por_user_id',
    as: 'gallery_posts_creados'
  });

  /* Publicación -> Usuario revisor */
  StudentGalleryPostsModel.belongsTo(UsersModel, {
    foreignKey: 'revisado_por_user_id',
    as: 'revisado_por'
  });

  UsersModel.hasMany(StudentGalleryPostsModel, {
    foreignKey: 'revisado_por_user_id',
    as: 'gallery_posts_revisados'
  });

  /* Publicación -> Medios */
  StudentGalleryPostsModel.hasMany(StudentGalleryMediaModel, {
    foreignKey: 'post_id',
    as: 'media'
  });

  StudentGalleryMediaModel.belongsTo(StudentGalleryPostsModel, {
    foreignKey: 'post_id',
    as: 'post'
  });
};

export default initGaleriaRelaciones;
