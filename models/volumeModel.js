var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  const volume = sequelize.define("gospel_volumes", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: DataTypes.STRING,
    creator: DataTypes.STRING,
    size: DataTypes.INTEGER,
    rest: DataTypes.DOUBLE,
    type: DataTypes.STRING,
    link: DataTypes.STRING,
    unit: DataTypes.STRING,
    product: DataTypes.STRING,
    expireAt: {
      type: DataTypes.STRING,
      field: "expireat"
    },
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
  return volume;
}
