import db from "../DataBase/db.js";
import { DataTypes } from "sequelize";

export const ContactosListaEsperaPilatesModel = db.define(
  "contactos_lista_espera_pilates",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_lista_espera: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "lista_espera_pilates",
        key: "id",
      },
    },
    id_usuario_contacto: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    fecha_contacto: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    estado_contacto: {
      type: DataTypes.ENUM("Confirmado", "Rechazado/Sin Respuesta", "Pendiente"),
      allowNull: false,
    },
    notas: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: "contactos_lista_espera_pilates",
  }
);

ContactosListaEsperaPilatesModel.associate = (models) => {
  ContactosListaEsperaPilatesModel.belongsTo(models.lista_espera_pilates, {
    foreignKey: "id_lista_espera",
    as: "persona_espera",
  });
  ContactosListaEsperaPilatesModel.belongsTo(models.users, {
    foreignKey: "id_usuario_contacto",
    as: "usuario_autor",
  });
};

export default ContactosListaEsperaPilatesModel;
