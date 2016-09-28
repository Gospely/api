var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes){
    const volume = sequelize.define("gospel_volumes", {
			id: {
				type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
				primaryKey: true
			},
	    name: DataTypes.STRING,
      creator: DataTypes.STRING,
      size: DataTypes.INTEGER,
      unit: DataTypes.STRING,
      product: DataTypes.STRING,
      isDeleted: { type: DataTypes.INTEGER, field: "isdeleted", defaultValue: 0 }
	  },{
			timestamps: true,
      createdAt: 'createat',
      updatedAt: 'updateat',
      classMethods:{
          associate: (models) => {
                      console.log("associate");
                  }
      }
    });
    return volume;
}
