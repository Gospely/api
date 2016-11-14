var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
	const dbs = sequelize.define("gospel_dbs", {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true
		},
		application: DataTypes.STRING,
		password: DataTypes.STRING,
		type: DataTypes.STRING,
		docker: DataTypes.STRING,
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
	return dbs;
}
