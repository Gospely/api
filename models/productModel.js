var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes){
    const product = sequelize.define("gospel_products", {
			id: {
				type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
				primaryKey: true
			},
	    name: DataTypes.STRING,
      price: DataTypes.DOUBLE,
      parent: DataTypes.STRING,
      peopleLimit: { type: DataTypes.INTEGER, field: "people_limit", defaultValue: 0 },
      unit: DataTypes.STRING,
      defaultVolume: { type: DataTypes.STRING, field: "default_volume" },
      timeLength: { type: DataTypes.STRING, field: "time_length" },
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
    return product;
}
