var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  const operate = sequelize.define("gospel_operations", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    type: DataTypes.STRING,
    creator: DataTypes.STRING,
    result: DataTypes.STRING,
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
      }
    }
  });
  return operate;
}
