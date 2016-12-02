var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  const image = sequelize.define("gospel_images", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    label: DataTypes.INTEGER,
    git: DataTypes.STRING,
    dockerfile: DataTypes.STRING,
    type: DataTypes.INTEGER,
    parent: DataTypes.STRING,
    devType: {
      type: DataTypes.STRING,
      field: 'dev_type',
      defaultValue: 'common' //common | visual
    },
    debugType: {
      type: DataTypes.STRING,
      field: 'debug_type',
      defaultValue: 'common' //common | shell
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
  return image;
}
