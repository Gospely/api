var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  const templates = sequelize.define("gospel_templates", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    content: DataTypes.STRING,
    creator: DataTypes.STRING,
    type: {
      type: DataTypes.STRING,
      field: "t_type"
    },
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
      },
      isBind: function*(user) {

      }
    }
  });
  return templates;
}
