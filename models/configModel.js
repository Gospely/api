var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  const config = sequelize.define("gospel_configs", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: DataTypes.STRING,
    appid: DataTypes.STRING,
    appsecret: DataTypes.STRING,
    accessToken: {
      type: DataTypes.STRING,
      field: "access_token"
    },
    createat:{
        type: DataTypes.DATE,
        defaultValue: new Date()
    },
    updateat: {
        type: DataTypes.DATE,
        defaultValue: new Date()
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
      },
      isBind: function*(user) {

      }
    }
  });
  return config;
}
