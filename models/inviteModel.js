var Sequelize = require("sequelize");
module.exports = function(sequelize, DataTypes) {
  const invite = sequelize.define("gospel_invites", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    code: DataTypes.STRING,
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
  return invite;
}
