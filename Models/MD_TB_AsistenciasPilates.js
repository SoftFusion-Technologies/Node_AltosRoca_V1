import { DataTypes } from "sequelize";
import db from "../DataBase/db.js";
import dotenv from "dotenv";
import InscripcionesPilatesModel from "./MD_TB_InscripcionesPilates.js";

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const AsistenciasPilatesModel = db.define(
  "asistencias_pilates",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    id_inscripcion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "inscripciones_pilates",
        key: "id",
      },
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    presente: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "asistencias_pilates",
    timestamps: false,
  }
);

// Asociación: cada asistencia pertenece a una inscripción
AsistenciasPilatesModel.belongsTo(InscripcionesPilatesModel, {
  foreignKey: "id_inscripcion",
  as: "inscripcion",
});

export default AsistenciasPilatesModel;
