var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
	const count = sequelize.define("gospel_counts", {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true
		},
		userId: DataTypes.STRING,
		isDeleted: {
			type: DataTypes.INTEGER,
			field: 'isdeleted',
			defaultValue: 0
		},
		downloadCount: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			field: 'download_count'
		},

		packCount: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			field: 'pack_count'
		},

		application: DataTypes.STRING 

	});
	return count;
}

