import UsersModel from './MD_TB_Users.js';
import RoutinesModel from './MD_TB_Routines.js';
import RoutineExercisesModel from './MD_TB_RoutineExercises.js';

// Asociación usuario-instructor y rutinas
UsersModel.hasMany(RoutinesModel, {
  foreignKey: 'instructor_id',
  as: 'routines'
});
RoutinesModel.belongsTo(UsersModel, {
  foreignKey: 'instructor_id',
  as: 'instructor'
});

// Rutina y ejercicios de rutina
RoutinesModel.hasMany(RoutineExercisesModel, {
  foreignKey: 'routine_id',
  as: 'exercises'
});
RoutineExercisesModel.belongsTo(RoutinesModel, {
  foreignKey: 'routine_id',
  as: 'routine'
});
