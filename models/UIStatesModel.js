var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  const state = sequelize.define("gospel_uistates", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    application: DataTypes.STRING,
    creator: DataTypes.STRING,
    dySave: {
			type: DataTypes.BOOLEAN,
			field: 'dysave',
			defaultValue: true
		},
		gap: {
			type: DataTypes.INTEGER,
			defaultValue: 500000
		},
		configs: DataTypes.STRING,
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
  return state;
}
