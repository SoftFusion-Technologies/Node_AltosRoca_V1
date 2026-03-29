import { DataTypes } from "sequelize";
import db from "../DataBase/db.js";

const ListaEsperaPilates = db.define(
  "lista_espera_pilates",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    contacto: {
      type: DataTypes.STRING(100),
    },
    tipo: {
      type: DataTypes.ENUM("Espera", "Cambio de turno"),
      allowNull: false,
    },
    plan_interes: {
      type: DataTypes.ENUM(
        "LUNES",
        "MARTES",
        "MIÉRCOLES",
        "JUEVES",
        "VIERNES",
        "SÁBADO",
        "CUALQUIER DIA"
      ),
      allowNull: false,
    },
    horarios_preferidos: {
      type: DataTypes.STRING(255),
    },
    observaciones: {
      type: DataTypes.TEXT,
    },
    fecha_carga: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }
  },
  {
    tableName: "lista_espera_pilates",
    timestamps: false,
  }
);

ListaEsperaPilates.associate = (models) => {
  ListaEsperaPilates.hasMany(models.contactos_lista_espera_pilates, {
    foreignKey: "id_lista_espera",
    as: "contactos",
  });
};

export default ListaEsperaPilates;
