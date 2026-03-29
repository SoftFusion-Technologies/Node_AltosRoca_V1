import dotenv from 'dotenv';
import db from '../DataBase/db.js';
import { DataTypes } from 'sequelize';
import ClientesPilatesModel from './MD_TB_ClientesPilates.js';
import HorariosPilatesModel from './MD_TB_HorariosPilates.js';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

export const InscripcionesPilatesModel = db.define(
  'inscripciones_pilates',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_cliente: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_horario: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fecha_inscripcion: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  },
  {
    timestamps: false,
    tableName: 'inscripciones_pilates'
  }
);

InscripcionesPilatesModel.belongsTo(ClientesPilatesModel, { foreignKey: 'id_cliente', as: 'cliente' });
InscripcionesPilatesModel.belongsTo(HorariosPilatesModel, { foreignKey: 'id_horario', as: 'horario' });

export default InscripcionesPilatesModel;
