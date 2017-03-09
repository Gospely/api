var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  const host = sequelize.define("gospel_hosts", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    ip: DataTypes.STRING,
    domain: DataTypes.STRING,
    priority: DataTypes.STRING,
    share: DataTypes.BOOLEAN,
    type: DataTypes.STRING,
    createat:{
        type: DataTypes.DATE,
    },
    updateat: {
        type: DataTypes.DATE,
    },
    isDeleted: {
      type: DataTypes.INTEGER,
      field: "isdeleted",
      defaultValue: 0
    }
  }, {
    timestamps: false,
    createdAt: 'createat',
    updatedAt: 'updateat',
    classMethods: {
      associate: (models) => {

      }
    }
  });
  return host;
}
