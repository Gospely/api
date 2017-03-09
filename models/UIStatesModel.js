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
      delete: function*(item) {
        item.destroy({
          force: false,
          logging: true
        });
    },
    }
  });
  return state;
}
