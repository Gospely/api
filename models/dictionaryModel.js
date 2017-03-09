var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  const dictionary = sequelize.define("gospel_dictionarys", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    key: DataTypes.STRING,
    value: DataTypes.STRING,
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
  return dictionary;
}
