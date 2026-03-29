import dotenv from 'dotenv';
import db from '../DataBase/db.js';
import { DataTypes } from 'sequelize';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

export const HorariosPilatesModel = db.define(
  'horarios_pilates',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    dia_semana: {
      type: DataTypes.ENUM('Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'),
      allowNull: false
    },
    hora_inicio: {
      type: DataTypes.TIME,
      allowNull: false
    },
    id_instructor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios_pilates',
        key: 'id'
      }
    }
  },
  {
    timestamps: false,
    tableName: 'horarios_pilates'
  }
);

export default HorariosPilatesModel;
