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
    volume: {
      type: DataTypes.STRING,
      defaultValue: '10'
    },
    unit: {
      type: DataTypes.STRING,
      defaultValue: 'G'
    },
    expireAt: {
      type: DataTypes.DATE,
      field: "expireat"
    },
    isDeleted: {
      type: DataTypes.INTEGER,
      field: "isdeleted",
      defaultValue: 0
    }
  }, {
    timestamps: true,
    createdAt: 'createat',
    updatedAt: 'updateat',
    classMethods: {
      associate: (models) => {
        console.log("associate");
      }
    }
  });
  return ide;
}
