var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
	const dbs = sequelize.define("gospel_dbs", {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true
		},
		application: DataTypes.STRING,
		port: DataTypes.STRING,
		name: DataTypes.STRING,
		password: DataTypes.STRING,
		type: DataTypes.STRING,
		docker: DataTypes.STRING,
		creator: DataTypes.STRING,
		httpPort: {
			type: DataTypes,
			field: 'http_port'
		},
		description: DataTypes.STRING,
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
	return dbs;
}
