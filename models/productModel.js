var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes){
    const product = sequelize.define("gospel_products", {
			id: {
				type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4 ,
				primaryKey: true
			},
	    name: DataTypes.STRING,
      price: DataTypes.DOUBLE,
      defaultDisk: { type: DataTypes.DOUBLE, field: "default_disk", defaultValue: 0 },
      parent: DataTypes.STRING,
      peopleLimit: { type: DataTypes.INTEGER, field: "people_limit", defaultValue: 0 },
      format: DataTypes.STRING,
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
