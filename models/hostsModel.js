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
        defaultValue: new Date(Date.now() + (8 * 60 * 60 * 1000))
    },
    updateat: {
        type: DataTypes.DATE,
        defaultValue: new Date(Date.now() + (8 * 60 * 60 * 1000))
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
